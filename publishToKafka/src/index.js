require('dotenv').config()
const Kafka = require('node-rdkafka')
const config = require('./config')
const express = require('express')
const data = require('./data')

const app = express()

app.use(express.json())

const ERR_TOPIC_ALREADY_EXISTS = 36

function ensureTopicExists(config) {
  const adminClient = Kafka.AdminClient.create({
    'bootstrap.servers': config['bootstrap.servers'],
    'sasl.username': config['sasl.username'],
    'sasl.password': config['sasl.password'],
    'security.protocol': config['security.protocol'],
    'sasl.mechanisms': config['sasl.mechanisms'],
  })

  return new Promise((resolve, reject) => {
    adminClient.createTopic(
      {
        topic: config.topic,
        num_partitions: 1,
        replication_factor: 3,
      },
      (err) => {
        if (!err) {
          console.log(`Created topic ${config.topic}`)
          return resolve()
        }

        if (err.code === ERR_TOPIC_ALREADY_EXISTS) {
          return resolve()
        }

        return reject(err)
      }
    )
  })
}

function createProducer(config, onDeliveryReport) {
  const producer = new Kafka.Producer({
    'bootstrap.servers': config['bootstrap.servers'],
    'sasl.username': config['sasl.username'],
    'sasl.password': config['sasl.password'],
    'security.protocol': config['security.protocol'],
    'sasl.mechanisms': config['sasl.mechanisms'],
    dr_msg_cb: true,
  })

  return new Promise((resolve, reject) => {
    producer
      .on('ready', () => resolve(producer))
      .on('delivery-report', onDeliveryReport)
      .on('event.error', (err) => {
        console.warn('event.error', err)
        reject(err)
      })
    producer.connect()
  })
}

const getRandom = (min = 1, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

app.post('/populate', async (req, res) => {
  try {
    await ensureTopicExists(config)

    const producer = await createProducer(config, (err, report) => {
      if (err) {
        console.warn('Error producing', err)
      } else {
        const { topic, partition, value } = report
        console.log(
          `Successfully produced record to topic "${topic}" partition ${partition} ${value}`
        )
      }
    })

    for (let i = 1; i <= 5; i++) {
      let orderType = getRandom(1, 5)

      let message = {
        orderId: getRandom(),
        orderType: orderType,
        products: [data[orderType], data[getRandom(0, 5)]],
      }

      const key = i
      const value = Buffer.from(JSON.stringify(message))

      console.log(`Producing record ${key}\t${value}`)

      producer.produce(config.topic, -1, value, key)
    }
    res.send('successfully published messages')
  } catch (e) {
    res.status(500).send(e.message)
  }
})

const port = process.env.APP_PORT
app.listen(port, () =>
  console.log(`Kafka message producer app is listening on port ${port}...`)
)
