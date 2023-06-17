<script lang="ts">
  // https://english.stackexchange.com/questions/97140/leader-board-vs-leaderboard

  import type { PullRequestWithVotes } from '../types/types';
  import { log, stringify } from '../lib/functions';

  export let mergedPullRequests: Array<PullRequestWithVotes>;
  export let currentUserWalletAddress: string;

  let summaryByWalletAddress: Record<
    string,
    {
      walletName: string;
      weekPoints: number;
      totalPoints: number;
    }
  > = {};

  mergedPullRequests.map(mergedPullRequest => {
    const walletAddress = mergedPullRequest.walletAddress;
    const existingEntry = summaryByWalletAddress[walletAddress];
    if (!existingEntry) {
      summaryByWalletAddress[walletAddress] = {
        walletName: mergedPullRequest.walletName,
        weekPoints: mergedPullRequest.value,
        totalPoints: mergedPullRequest.value,
      };
      return;
    }

    summaryByWalletAddress[walletAddress] = {
      walletName: mergedPullRequest.walletName,
      weekPoints: existingEntry.weekPoints + mergedPullRequest.value,
      totalPoints: existingEntry.weekPoints + mergedPullRequest.value,
    };
  });

  const byWeekPoints = (a, b) => b.weekPoints - a.weekPoints;

  // Make leaderboard into an array and sort it by weekPoints
  const leaderboardArray = Object.entries(summaryByWalletAddress)
    .map(([userWalletAddress, { weekPoints, totalPoints, walletName }]) => ({
      userWalletAddress,
      walletName,
      weekPoints,
      totalPoints,
      isCurrentUser: userWalletAddress === currentUserWalletAddress,
    }))
    .sort(byWeekPoints);

  const rankToMedal = (rank: number) => {
    if (rank === 1) {
      return '🥇';
    }
    if (rank === 2) {
      return '🥈';
    }
    if (rank === 3) {
      return '🥉';
    }
    return rank;
  };
</script>

<div class="leaderboard-card">
  <div class="leaderboard">
    <div class="heading rank">Rank</div>
    <div class="heading wallet-name">User</div>
    <div class="heading numeric week-points">1 week points</div>
    <div class="heading numeric total-points">Total points</div>
    {#each leaderboardArray as userLeaderboardEntry, index}
      <div class={`rank ${userLeaderboardEntry.isCurrentUser && 'current-user'}`}>
        {rankToMedal(index + 1)}
      </div>
      <div class={`wallet-name ${userLeaderboardEntry.isCurrentUser && 'current-user'}`}>
        {userLeaderboardEntry.walletName}
      </div>
      <div class={`week-points numeric ${userLeaderboardEntry.isCurrentUser && 'current-user'}`}>
        {userLeaderboardEntry.weekPoints.toLocaleString('en-US')}
      </div>
      <div class={`total-points numeric ${userLeaderboardEntry.isCurrentUser && 'current-user'}`}>
        {userLeaderboardEntry.totalPoints.toLocaleString('en-US')}
      </div>
    {/each}
  </div>
</div>

<style>
  /* TODO: not sure why we need this, globals should be setting it for us */
  div {
    box-sizing: border-box;
  }
  .leaderboard-card {
    gap: 12px;
    border-radius: 12px;
    background: linear-gradient(180deg, #20362e 0%, #224234 100%);
    color: white;
    width: 100%;
    padding: 6px 12px;
    box-sizing: border-box;
    min-height: 300px;
    align-items: start;
  }

  .leaderboard {
    width: 100%;
    grid-template-columns: 0.5fr 1.2fr 1.4fr 1.4fr;
    grid-auto-flow: row;
    justify-items: start;
    gap: 0.5px 0;
  }

  .heading.rank,
  .heading.wallet-name,
  .heading.week-points,
  .heading.total-points {
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .rank,
  .wallet-name,
  .week-points,
  .total-points {
    width: 100%;
    font-size: 24px;
    padding: 6px;
  }

  .numeric {
    justify-items: end;
    text-align: right;
  }

  .current-user {
    font-weight: 800;
    background-color: hsla(0, 0%, 100%, 0.1);
  }
</style>
