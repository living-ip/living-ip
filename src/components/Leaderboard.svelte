<script lang="ts">
  // https://english.stackexchange.com/questions/97140/leader-board-vs-leaderboard

  import type { PullRequestWithVotes } from '../types/types';

  const userLeaderboardEntries = [
    {
      rank: 1,
      walletName: 'johndoe',
      weekPoints: 500,
      totalPoints: 1000,
      isCurrentUser: false,
    },
    {
      rank: 2,
      walletName: 'johndoe',
      weekPoints: 100,
      totalPoints: 1000,
      isCurrentUser: true,
    },
  ];

  export let mergedPullRequests: Array<PullRequestWithVotes>;

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
    {#each userLeaderboardEntries as userLeaderboardEntry}
      <div class={`rank ${userLeaderboardEntry.isCurrentUser && 'current-user'}`}>
        {rankToMedal(userLeaderboardEntry.rank)}
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
