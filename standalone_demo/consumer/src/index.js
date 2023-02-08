const express = require('express')
const mongoose = require('mongoose')
const connectDB = require('./mongo')

const app = express()

app.use(express.json())

const User = new mongoose.model('user', {
  name: String,
  email: String,
  password: String,
})

var kafka = require('kafka-node'),
  Consumer = kafka.Consumer,
  client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
  }),
  consumer = new Consumer(
    client,
    [{ topic: process.env.KAFKA_TOPIC, partition: 0 }],
    {
      autoCommit: false,
    }
  )

consumer.on('message', async (message) => {
  console.log('message arrived in app2', message.value)
  const user = await new User(JSON.parse(message.value))
  await user.save()
})
consumer.on('error', (err) => {
  console.log(err)
})
const start = async () => {
  try {
    const port = process.env.PORT
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () => console.log(`app2 is listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}

//start()


console.log('stand alone consumer not listening anymore')
