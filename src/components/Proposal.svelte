<script lang="ts">
  import type { PullRequestWithVotes } from '../types/types';
  import { stringify, log } from '../lib/functions';
  import * as http from 'fetch-unfucked';
  import ProgressBar from './ProgressBar.svelte';

  export let pullRequestWithVotes: PullRequestWithVotes;
  export let currentUserWalletAddress: string;
  export let githubAccessToken: string;
  export let tokenRewardPerValueUnit: number;

  export let symbol: string;

  export let afterVoting: () => Promise<void>;

  let voteCount = Object.values(pullRequestWithVotes.votes).filter(Boolean).length;

  // TODO: hack. Should be based on total users
  const votesRequired = 2;

  const currentUserVote = pullRequestWithVotes.votes?.[currentUserWalletAddress] || null;

  const vote = (direction: boolean, url: string) => async () => {
    log('voting', direction);
    if (currentUserVote === direction) {
      log('already voted');
      return;
    }

    log(`aboiut to vote`, {
      direction,
      url,
      currentUserWalletAddress,
      githubAccessToken,
    });

    const response = await http.post('/api/v1/proposals', null, {
      direction,
      url,
      currentUserWalletAddress,
      githubAccessToken,
    });

    if (response.status !== 'OK') {
      throw new Error(`Got a bad response from the API: ${response.status}: ${response.body}`);
    }

    log(`response after voting`, response.status);

    afterVoting();
  };
</script>

<div class="pull-request">
  <div class="pull-request-details">
    <div class="user">
      {#if pullRequestWithVotes.profilePicture}
        <img class="profile-picture" src={pullRequestWithVotes.profilePicture} alt="profile" />
      {:else}
        <div class="profile-picture" />
      {/if}
      <div class="wallet-name">{pullRequestWithVotes.walletName || pullRequestWithVotes.walletAddress}</div>
    </div>
    <div class="name">
      <a href={`${pullRequestWithVotes.htmlURL}/files`} target="_blank">
        {pullRequestWithVotes.title}
      </a>
    </div>
    <div class="reward">
      Contribution:&nbsp; <strong>{pullRequestWithVotes.value * tokenRewardPerValueUnit} {symbol}</strong>
    </div>
    <ProgressBar {voteCount} {votesRequired} />
  </div>
  <div class="voting">
    <button class="vote up" on:click={vote(true, pullRequestWithVotes.htmlURL)} />
    <button class="vote down" on:click={vote(false, pullRequestWithVotes.htmlURL)} />
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

  .vote:hover {
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
