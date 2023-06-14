import { MongoClient, ServerApiVersion } from 'mongodb';

const CERTIFICATE_FILE = 'X509-cert-6808733925086895602.pem';

const client = new MongoClient(
  'mongodb+srv://decentralizedip.0uittwb.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority',
  {
    sslKey: CERTIFICATE_FILE,
    sslCert: CERTIFICATE_FILE,
    serverApi: ServerApiVersion.v1,
  },
);

async function run() {
  try {
    await client.connect();
    const database = client.db('testDB');
    const collection = database.collection('testCol');
    const docCount = await collection.countDocuments({});
    console.log(docCount);
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
