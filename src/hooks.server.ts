// https://kit.svelte.dev/docs/hooks
// "Code in these modules will run when the application starts up, making them useful for initializing database clients and so on."

// TODO: this doesn't actually seem to be true
// logs occur multiple times

import { log, stringify } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  const mongoClient = await getMongoClient();
  try {
    log(`🧺Connecting to MongoDB...`);
    await mongoClient.connect();
    const database = mongoClient.db('decentralizedIP');
    log(`🧺 connected to MongoDB!`);

    event.locals = { database };

    const response = await resolve(event);

    return response;
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (error.message.includes('certificate validation failed')) {
      throw new Error(`Error connecting to MongoDB: the .pem file mentioned in the .env file is missing or invalid.`);
    }
    log(`Error connecting to MongoDB`, error.message);
  } finally {
    await mongoClient.close();
  }
}) satisfies Handle;
