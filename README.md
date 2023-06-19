# Decentralized IP MVP

 - `Users` (Solana wallets) log in with their wallets and then vote on `proposals`, which are GitHub PRs with voting added.

 - `Proposals` with enough votes are merged (done manually for now using GitHub's UI).

 - Users recieve `points` (which are tokens) based on the size of their merged contributions.

## Technical Overview

A [SvelteKit](https://kit.svelte.dev/) app, built with [create-svelte](https://github.com/sveltejs/kit/tree/master/packages/create-svelte) using:

 - [svelte-on-solana](https://github.com/svelte-on-solana/wallet-adapter) to connect to Solana

 - Connection to GitHub using [OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), and connection to GitHub repos using [GitHub API](https://docs.github.com/en/rest).

 - A [MongoDB](https://www.mongodb.com/developer/languages/javascript/node-connect-mongodb/) [Atlas](https://cloud.mongodb.com/v2/5fdb6f434962ca502406e305#/metrics/replicaSet/6489c668ee3f4d382cd1005d/explorer/decentralizedIP) to store `users` and `proposals`. 

## To start the app

You'll also need a `.env` file and `.pem` certificate - these are not checked into the repo since these contain secrets. Ask Mike or Corey.

```
npm i
npm run dev
```

Then visit http://localhost:5173/ in your browser.

## MVP limits

 - New users need to be added to MongoDB via the `mongo-admin.ts` file. Edit the file (there's an example included) and then npm `npm run mongo-admin`. Eventually users will sign a transaction proving they control a wallet and this will create a user.
  
 - Accepting proposals (merges of PRs) are done manually using Github's UI for this PR. Likewise payouts are done manually for this MVP. We can build both these in future easily.

## Adding users

 - Visit [the 'users' collection in MongoDB Atlas](https://cloud.mongodb.com/v2/5fdb6f434962ca502406e305#/metrics/replicaSet/6489c668ee3f4d382cd1005d/explorer/decentralizedIP/users/find)
 - Click 'INSERT DOCUMENT' to make a user'
 - Make a document with the following info:


```json
{
  walletAddress: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
  githubUsername: "mikemaccana", 
  walletName: "mikemaccana.sol",
  profilePicture: "https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6",
}
```

If someone doesn't have a wallet name or a profile picture you can skip them - it will fall back to showing the address if there's no name and an empty profile pic.
