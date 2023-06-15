// https://kit.svelte.dev/docs/hooks

import { log, stringify } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';
import type { Handle } from "@sveltejs/kit";

log(`🧺Connecting to MongoDB...`);
const mongoClient = await getMongoClient();
await mongoClient.connect();
const database = mongoClient.db('decentralizedIP');
log(`🧺 connected to MongoDB!`);

export const handle = (async ({ event, resolve }) => {
  
  try { 
    
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
