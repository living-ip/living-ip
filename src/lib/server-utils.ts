import { log, stringify } from '$lib/functions';
import { post } from 'fetch-unfucked';
import type { OAuthCredentials } from '../types/types';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const MONGO_ATLAS_CERTIFICATE_FILE = process.env.MONGO_ATLAS_CERTIFICATE_FILE;

export const REPO_OWNER = process.env.REPO_OWNER;
export const REPO = process.env.REPO;

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
    repoOwner: REPO_OWNER,
    repo: REPO,
  };
};

const urlAndQueryParamsToString = (url: string, params: Record<string, string>) => {
  const queryParamsString = new URLSearchParams(params);
  return `${url}?${queryParamsString}`;
};

export const getMongoClient = async () => {
  // Provided by Mongo AtlasUI
  const mongoUrl = urlAndQueryParamsToString('mongodb+srv://decentralizedip.0uittwb.mongodb.net/', {
    authSource: '$external',
    authMechanism: 'MONGODB-X509',
    retryWrites: String(true),
    w: 'majority',
  });

  const mongoClient = new MongoClient(mongoUrl, {
    sslKey: MONGO_ATLAS_CERTIFICATE_FILE,
    sslCert: MONGO_ATLAS_CERTIFICATE_FILE,
    serverApi: ServerApiVersion.v1,
  });

  await mongoClient.connect();

  return mongoClient;
};
