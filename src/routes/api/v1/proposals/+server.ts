// https://kit.svelte.dev/docs/routing#server
import { asyncMap, log, stringify } from '$lib/functions';
import { getGithubUsername, getPullRequestsFromGitHub } from '$lib/get-pull-requests';
import { error as makeHTTPError, json as makeJSONResponse, type RequestHandler } from '@sveltejs/kit';
import type { Db } from 'mongodb';

import { REPO_OWNER, REPO } from '$lib/server-utils';
import { getTotalValue } from '$lib/utils';
import type { SummarizedPullRequestWithUserDetails } from '../../../../types/types';

// http://localhost:5173/api/v1/proposals?walletAddress=5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM&githubAccessToken=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  }

// GET /api/v1/proposals
// Params
// - walletAddress
// - githubAccessToken
export const GET = (async request => {
  log(`Handling GET request to /api/v1/proposals`);

  const walletAddress = request.url.searchParams.get('walletAddress');
  if (!walletAddress) {
    throw makeHTTPError(400, `No walletAddress found in request.url.searchParams`);
  }

  const githubAccessToken = request.url.searchParams.get('githubAccessToken');
  if (!githubAccessToken) {
    throw makeHTTPError(400, `No githubAccessToken found in request.url.searchParams`);
  }

  const databaseOrNull = request.locals['database'] || null;
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

  const pullRequestsFromGithub = await getPullRequestsFromGitHub(githubAccessToken, REPO_OWNER, REPO);

  // Add relevant data from Solana
  const pullRequests = (await asyncMap(pullRequestsFromGithub, async pullRequest => {
    const summarizedPullRequestWithUserDetails: Partial<SummarizedPullRequestWithUserDetails> = pullRequest;
    if (!pullRequest.isMerged) {
      const user = await usersCollection.findOne({ githubUsername: pullRequest.user });
      summarizedPullRequestWithUserDetails.walletAddress = user.walletAddress;
      summarizedPullRequestWithUserDetails.walletName = user.walletName;
      summarizedPullRequestWithUserDetails.profilePicture = user.profilePicture || null;
    }
    return summarizedPullRequestWithUserDetails;
  })) as Array<SummarizedPullRequestWithUserDetails>;

  const userPullRequests = pullRequests.filter(pullRequest => pullRequest.user === user.githubUsername);
  const mergedPullRequests = userPullRequests.filter(pullRequest => pullRequest.isMerged);
  const unmergedPullRequests = userPullRequests.filter(pullRequest => !pullRequest.isMerged);
  const total = getTotalValue(mergedPullRequests, user.githubUsername);

  return makeJSONResponse({
    userPullRequests,
    mergedPullRequests,
    unmergedPullRequests,
    total,
  });
}) satisfies RequestHandler;
