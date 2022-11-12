
const { MongoClient } = require("mongodb");

const config = {
  url: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodeexpresscourse.0zjzq.mongodb.net/?retryWrites=true&w=majority`,
  dbName: "kafka_mongo"
};

async function createConnection() {
  const connection = await MongoClient.connect(config.url, {
    useNewUrlParser: true
  });
  const db = connection.db(config.dbName);
  return {
    connection,
    db
  };
}

module.exports = createConnection;