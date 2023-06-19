<script lang="ts">
  export let isActiveVoting: boolean;
  export let isActiveLeaderboard: boolean;
  export let setActiveVoting: () => {};
  export let setActiveLeaderboard: () => {};
</script>

<div class="tabs">
  <button class="tab" class:active={isActiveVoting} on:click={setActiveVoting}> Voting </button>
  <button class="tab" class:active={isActiveLeaderboard} on:click={setActiveLeaderboard}> Leaderboard </button>
</div>

<style>
  .tabs {
    display: grid;
    grid-auto-flow: column;
    gap: 12px;
    width: 100%;
    justify-content: start;
    border-bottom: 0.5px solid #222;

    font-family: 'Inter', sans-serif;
  }

  .tab {
    width: 96px;

    font-size: 16px;
    font-weight: 500;
    text-transform: uppercase;

    text-align: left;
    justify-items: center;
    border: none;
    cursor: pointer;
    background-color: transparent;
    padding: 12px 0;
    gap: 12px;
    opacity: 0.5;
  }

  .tab.active {
    font-weight: 700;
    opacity: 0.9;
  }
</style>
