const mongoose = require('mongoose')

const connectDB = () => {
  const url= `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodeexpresscourse.0zjzq.mongodb.net/?retryWrites=true&w=majority`
  return mongoose.connect(url,{dbName: 'kafka_mongo'})
}

module.exports = connectDB
