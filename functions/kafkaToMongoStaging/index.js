const createMongoClient = require('./mongo')

module.exports = async function (context, events) {
  const { db } = await createMongoClient()
  const Producer = db.collection('producer')

  const parsedMessage = events.map((m) => {
    return JSON.parse(m)
  })
  context.log.info(
    `Kafka trigger function called for message length ${parsedMessage.length}`
  )

  const options = { ordered: true }
  const result = await Producer.insertMany(parsedMessage, options)

  context.log.info(`mongo insert result = ${JSON.stringify(result)}`)
}
