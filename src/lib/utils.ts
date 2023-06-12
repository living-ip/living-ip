import type { SummarizedPullRequest } from '../types/types';
import { log, stringify } from './functions';

export const getTotalValue = (mergedPullRequests: Array<SummarizedPullRequest>, githubUser: string) => {
  return mergedPullRequests
    .map(pullRequest => {
      if (pullRequest.user !== githubUser) {
        return 0;
      }
      return pullRequest.value;
    })
    .reduce((array, value) => array + value, 0);
};
