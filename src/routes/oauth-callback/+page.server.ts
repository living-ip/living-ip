// See https://kit.svelte.dev/docs/routing#page-page-server-js
import { log, stringify } from '$lib/functions';
import { authorizationCodeToCredentials } from '$lib/server-utils';
import type { OAuthCredentials } from '../../types/types';
import type { PageServerLoad } from './$types';

export const load = async function ({ url }) {
  log(`Loading...`)
  const authorizationCode = url.searchParams.get('code');

  let credentials: OAuthCredentials;

  try {
    credentials = await authorizationCodeToCredentials(authorizationCode);
  } catch (thrownObject) {
    const error = thrownObject as Error;
    log(`Error getting credentials from github:`, error.message);
    if (error.message.includes('expired')) {
      log(`The authorization code has expired. Please try again.`);
      // TODO: redirect to /oauth
    }
  }

  log(`Got creentials from github:`, stringify(credentials));

  return credentials;
} satisfies PageServerLoad;

