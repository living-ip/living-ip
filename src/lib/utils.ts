import type { PullRequestWithVotes } from '../types/types';
import { log, stringify } from './functions';

export const getTotalValue = (userMergedPullRequests: Array<PullRequestWithVotes>) => {
  return userMergedPullRequests
    .map(pullRequest => {
      return pullRequest.value;
    })
    .reduce((array, value) => array + value, 0);
};
