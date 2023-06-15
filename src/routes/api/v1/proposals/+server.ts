// https://kit.svelte.dev/docs/routing#server
import { log, stringify } from '$lib/functions';
import { json, type RequestHandler } from '@sveltejs/kit';
import type {  Db }  from 'mongodb';

// export const GET = async function (({ database }) {
export const GET = ((request) => {
  log(`Handling GET request...`);

  const databaseOrNull = request.locals['database'] || null;
  if (!databaseOrNull) {
    throw new Error(`No database found in request.locals`);
  }

  const database = databaseOrNull as Db;

  log('database is', database);

  // const walletAddress = request.url.searchParams.get('walletAddress');
  // const accessToken = request.url.searchParams.get('githubAccessToken');

  // const usersCollection = database.collection('users');
  // const userDocument = usersCollection.findOne({ githubUsername });
 

  // const pullRequests = await getPullRequests(githubAccessToken, repoOwner, repo);
  // const userPullRequests = pullRequests.filter(pullRequest => pullRequest.user === githubUsername);
  // const mergedPullRequests = userPullRequests.filter(pullRequest => pullRequest.isMerged);
  // const unmergedPullRequests = userPullRequests.filter(pullRequest => !pullRequest.isMerged);
  // const total = getTotalValue(mergedPullRequests, githubUsername);

  // log(`Got credentials from github:`, stringify(credentials));

  return json({
    'hello': 'world'
  });
}) satisfies RequestHandler;
