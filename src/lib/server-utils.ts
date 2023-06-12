import { log, stringify } from './functions';
import { post } from 'fetch-unfucked';
import type { OAuthCredentials } from '../types/types';
import dotenv from 'dotenv';

dotenv.config();

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const repoOwner = process.env.REPO_OWNER;
const repo = process.env.REPO;

export const authorizationCodeToCredentials = async (authorizationCode: string): Promise<OAuthCredentials> => {
  const response = await post({
    url: 'https://github.com/login/oauth/access_token',
    params: {
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      code: authorizationCode,
    },
  });

  if (response.status !== 'OK') {
    throw new Error('Non OK response from GitHub when logging in');
  }

  if (response.body.error) {
    log(response.body);
    throw new Error(`GitHub error: ${response.body.error_description}. See ${response.body.error_uri}`);
  }

  const accessToken = response.body?.access_token || null;
  const tokenType = response.body?.token_type || null;
  const scope = response.body?.scope || null;

  return {
    accessToken,
    tokenType,
    scope,
    repoOwner,
    repo,
  };
};
