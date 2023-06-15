<script lang="ts">
  import type { SummarizedPullRequest } from '../types/types';
  import ProgressBar from './ProgressBar.svelte';

  export let pullRequest: SummarizedPullRequest;
  export let tokenRewardPerValueUnit: number;
  export let symbol: string;

  // TODO: store in the DB (or in the blockchain)
  let voteCount: 3;
  let votesRequired: 5;

  const walletAddress = 'xxx';

  const walletName = 'xxx';
</script>

<div class="pull-request">
  <div class="user">
    <div class="profile-picture" />
    <div class="wallet-name">{walletName || walletAddress}</div>
  </div>
  <div class="name">
    <a href={`${pullRequest.htmlURL}/files`} target="_blank">
      {pullRequest.title}
    </a>
  </div>
  <div class="reward">
    Contribution: <strong>{pullRequest.value * tokenRewardPerValueUnit} {symbol}</strong>
  </div>
  <ProgressBar {voteCount} {votesRequired} />
</div>

<style>
  .pull-request {
    width: 100%;
    grid-auto-flow: row;
    justify-items: start;
    gap: 6px;
  }

  .user {
    grid-auto-flow: column;
    gap: 12px;
  }

  .profile-picture {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #e5e5e5;
  }

  .name {
    font-size: 24px;
    line-height: 36px;
  }

  .reward {
    font-size: 12px;
    line-height: 16px;
    grid-auto-flow: column;
  }
</style>
