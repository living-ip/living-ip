// See https://kit.svelte.dev/docs/routing#page-page-server-js
import { redirect } from '@sveltejs/kit';

const OAUTH_CLIENT_ID = 'c196617b17a740a2abe4';

export function load() {
  throw redirect(302, `https://github.com/login/oauth/authorize?client_id=${OAUTH_CLIENT_ID}`);
}
