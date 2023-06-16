<script lang="ts">
  import type { SummarizedPullRequestWithUserDetails } from '../types/types';
  import ProgressBar from './ProgressBar.svelte';

  export let proposal: SummarizedPullRequestWithUserDetails;
  export let tokenRewardPerValueUnit: number;
  export let symbol: string;

  // TODO: store in the DB (or in the blockchain)
  let voteCount: 3;
  let votesRequired: 5;

  const walletAddress = proposal.walletAddress;

  const walletName = proposal.walletName;
</script>

<div class="pull-request">
  <div class="pull-request-details">
    <div class="user">
      {#if proposal.profilePicture}
        <img class="profile-picture" src={proposal.profilePicture} alt="profile" />
      {:else}
        <div class="profile-picture" />
      {/if}
      <div class="wallet-name">{walletName || walletAddress}</div>
    </div>
    <div class="name">
      <a href={`${proposal.htmlURL}/files`} target="_blank">
        {proposal.title}
      </a>
    </div>
    <div class="reward">
      Contribution: <strong>{proposal.value * tokenRewardPerValueUnit} {symbol}</strong>
    </div>
    <ProgressBar {voteCount} {votesRequired} />
  </div>
  <div class="voting">
    <button class="vote up" />
    <button class="vote down" />
  </div>
</div>

<style>
  .pull-request {
    width: 100%;
    grid-auto-flow: column;
    grid-template-columns: 1fr 48px;
    gap: 6px;
  }
  .pull-request-details {
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

  .voting {
    grid-auto-flow: row;
    gap: 12px;
  }

  .vote {
    width: 24px;
    aspect-ratio: 1;
    background-size: contain;
    background-repeat: no-repeat;
    border: none;
    background-color: transparent;
    opacity: 0.2;
    cursor: pointer;
  }

  .vote.up.active {
    opacity: 0.6;
  }

  .vote.up {
    background-image: url('/vote-up.svg');
  }

  .vote.up {
    background-image: url('/vote-up.svg');
  }

  .vote.down {
    background-image: url('/vote-down.svg');
  }
</style>
