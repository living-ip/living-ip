<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { log, stringify } from '$lib/functions';

  export let data: PageData;
  const accessToken = data.accessToken;
  const repoOwner = data?.repoOwner;
  const repo = data?.repo;

  onMount(() => {
    // Run only in the browser (where we can access localstorage)
    log(`Saving accessToken to localStorage and redirecting back to home page...`);
    localStorage.setItem('githubAccessToken', accessToken);
    localStorage.setItem('repoOwner', repoOwner);
    localStorage.setItem('repo', repo);
    window.location.href = '/';
  });
</script>

<header>
  <title>One moment</title>
</header>

<main>
  <p>Please wait...</p>
</main>

<style>
</style>
