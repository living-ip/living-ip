// https://kit.svelte.dev/docs/hooks

import { log, stringify } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';
import type { Handle } from "@sveltejs/kit";

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
    console.log(`Error cnnecting to MongoDB`, error.message);
    throw error;
  } finally {
    await mongoClient.close();
  }
}) satisfies Handle;
