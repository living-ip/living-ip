import { log } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';

async function run() {
  const mongoClient = await getMongoClient();
  try {
    await mongoClient.connect();
    const database = mongoClient.db('decentralizedIP');
    const usersCollection = await database.createCollection('users');
    await usersCollection.insertMany([
      {
        walletAddress: '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM',
        githubUsername: 'mikemaccana',
        walletName: 'mikemaccana.sol',
      },
      {
        walletAddress: 'BQbg5NeqmkexvA7XpjPqTh1Es1RTdVTsAjCgGYviHQUp',
        githubUsername: 'm3taversal',
        walletName: 'metaversial.sol',
      },
    ]);
    // const usersCollection = database.collection('users');
    const documentCount = await usersCollection.countDocuments();
    log(documentCount);
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoClient.close();
  }
}

run().catch(console.dir);
