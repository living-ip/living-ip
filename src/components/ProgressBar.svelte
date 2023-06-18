<script lang="ts">
  export let voteCount: number;
  export let totalUsers: number;

  const voteProgress = (100 / totalUsers) * voteCount;
</script>

<div class="progress-bar">
  <div class="progress-bar-fill" style="width: ${voteProgress}%;" />
</div>

<style>
  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e5e5e5;
    border-radius: 4px;
    justify-items: left;
  }

  .progress-bar-fill {
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, rgb(44, 52, 110), #659fad);
    border-radius: 4px;
    transition: width 0.5s ease-in-out;
  }
</style>
