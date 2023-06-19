<script lang="ts">
  import { WalletMultiButton, workSpace } from '@portal-payments/wallet-adapter-ui';

  import { walletAddressToNameAndProfilePicture } from '@portal-payments/solana-wallet-names';
  import type { PublicKey } from '@solana/web3.js';
  import * as http from 'fetch-unfucked';
  import { walletStore } from '@portal-payments/wallet-adapter-core';
  import type { SummarizedPullRequestWithUserDetails, PullRequestWithVotes } from '../types/types';
  import { onMount } from 'svelte';
  import RewardSummary from '../components/RewardSummary.svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import Reward from '../components/Reward.svelte';
  import Proposal from '../components/Proposal.svelte';
  import { log, stringify } from '../lib/functions';
  import { TOKEN_REWARD_PER_VALUE_UNIT } from '../lib/constants';
  const appName = `decentralized IP`;

  const SYMBOL = 'POINTS';

  let githubAccessToken: string | null = null;
  let repoOwner: string | null = null;
  let repo: string | null = null;

  let showLoadingScreen = true;
  let hasLoaded = false;

  let allUsersMergedPullRequestsWithVotes: Array<PullRequestWithVotes> = [];
  let allUsersUnmergedPullRequestsWithVotes: Array<PullRequestWithVotes> = [];
  let userMergedPullRequestWithVotes: Array<PullRequestWithVotes> = [];
  let points: number | null = null;

  let totalUsers: number | null = null;

  const connection = $workSpace.connection;

  const walletAddressToNameAndProfilePictureWrapper = async (publicKey: PublicKey) => {
    return walletAddressToNameAndProfilePicture(connection, publicKey);
  };

  const refreshProposals = async () => {
    // Only show the loading screen if we haven't loaded yet
    if (!hasLoaded) {
      showLoadingScreen = true;
    }

    const response = await http.get({
      url: '/api/v1/proposals',
      params: {
        walletAddress: $walletStore.publicKey.toBase58(),
        githubAccessToken,
      },
    });

    log('response is', response.body);

    if (response.status !== 'OK') {
      throw Error(`Error from Decentralized IP API: ${response.status}: ${response.body}`);
    }

    userMergedPullRequestWithVotes = response.body.userMergedPullRequestWithVotes;

    allUsersMergedPullRequestsWithVotes = response.body.allUsersMergedPullRequestsWithVotes;

    allUsersUnmergedPullRequestsWithVotes = response.body.allUsersUnmergedPullRequestsWithVotes;

    points = response.body.points;

    totalUsers = response.body.totalUsers;

    showLoadingScreen = false;
    hasLoaded = true;
  };

  walletStore.subscribe(async newValue => {
    if (newValue?.publicKey) {
      log(`🚀 $walletStore.connected has updated!`, $walletStore.connected);
      // $walletStore.publicKey.toBase58(); now has our wallet address
      refreshProposals();
    }
  });

  onMount(async () => {
    githubAccessToken = window.localStorage.getItem('githubAccessToken');

    repoOwner = window.localStorage.getItem('repoOwner');
    repo = window.localStorage.getItem('repo');

    if (!githubAccessToken) {
      log(`No githubAccessToken found in localStorage`);
      return;
    }
  });

  const refreshRepo = async () => {
    await refreshProposals();
  };

  const getIndexOfTab = (tabName: string) => {
    return tabs.findIndex(tab => tab === tabName);
  };

  const tabs = ['Voting', 'Leaderboard'];
  let currentTab = 1;
</script>

