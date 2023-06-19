<script lang="ts">
</script>

<div class="title-and-refresh">
  <title class="app-name-skeleton skeleton" />
</div>

<div class="tabs">
  <div class="tab-skeleton skeleton" />
  <div class="tab-skeleton skeleton" />
</div>

<div class="reward-summary-and-proposals">
  <div class="rewards-skeleton skeleton" />
  <div class="rewards-proposals-skeleton skeleton">
    <div class="rewards-proposal-skeleton skeleton" />
    <div class="rewards-proposal-skeleton skeleton" />
    <div class="rewards-proposal-skeleton skeleton" />
  </div>
</div>

<style>
  @keyframes skeleton-background-shine {
    to {
      background-position: 100% 0, /* move highlight to right */ 0 0;
    }
  }

  .skeleton {
    background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0.5) 50%,
        rgba(255, 255, 255, 0) 80%
      ),
      lightgray;
    background-repeat: repeat-y;
    background-size: 50px 200px;
    background-position: 0 0;
    animation: skeleton-background-shine 1s infinite;
  }

  .tabs {
    display: grid;
    grid-auto-flow: column;
    gap: 12px;
    width: 100%;
    justify-content: start;
  }

  .tab-skeleton {
    width: 96px;
    height: 38px;
    background-color: #e0e0e0;
    border-radius: 3px;
  }

  .title-and-refresh {
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    width: 100%;
  }

  .app-name-skeleton {
    width: 162px;
    height: 28px;
    background-color: #e0e0e0;
    border-radius: 3px;
  }

  .reward-summary-and-proposals {
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    justify-items: left;
    align-items: start;
    width: 100%;
  }

  .rewards-skeleton {
    width: 100%;
    height: 284px;
    background-color: #e0e0e0;
    border-radius: 3px;
  }

  .rewards-proposals-skeleton {
    width: 100%;
    height: 500px;
    background-color: #e0e0e0;
    border-radius: 3px;
  }
</style>
