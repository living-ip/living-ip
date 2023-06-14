<script lang="ts">
  // https://english.stackexchange.com/questions/97140/leader-board-vs-leaderboard

  const userLeaderboardEntries = [
    {
      rank: 1,
      walletName: 'johndoe',
      weekPoints: 500,
      totalPoints: 1000,
    },
    {
      rank: 2,
      walletName: 'johndoe',
      weekPoints: 100,
      totalPoints: 1000,
    },
  ];

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

<div class="x">
  <h1>Leaderboard</h1>

  <div class="leaderboard">
    <div class="heading rank">Rank</div>
    <div class="heading wallet-name">User</div>
    <div class="heading numeric week-points">1 week points</div>
    <div class="heading numeric total-points">Total points</div>
    {#each userLeaderboardEntries as userLeaderboardEntry}
      <div class="rank">{rankToMedal(userLeaderboardEntry.rank)}</div>
      <div class="wallet-name">{userLeaderboardEntry.walletName}</div>
      <div class="week-points numeric">{userLeaderboardEntry.weekPoints.toLocaleString('en-US')}</div>
      <div class="total-points numeric">{userLeaderboardEntry.totalPoints.toLocaleString('en-US')}</div>
    {/each}
  </div>
</div>

<style>
  .x {
    gap: 12px;
    border-radius: 12px;
    background: linear-gradient(180deg, #20362e 0%, #224234 100%);
    color: white;
    width: 800px;
    padding: 24px;
  }
  .leaderboard {
    width: 100%;
    grid-template-columns: 0.5fr 1.8fr 1fr 1fr;
    grid-auto-flow: row;
    justify-items: start;
    gap: 0.5px 0;
  }

  .heading {
    font-size: 24px;
    font-weight: 600;
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
    padding-right: 0;
  }
</style>
