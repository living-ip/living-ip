<script lang="ts">
  export let voteCount: number;
  export let totalUsers: number;

  $: voteProgress = (100 / totalUsers) * voteCount;
</script>

<div class="progress-bar">
  <div class="progress-bar-fill" style="width: {voteProgress}%;" />
</div>

<style>
  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #11080826;
    border-radius: 4px;
    justify-items: left;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #25aa73, #12bd76);
    border-radius: 4px;
    transition: width 0.5s ease-in-out;
    box-shadow: 0 6.67587px 25.869px -1.66897px rgb(37 255 91 / 51%);
  }
</style>
