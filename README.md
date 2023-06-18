# Decentralized IP MVP

A SvelteKit app, built with [create-svelte](https://github.com/sveltejs/kit/tree/master/packages/create-svelte) using:

 - [svelte-on-solana](https://github.com/svelte-on-solana/wallet-adapter) to connect to Solana

 - OAuth, and the [GitHub API](https://docs.github.com/en/rest).

 - A [hosted MongoDB Atlas instance](https://cloud.mongodb.com/v2/5fdb6f434962ca502406e305#/metrics/replicaSet/6489c668ee3f4d382cd1005d/explorer/decentralizedIP) to store users and votes. 

## Quick overview

 - Users log in with their wallets and then vote on proposals, which are GitHub PRs with some extra logic added.

 - Proposals with enough votes are merged (done manually for now using GitHub's UI).

 - Users recieve points (which are tokens) based on their merged contributions.

## To start the app

You'll also need a `.env` file and `.pem` certificate - these are not checked into the repo since these contain secrets. Ask Mike or Corey.

```
npm i
npm run dev
```

Then visit http://localhost:5173/ in your browser.

## MVP limits

 - New users need to be added to MongoDB via the `mongo-admin.ts` file. Edit the file (there's an example included) and then npm `npm run mongo-admin`. Eventually users will sign a transaction proving they control a wallet and this will create a user.
  
 - Voting and payouts can be done by building a custom on-chain app in future, but for now the Sveltekit backend handles voting, and payouts are done manually.

 