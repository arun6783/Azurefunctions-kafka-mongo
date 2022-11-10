const express = require('express')
const kafka = require('kafka-node')
const mongoose = require('mongoose')
const connectDB = require('./mongo')

const app = express()

app.use(express.json())



const User = new mongoose.model('user', {
  name: String,
  email: String,
  password: String,
})



const client = new kafka.KafkaClient({
  kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
})

const producer = new kafka.Producer(client)

producer.on('ready', () => {
  console.log('producer ready')

  app.post('/', async (req, res) => {
    producer.send(
      [{ topic: process.env.KAFKA_TOPIC, messages: JSON.stringify(req.body) }],
      async (err, data) => {
        if (err) {
          console.error(err)
          res.status(500).send('error occured when posting message to kafka')
        } else {
          console.log('message arrived in app1', req.body)
          const user = await new User(req.body)
          await user.save()
          res.send(req.body)
        }
      }
    )
  })
})





const start = async () => {
  try {
    const port = process.env.PORT
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () => console.log(`app1 is listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}

start()
