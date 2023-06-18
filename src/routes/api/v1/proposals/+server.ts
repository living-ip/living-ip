// https://kit.svelte.dev/docs/routing#server
import { asyncMap, log, stringify } from '$lib/functions';
import { getGithubUsername, getPullRequestsFromGitHub } from '$lib/get-pull-requests';
import { error as makeHTTPError, json as makeJSONResponse, redirect, type RequestHandler } from '@sveltejs/kit';
import type { Db } from 'mongodb';

import { REPO_OWNER, REPO } from '$lib/server-utils';
import { getTotalValue } from '$lib/utils';
import type {
  PullRequestWithVotes,
  SummarizedPullRequest,
  SummarizedPullRequestWithUserDetails,
} from '../../../../types/types';

// http://localhost:5173/api/v1/proposals?walletAddress=5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM&githubAccessToken=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  }

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

  const usersCollection = database.collection('users');
  const user = await usersCollection.findOne({ walletAddress });

  try {
    await getGithubUsername(user.githubAccessToken);
  } catch (error) {
    if (error.message.includes('Bad credentials')) {
      throw makeHTTPError(400, `Invalid githubAccessToken: ${user.githubAccessToken}`);
    }
  }

  // Start with GitHub
  let pullRequestsFromGithub: SummarizedPullRequest[];
  try {
    pullRequestsFromGithub = await getPullRequestsFromGitHub(githubAccessToken, REPO_OWNER, REPO);
  } catch (thrownObject) {
    const error = thrownObject as Error;
    log('Github credentials are bad. we probably just need to get the user to renew the oauth');
    if (error.message.includes('Bad credentials')) {
      throw redirect(302, '/oauth');
    }
    throw error;
  }

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

  return makeJSONResponse({
    pullRequestsWithVotes,
    userPullRequestsWithVotes,
    userMergedPullRequestWithVotes,
    allUsersMergedPullRequestsWithVotes,
    allUsersUnmergedPullRequestsWithVotes,
    total,
  });
}) satisfies RequestHandler;
