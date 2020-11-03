require("dotenv").config();
const { MongoClient } = require("mongodb");

const openMongo = async function (dbcallback) {
  const client = new MongoClient(process.env.MONGO_URL, {
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    await dbcallback(
      client.db(process.env.MONGO_DB).collection(process.env.MONGO_COLLECTION)
    );
    await client.close();
  } catch (e) {
    console.error(e);
  }
};

async function main() {
  await openMongo(async (users) => {
    await users.insertOne({ lmao: 5, lmao6: 6 });
    await users.drop();
  });
}

main();
