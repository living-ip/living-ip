<script lang="ts">
  import { WalletMultiButton, workSpace } from '@portal-payments/wallet-adapter-ui';

  import { walletAddressToNameAndProfilePicture } from '@portal-payments/solana-wallet-names';
  import type { PublicKey } from '@solana/web3.js';
  import * as http from 'fetch-unfucked';
  import type { UnfuckedResponse } from 'fetch-unfucked';
  import { walletStore } from '@portal-payments/wallet-adapter-core';
  import type { SummarizedPullRequestWithUserDetails, PullRequestWithVotes } from '../types/types';
  import { onMount, tick } from 'svelte';
  import RewardSummary from '../components/RewardSummary.svelte';
  import Tabs from '../components/Tabs.svelte';
  import Leaderboard from '../components/Leaderboard.svelte';
  import Reward from '../components/Reward.svelte';
  import Skeleton from '../components/Skeleton.svelte';
  import Proposal from '../components/Proposal.svelte';
  import { log, stringify } from '../lib/functions';
  import { TOKEN_REWARD_PER_VALUE_UNIT } from '../lib/constants';
  const appName = `Decentralized IP`;

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

  const optimisticUpdate = async (direction: boolean, url: string) => {
    // An optimistic update is when we update the UI before we get a response from the server
    // The changes to the UI are then reverted if the server responds with different data
    log(`Doing optimistic update`);
    const proposal = allUsersUnmergedPullRequestsWithVotes.find(pullRequest => pullRequest.htmlURL === url);
    if (!proposal) {
      throw new Error(`Could not find proposal during optimistic update for URL ${url}`);
    }
    proposal.votes = {
      ...proposal.votes,
      [$walletStore.publicKey.toBase58()]: direction,
    };
    allUsersUnmergedPullRequestsWithVotes = allUsersUnmergedPullRequestsWithVotes;
    await tick();
  };

  const refreshProposals = async () => {
    // Only show the loading screen if we haven't loaded yet
    if (!hasLoaded) {
      showLoadingScreen = true;
    }

    let response: UnfuckedResponse;
    try {
      response = await http.get({
        url: '/api/v1/proposals',
        params: {
          walletAddress: $walletStore.publicKey.toBase58(),
          githubAccessToken,
        },
      });
    } catch (thrownObject) {
      const error = thrownObject as Error;
      if (error.message === 'Failed to fetch') {
        // TODO: investigate why this happens
        // it may be oauth credentails expiring but may be something else
        log(`Recieved 'failed to fetch' message. Redirecting to /oauth`);
        window.location.pathname = '/oauth';
      }
    }

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
  let currentTab = 0;
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
    <h1>Sign in with your Solana<br /> wallet to continue.</h1>
    <WalletMultiButton walletAddressToNameAndProfilePicture={walletAddressToNameAndProfilePictureWrapper} />
  {:else if !githubAccessToken}
    <h1>Login to github</h1>
    <a class="button github-login" href="/oauth">Login to github </a>
  {:else if showLoadingScreen}
    <Skeleton />
  {:else}
    <div class="title-and-refresh">
      <title class="app-name">{repo}</title><button class="refresh" on:click={refreshRepo} />
    </div>

    <Tabs
      isActiveVoting={currentTab === getIndexOfTab('Voting')}
      isActiveLeaderboard={currentTab === getIndexOfTab('Leaderboard')}
      setActiveVoting={() => (currentTab = getIndexOfTab('Voting'))}
      setActiveLeaderboard={() => (currentTab = getIndexOfTab('Leaderboard'))}
    />

    {#if currentTab === getIndexOfTab('Voting')}
      <div class="reward-summary-and-proposals">
        <section class="rewards">
          <RewardSummary {points} tokenRewardPerValueUnit={TOKEN_REWARD_PER_VALUE_UNIT} symbol={SYMBOL} />

          <div class="merged-proposals">
            {#each userMergedPullRequestWithVotes as mergedPullRequest}
              <Reward {mergedPullRequest} tokenRewardPerValueUnit={TOKEN_REWARD_PER_VALUE_UNIT} />
            {/each}
            {#if userMergedPullRequestWithVotes.length === 0}
              <p>No merged pull requests yet.</p>
            {/if}
          </div>
        </section>
        <section class="proposals">
          <title>Current Proposals</title>
          <div class="proposals">
            {#each allUsersUnmergedPullRequestsWithVotes as pullRequestWithVotes}
              <!-- Do we show Solana users matching GitHub accounts? -->
              <Proposal
                {pullRequestWithVotes}
                {githubAccessToken}
                currentUserWalletAddress={$walletStore.publicKey.toBase58()}
                tokenRewardPerValueUnit={TOKEN_REWARD_PER_VALUE_UNIT}
                {totalUsers}
                symbol={SYMBOL}
                {optimisticUpdate}
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
    background: linear-gradient(135deg, #edfff8, #e9fffe);
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
  }

  h1 {
    font-size: 32px;
    line-height: 40px;
    font-weight: 800;
    text-align: center;
    margin: 0;
    /* From Solana brand book, ran through a vibrant gradient generator to get intermediate colors */
    background: linear-gradient(90deg, #9945ff, #00c2ff, #14f195);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
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
    font-size: 32px;
    font-weight: 600;
  }

  .reward-summary-and-proposals {
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
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
    background: linear-gradient(45deg, #351a55, #9945ff);
    box-shadow: 0 6.67587px 25.869px -1.66897px rgb(83 37 255 / 43%);
  }

  .rewards {
    padding-top: 24px;
    justify-items: left;
  }

  .merged-proposals {
    padding-top: 24px;
    width: 100%;
  }

  section.proposals {
    width: 100%;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
  }

  div.proposals {
    gap: 48px;
    width: 100%;
  }

  .proposals title {
    justify-items: left;
    width: 100%;
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
  }
</style>
