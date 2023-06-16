# Decentralized IP demo

Based on SvelteKit, using [svelte-on-solana](https://github.com/svelte-on-solana/wallet-adapter) to connect to Solana, OAuth, and the [GitHub API](https://docs.github.com/en/rest), and [create-svelte](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## To start the app

You'll also need a `.env` file and `.pem` certificate - these are not checked into the repo since these contain secrets. Ask Mike or Corey.

```
npm i
npm run dev
```

Then visit http://localhost:5173/ in your browser.

## Sessions

 - Users connects wallet.
 - Server generates a random session key for the user, encrypted with their public key.
 - User decrypts the session key, using their wallet.
 - User saves the session key.

## MVP limits

 - Voting and payouts can be done by building a custom on-chain app in future, but for now the Sveltekit backend handles voting, and payouts are done manually.

 