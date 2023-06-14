<script lang="ts">
  export let currentTab: number;
  export let getIndexOfTab: () => number;
</script>

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
