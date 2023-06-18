// https://kit.svelte.dev/docs/hooks
// "Code in these modules will run when the application starts up, making them useful for initializing database clients and so on."

// TODO: this doesn't actually seem to be true
// logs occur multiple times

import { log, stringify } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';
import type { Handle } from '@sveltejs/kit';
import type { Db, MongoClient } from 'mongodb';

log(`🔌 Connecting to database...`);

let mongoClient: MongoClient;
try {
  mongoClient = await getMongoClient();
  log(`⚡ Connected! `);
} catch (thrownObject) {
  const error = thrownObject as Error;
  if (error.message.includes('certificate validation failed') || error.message.includes('no such file or directory')) {
    throw new Error(`😱 Error connecting to MongoDB: the .pem file mentioned in the .env file is missing or invalid.`);
  }
  log(`Error connecting to MongoDB`, error.message);
} finally {
  if (mongoClient) {
    await mongoClient.close();
  }
}

export const handle = (async ({ event, resolve }) => {
  event.locals = {
    database: mongoClient.db('decentralizedIP'),
  };

  const response = await resolve(event);

  return response;
}) satisfies Handle;
