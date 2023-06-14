import { log, stringify } from '$lib/functions';
import { getMongoClient } from '$lib/server-utils';

const mongoClient = await getMongoClient();
try {
  await mongoClient.connect();
  const database = mongoClient.db('decentralizedIP');
  // const usersCollection = await database.createCollection('users');
  // await usersCollection.insertMany([
  //   {
  //     walletAddress: '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM',
  //     walletName: 'mikemaccana.sol',
  //     githubUsername: 'mikemaccana',
  //   },
  //   {
  //     walletAddress: 'BQbg5NeqmkexvA7XpjPqTh1Es1RTdVTsAjCgGYviHQUp',
  //     walletName: 'metaversial.sol',
  //     githubUsername: 'm3taversal',
  //   },
  // ]);
  //
  // const documentCount = await usersCollection.countDocuments();
  // log(`${documentCount} users`);

  // const proposalsCollection = await database.createCollection('proposals');
  // await proposalsCollection.insertMany([
  //   {
  //     url: 'https://github.com/m3taversal/Beta-Bible/pull/3',
  //     votes: {
  //       '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM': true,
  //       BQbg5NeqmkexvA7XpjPqTh1Es1RTdVTsAjCgGYviHQUp: true,
  //     },
  //   },
  //   {
  //     url: 'https://github.com/m3taversal/Beta-Bible/pull/2',
  //     votes: {
  //       '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM': true,
  //       BQbg5NeqmkexvA7XpjPqTh1Es1RTdVTsAjCgGYviHQUp: true,
  //     },
  //   },
  //   {
  //     url: 'https://github.com/m3taversal/Beta-Bible/pull/1',
  //     votes: {
  //       '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM': true,
  //     },
  //   },
  //   {
  //     url: 'https://github.com/m3taversal/Beta-Bible/pull/4',
  //     votes: {
  //       '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM': true,
  //     },
  //   },
  //   {
  //     url: 'https://github.com/m3taversal/Beta-Bible/pull/5',
  //     votes: {
  //       '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM': true,
  //     },
  //   },
  // ]);

  // const documentCount = await proposalsCollection.countDocuments();
  // log(`${documentCount} proposals`);

  const getUserForGithubUsername = (githubUsername: string) => {
    const usersCollection = database.collection('users');
    const userDocument = usersCollection.findOne({ githubUsername });
    return userDocument;
  };

  const result = await getUserForGithubUsername('mikemaccana');

  log(stringify(result));
} catch (thrownObject) {
  const error = thrownObject as Error;
  log(`Error cnnecting to MongoDB`, error.message);
} finally {
  // Ensures that the client will close when you finish/error
  await mongoClient.close();
}
