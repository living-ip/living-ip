import { log, stringify } from './src/lib/functions';
import { getMongoClient } from './src/lib/server-utils';

const ASCENDING = 1;

const mongoClient = await getMongoClient();
try {
  await mongoClient.connect();
  const database = mongoClient.db('decentralizedIP');

  // Example of adding a user:
  // const usersCollection = await database.createCollection('users');
  // await usersCollection.insertMany([
  //   {
  //     walletAddress: '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM',
  //     walletName: 'mikemaccana.sol',
  //     githubUsername: 'mikemaccana',
  //   },
  // ]);
  //
  // const documentCount = await usersCollection.countDocuments();
  // log(`${documentCount} users`);
} catch (thrownObject) {
  const error = thrownObject as Error;
  if (error.message.includes('certificate validation failed')) {
    throw new Error(`Error connecting to MongoDB: the .pem file mentioned in the .env file is missing or invalid.`);
  }
  log(`Error connecting to MongoDB`, error.message);
} finally {
  // Ensures that the client will close when you finish/error
  await mongoClient.close();
}
