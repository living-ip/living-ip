export interface SummarizedPullRequest {
  // These fields are available from the 'list pull requests' API
  id: number;
  pullNumber: number;
  apiURL: string;
  htmlURL: string;
  title: string;
  user: string;
  // These fields require a second request to the 'get pull request' API
  isMerged: boolean;
  updatedAt: number;
  mergedAt: number;
  value: number;
}

// Just the info we can get from the 'list pulls' API,
// without the additional request mentioned above
export type SummarizedPullRequestFromPullsAPI = Pick<
  SummarizedPullRequest,
  'id' | 'pullNumber' | 'apiURL' | 'htmlURL' | 'title' | 'user'
>;

// A full pull request object from the 'get pull request' API
export interface SummarizedPullRequestWithUserDetails extends SummarizedPullRequest {
  walletAddress: string;
  walletName: string | null;
  profilePicture: string | null;
}

export interface PullRequestWithVotes extends SummarizedPullRequestWithUserDetails {
  votes: Record<string, boolean>;
}

export type OAuthCredentials = {
  accessToken: string;
  tokenType: string;
  scope: string;
  repoOwner: string;
  repo: string;
};
