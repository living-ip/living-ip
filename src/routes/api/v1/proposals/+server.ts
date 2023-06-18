// https://kit.svelte.dev/docs/routing#server
import { asyncMap, log, stringify } from '$lib/functions';
import { getGithubUsername, getPullRequestsFromGitHub } from '$lib/get-pull-requests';
import { error as makeHTTPError, json as makeJSONResponse, redirect, type RequestHandler } from '@sveltejs/kit';
import type { Db } from 'mongodb';

import { REPO_OWNER, REPO } from '$lib/server-utils';
import { getTotalValue } from '$lib/utils';
import type { PullRequestWithVotes, SummarizedPullRequestWithUserDetails } from '../../../../types/types';

interface VoteStatus {
  pullRequestsWithVotes: Array<PullRequestWithVotes>;
  userPullRequestsWithVotes: Array<PullRequestWithVotes>;
  userMergedPullRequestWithVotes: Array<PullRequestWithVotes>;
  allUsersMergedPullRequestsWithVotes: Array<PullRequestWithVotes>;
  allUsersUnmergedPullRequestsWithVotes: Array<PullRequestWithVotes>;
  // TODO: rename, totaal *what* ?
  total: number;
}

// http://localhost:5173/api/v1/proposals?walletAddress=5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM&githubAccessToken=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  }

const getVoteStatus = async (githubAccessToken: string, database: Db, walletAddress: string): Promise<VoteStatus> => {
  const usersCollection = database.collection('users');
  const user = await usersCollection.findOne({ walletAddress });

  // Quickly check out github credentials are valid
  try {
    await getGithubUsername(githubAccessToken);
  } catch (thrownObject) {
    const error = thrownObject as Error;

    if (error.message.includes('Bad credentials')) {
      log('Github credentials are bad. We probably just need to get the user to renew the oauth');
      throw redirect(302, '/oauth');
    }
    throw error;
  }

  // Get PRs from GitHub
  let pullRequestsFromGithub = await getPullRequestsFromGitHub(githubAccessToken, REPO_OWNER, REPO);

  // Add relevant data from Solana
  const pullRequests = (await asyncMap(pullRequestsFromGithub, async pullRequest => {
    const summarizedPullRequestWithUserDetails: Partial<SummarizedPullRequestWithUserDetails> = pullRequest;
    const user = await usersCollection.findOne({ githubUsername: pullRequest.user });
    if (!user) {
      throw new Error(`No user found with githubUsername: ${pullRequest.user}`);
    }
    summarizedPullRequestWithUserDetails.walletAddress = user.walletAddress;
    summarizedPullRequestWithUserDetails.walletName = user.walletName;
    summarizedPullRequestWithUserDetails.profilePicture = user.profilePicture || null;
    return summarizedPullRequestWithUserDetails;
  })) as Array<SummarizedPullRequestWithUserDetails>;

  // Add votes from our own DB
  const pullRequestsWithVotes = (await asyncMap(pullRequests, async unmergedPullRequest => {
    const pullRequestWithVotes: Partial<PullRequestWithVotes> = unmergedPullRequest;
    const url = unmergedPullRequest.htmlURL;
    const proposal = await database.collection('proposals').findOne({ url });
    pullRequestWithVotes.votes = proposal?.votes || [];
    return pullRequestWithVotes;
  })) as Array<PullRequestWithVotes>;

  const userPullRequestsWithVotes: Array<PullRequestWithVotes> = pullRequestsWithVotes.filter(
    pullRequest => pullRequest.user === user.githubUsername,
  );

  const allUsersMergedPullRequestsWithVotes: Array<PullRequestWithVotes> = pullRequestsWithVotes.filter(
    pullRequest => pullRequest.isMerged,
  );

  const allUsersUnmergedPullRequestsWithVotes: Array<PullRequestWithVotes> = pullRequestsWithVotes.filter(
    pullRequest => !pullRequest.isMerged,
  );

  const userMergedPullRequestWithVotes: Array<PullRequestWithVotes> = allUsersMergedPullRequestsWithVotes.filter(
    pullRequest => pullRequest.user === user.githubUsername,
  );

  const total = getTotalValue(userMergedPullRequestWithVotes);

  return {
    pullRequestsWithVotes,
    userPullRequestsWithVotes,
    userMergedPullRequestWithVotes,
    allUsersMergedPullRequestsWithVotes,
    allUsersUnmergedPullRequestsWithVotes,
    total,
  };
};

// GET /api/v1/proposals
// Params
// - walletAddress
// - githubAccessToken
export const GET = (async event => {
  log(`Handling GET request to /api/v1/proposals`);

  const walletAddress = event.url.searchParams.get('walletAddress');
  if (!walletAddress) {
    throw makeHTTPError(400, `No walletAddress found in request.url.searchParams`);
  }

  const githubAccessToken = event.url.searchParams.get('githubAccessToken');
  if (!githubAccessToken) {
    throw makeHTTPError(400, `No githubAccessToken found in request.url.searchParams`);
  }

  const databaseOrNull = event.locals['database'] || null;
  if (!databaseOrNull) {
    throw new Error(`No database found in request.locals`);
  }
  const database = databaseOrNull as Db;

  // Start with GitHub
  const voteStatus = await getVoteStatus(githubAccessToken, database, walletAddress);

  return makeJSONResponse(voteStatus);
}) satisfies RequestHandler;

// POST /api/v1/proposals
// Body
// - direction,
// - url
// - currentUserWalletAddress
export const POST = (async event => {
  log(`Handling POST request to /api/v1/proposals`);
  const databaseOrNull = event.locals['database'] || null;
  if (!databaseOrNull) {
    throw new Error(`No database found in request.locals`);
  }
  const database = databaseOrNull as Db;

  // Yes requestEvent.request is real.
  // https://kit.svelte.dev/docs/types#public-types-requestevent
  const body = await event.request.json();

  // Use ?? deliberately because 'false' is a fine valie
  const direction = body?.direction ?? null;
  const url = body?.url || null;
  const currentUserWalletAddress = body?.currentUserWalletAddress || null;
  const githubAccessToken = body?.githubAccessToken || null;

  if (typeof direction !== 'boolean' || !url || !currentUserWalletAddress || !githubAccessToken) {
    throw makeHTTPError(400, `Missing required body params`);
  }

  log(`🗳️ Voting:`, {
    direction,
    url,
    currentUserWalletAddress,
    githubAccessToken,
  });

  let existingVotesItem = await database.collection('votes').findOne({
    url,
  });

  if (!existingVotesItem) {
    // TODO: create item
    const votesItemToCreate = {
      url,
      votes: {
        [currentUserWalletAddress]: direction,
      },
    };
    await database.collection('votes').insertOne(votesItemToCreate);

    const voteStatus = await getVoteStatus(githubAccessToken, database, currentUserWalletAddress);
    return makeJSONResponse(voteStatus);
  }

  // Change the vote
  existingVotesItem.votes[currentUserWalletAddress] = direction;

  await database.collection('votes').replaceOne(
    {
      url,
    },
    existingVotesItem,
  );

  return makeJSONResponse({});
}) satisfies RequestHandler;
