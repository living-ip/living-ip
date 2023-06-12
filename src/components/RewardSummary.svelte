<script lang="ts">
  export let total: number;
  export let tokenRewardPerValueUnit: number;
  export let symbol: string;
</script>

<div class="reward-summary">
  <title>Total rewards</title>
  <div class="reward-summary-count-and-currency">
    <div class="reward-token-count">{total * tokenRewardPerValueUnit}</div>
    <div class="reward-token-currency">{symbol}</div>
  </div>
</div>

<style>
  .reward-summary {
    justify-items: left;
    grid-auto-flow: row;
    gap: 12px;
  }

  .reward-summary title {
    text-transform: uppercase;
    font-size: 16px;
    font-weight: 800;
  }

  .reward-summary-count-and-currency {
    grid-auto-flow: column;
    align-items: baseline;
    gap: 12px;
  }

  .reward-token-count {
    font-size: 48px;
    font-weight: 700;
  }

  .reward-token-currency {
    font-size: 24px;
    font-weight: 700;
  }
</style>
