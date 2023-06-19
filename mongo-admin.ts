import { log, stringify } from './src/lib/functions';
import { getMongoClient } from './src/lib/server-utils';

const ASCENDING = 1;

const mongoClient = await getMongoClient();
const database = mongoClient.db('decentralizedIP');

// Example of adding a user:
const usersCollection = await database.collection('users');

// const mike = await usersCollection.findOneAndUpdate(
//   { walletAddress: '5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM' },
//   {
//     $set: {
//       walletName: 'mikemaccana.sol',
//       githubUsername: 'mikemaccana',
//       profilePicture: 'https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6',
//     },
//   },
//   { upsert: true },
// );

// log(`updated mike`, mike);

// get all documents from the users collection\
const users = await usersCollection.find({}).toArray();
log(users);

process.exit(0);
