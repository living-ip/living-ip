<script lang="ts">
  import type { SummarizedPullRequest } from '../types/types';
  export let mergedPullRequest: SummarizedPullRequest;
  export let tokenRewardPerValueUnit: number;

  const showDate = (number: number) => {
    const date = new Date(number);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const amount = mergedPullRequest.value * tokenRewardPerValueUnit;
</script>

<div class="reward">
  <div class="details">
    <div class="date">{showDate(mergedPullRequest.mergedAt)}</div>
    <div class="title">{mergedPullRequest.title}</div>
  </div>
  <div class="amount">{amount}</div>
</div>

<style>
  .reward {
    justify-items: left;
    width: 100%;
    padding: 12px 0;
    grid-auto-flow: column;
    justify-content: space-between;
    gap: 24px;
  }
  .details {
    justify-items: left;
    grid-auto-flow: row;
  }

  .date {
    font-size: 12px;
  }

  .title {
    font-size: 24px;
    line-height: 36px;
  }

  .amount {
    text-align: right;
    font-size: 24px;
    line-height: 36px;
    font-weight: 700;
  }
</style>
