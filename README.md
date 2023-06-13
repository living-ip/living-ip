# Decentralized IP demo

Based on SvelteKit, using [svelte-on-solana](https://github.com/svelte-on-solana/wallet-adapter) to connect to Solana, OAuth, and the [GitHub API](https://docs.github.com/en/rest), and [create-svelte](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## To start the app

You'll need a `.env` file (not checked into the repo since it contains secrets). See `.env.example` for an example.

```
npm i
npm run dev
```

Then visit http://localhost:5173/ in your browser.

## MVP limits

 - Voting and payouts can be done by building a custom on-chain in future, but for now the Sveltekit backend handles voting, and payouts are done manually.

 