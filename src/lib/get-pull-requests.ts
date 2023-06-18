import { Octokit } from '@octokit/rest';
import type { GitHubAPIPullRequest } from '../types/github-api-pull-request';
import type { GitHubAPIDetailedPullRequest } from '../types/github-api-detailed-pull-request';
import { asyncMap, log } from './functions';
import type { SummarizedPullRequest, SummarizedPullRequestFromPullsAPI } from '../types/types';
const OK = 200;

const HEADERS = {
  'X-GitHub-Api-Version': '2022-11-28',
};

const dateStringToNumber = (dateString: string | null): number | null => {
  if (!dateString) {
    return null;
  }
  return new Date(dateString).valueOf();
};

const summarizePullRequest = async (
  octokit: Octokit,
  apiPullRequest: GitHubAPIPullRequest,
): Promise<SummarizedPullRequest> => {
  const summarizedPullRequestFromPullsAPI: SummarizedPullRequestFromPullsAPI = {
    id: apiPullRequest.id,
    pullNumber: apiPullRequest.number,
    apiURL: apiPullRequest.url,
    htmlURL: apiPullRequest.html_url,
    title: apiPullRequest.title,
    user: apiPullRequest.user.login,
  };

  const pullRequestDetailsResponse = await octokit.request(`GET ${summarizedPullRequestFromPullsAPI.apiURL}`, {
    owner: 'OWNER',
    repo: 'REPO',
    pull_number: summarizedPullRequestFromPullsAPI.pullNumber,
    headers: HEADERS,
  });

  if (pullRequestDetailsResponse.status !== OK) {
    throw new Error(`Bad response from GitHub: ${pullRequestDetailsResponse.status}`);
  }

  const pullRequestDetailsFromAPI = pullRequestDetailsResponse.data as GitHubAPIDetailedPullRequest;

  // Now add the additional fields from the second request

  const summarizedPullRequest: Partial<SummarizedPullRequest> = summarizedPullRequestFromPullsAPI;

  summarizedPullRequest.isMerged = pullRequestDetailsFromAPI.merged;
  summarizedPullRequest.updatedAt = dateStringToNumber(pullRequestDetailsFromAPI.updated_at);
  summarizedPullRequest.mergedAt = dateStringToNumber(pullRequestDetailsFromAPI.merged_at);
  summarizedPullRequest.value = pullRequestDetailsFromAPI.additions + pullRequestDetailsFromAPI.deletions;

  return summarizedPullRequest as SummarizedPullRequest;
};

export const getGithubUsername = async (githubAccessToken: string) => {
  if (!githubAccessToken) {
    throw new Error(`No GitHub access token provided`);
  }
  const octokit = new Octokit({
    auth: githubAccessToken,
  });

  const response = await octokit.request(`GET /user`, {
    headers: HEADERS,
  });

  if (response.status !== OK) {
    throw new Error(`Bad response from GitHub: ${response.status}`);
  }
  const githubUsername = response.data.login;
  return githubUsername;
};

export const getPullRequestsFromGitHub = async (githubAccessToken: string, repoOwner: string, repo: string) => {
  const octokit = new Octokit({
    auth: githubAccessToken,
  });

  // Octokit doesn't provide a 'listRullRequests()'!
  // https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests
  // So instead we have to use the 'request()' method
  // TODO: update if Occtokit gets less lame
  const response = await octokit.request(`GET /repos/${repoOwner}/${repo}/pulls`, {
    owner: 'OWNER',
    repo: 'REPO',
    headers: HEADERS,
    // By default this only shows open PRs
    state: 'all',
  });

  if (response.status !== OK) {
    throw new Error(`Bad response from GitHub: ${response.status}`);
  }

  if (!response.data.length) {
    log(`Oh no! No pull requests found!`);
    return [];
  }

  log(`Found ${response.data.length} pull requests`);

  const apiPullRequests = response.data as Array<GitHubAPIPullRequest>;

  const pullRequests = await asyncMap(apiPullRequests, async apiPullRequest => {
    return summarizePullRequest(octokit, apiPullRequest);
  });

  return pullRequests;
};
