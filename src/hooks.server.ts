// https://kit.svelte.dev/docs/hooks
// "Code in these modules will run when the application starts up, making them useful for initializing database clients and so on."

// TODO: this doesn't actually seem to be true
// logs occur multiple times

import { log, stringify } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';
import type { Handle } from '@sveltejs/kit';
import type { Db, MongoClient } from 'mongodb';

log(`🔌 Connecting to database...`);
let mongoClient: MongoClient = await getMongoClient();
log(`⚡ Connected! `);

export const handle = (async ({ event, resolve }) => {
  event.locals = {
    database: mongoClient.db('decentralizedIP'),
  };

  const response = await resolve(event);

  return response;
}) satisfies Handle;