<header>
  <title>{appName}</title>
  <div class="user">
    {#if $walletStore?.connected}
      <WalletMultiButton walletAddressToNameAndProfilePicture={walletAddressToNameAndProfilePictureWrapper} />
    {/if}
  </div>
</header>

<main>
  {#if !$walletStore?.connected}
    <h1>Create together</h1>
    <WalletMultiButton walletAddressToNameAndProfilePicture={walletAddressToNameAndProfilePictureWrapper} />
  {:else if !githubAccessToken}
    <h1>Login to github</h1>
    <a class="button github-login" href="/oauth">Login to github </a>
  {:else if showLoadingScreen}
    <p>Loading Project</p>
  {:else}
    <div class="title-and-refresh">
      <title class="app-name">{repo}</title><button class="refresh" on:click={refreshRepo} />
    </div>

    <div class="tabs">
      <button
        class="tab"
        class:active={currentTab === getIndexOfTab('Voting')}
        on:click={() => (currentTab = getIndexOfTab('Voting'))}
      >
        Voting
      </button>
      <button
        class="tab"
        class:active={currentTab === getIndexOfTab('Leaderboard')}
        on:click={() => (currentTab = getIndexOfTab('Leaderboard'))}
      >
        Leaderboard
      </button>
    </div>

    {#if currentTab === getIndexOfTab('Voting')}
      <div class="reward-summary-and-proposals">
        <section class="rewards">
          <RewardSummary {points} tokenRewardPerValueUnit={TOKEN_REWARD_PER_VALUE_UNIT} symbol={SYMBOL} />

          <div class="merged-pull-requests">
            {#each userMergedPullRequestWithVotes as mergedPullRequest}
              <Reward {mergedPullRequest} tokenRewardPerValueUnit={TOKEN_REWARD_PER_VALUE_UNIT} />
            {/each}
            {#if userMergedPullRequestWithVotes.length === 0}
              <p>No merged pull requests yet.</p>
            {/if}
          </div>
        </section>
        <section class="pull-requests">
          <title>Current Proposals</title>
          <div class="pull-requests">
            {#each allUsersUnmergedPullRequestsWithVotes as pullRequestWithVotes}
              <!-- Do we show Solana users matching GitHub accounts? -->
              <Proposal
                {pullRequestWithVotes}
                {githubAccessToken}
                currentUserWalletAddress={$walletStore.publicKey.toBase58()}
                tokenRewardPerValueUnit={TOKEN_REWARD_PER_VALUE_UNIT}
                {totalUsers}
                symbol={SYMBOL}
                afterVoting={refreshProposals}
              />
            {/each}
            <div />
          </div>
        </section>
      </div>
    {:else if currentTab === getIndexOfTab('Leaderboard')}
      <Leaderboard
        mergedPullRequests={allUsersMergedPullRequestsWithVotes}
        currentUserWalletAddress={$walletStore.publicKey.toBase58()}
      />
    {/if}
  {/if}
</main>

<style>
  /* Padding goes inside boxes */
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  /* Use grid by default */
  :global(div, footer, header, main, nav, title, section) {
    display: grid;
    place-items: center;
  }

  /* Sensible links */
  :global(a, a:visited, a:hover, a:active) {
    text-decoration: none;
    color: var(--black);
  }

  :global(body) {
    min-height: 100dvh;
    display: grid;
    grid-auto-flow: row;
    justify-items: center;
    padding: 0;
    margin: 0;
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
  }

  header {
    height: 64px;
    grid-auto-flow: column;
    justify-content: space-between;
    width: 100%;
    position: absolute;
    top: 0;
    padding: 0 24px;
  }

  header title {
    width: 192px;
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .title-and-refresh {
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    width: 100%;
  }

  main {
    /* 64px header height plus some extra space */
    padding-top: 128px;
    gap: 32px;
    align-content: start;
    max-width: 900px;
    width: 100%;
  }

  .button.github-login {
    display: grid;
    place-items: center;
    padding: 0 24px;
    border-radius: 24px;
    border: 1px solid #222;
    height: 48px;
  }

  button.refresh {
    opacity: 0.2;
    display: grid;
    place-items: center;
    padding: 3px;
    border: none;
    cursor: pointer;
    height: 36px;
    aspect-ratio: 1;
    background-color: transparent;
    background-image: url('/refresh.svg');
  }

  .app-name {
    width: 100%;
    justify-content: left;
    font-size: 24px;
  }

  .reward-summary-and-proposals {
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    justify-items: left;
    align-items: start;
    width: 100%;
  }

  section {
    justify-items: left;
  }

  section.rewards {
    color: white;
    border-radius: 12px;
    padding: 12px;
    width: 100%;
    background: linear-gradient(45deg, #2f3d53, #659fad);
  }

  .rewards {
    padding-top: 24px;
    justify-items: left;
  }

  .merged-pull-requests {
    padding-top: 24px;
    width: 100%;
  }

  section.pull-requests {
    width: 100%;
    gap: 12px;
  }

  div.pull-requests {
    gap: 48px;
    width: 100%;
  }

  .pull-requests title {
    justify-items: left;
    width: 100%;
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .tabs {
    display: grid;
    grid-auto-flow: column;
    gap: 12px;
    width: 100%;
    justify-content: start;
    border-bottom: 0.5px solid #222;
  }

  .tab {
    width: 96px;
    font-size: 16px;

    text-transform: uppercase;
    text-align: left;
    justify-items: center;
    border: none;
    cursor: pointer;
    background-color: transparent;
    padding: 12px 0;
    gap: 12px;
  }

  .tab.active {
    font-weight: 600;
  }
</style>
