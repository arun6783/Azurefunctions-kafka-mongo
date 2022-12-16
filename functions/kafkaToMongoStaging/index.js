const connectDB = require('./mongo')
const RebuyItem = require('./RebuyItem')

module.exports = async function (context, events) {
  await connectDB()

  const startTime = new Date()
  const parsedMessage = events.map((m) => {
    var parsed =  JSON.parse(m)
    return JSON.parse(parsed.Value)
  })

  context.log.info(
    `Kafka trigger function called for message length ${parsedMessage.length}`
  )

  await processMessage(parsedMessage, startTime, context)
}

async function processMessage(parsedMessage, startTime, context) {
  const mappedMessages = []

  let onlineMessageType = 0
  let otherMessageTypes = 0
  parsedMessage.map((m) => {
    let onlineTransaction = m.IT_TRANSACTION.EXTENSIONS.filter((x) => {
      if (
        x.FIELDGROUP === 'SOURCE' &&
        x.FIELDNAME === 'CHANNEL' &&
        x.FIELDVALUE === 1
      )
        return x
    })

    let customerIds = m.IT_TRANSACTION.EXTENSIONS.filter((x) => {
      if (x.FIELDGROUP === 'TRAN' && x.FIELDNAME === 'IDPID') return x
    })

    if (onlineTransaction.length > 0) {
      onlineMessageType++
    } else {
      otherMessageTypes++
    }
    if (customerIds.length > 0 && onlineTransaction.length > 0) {
      mappedMessages.push({
        transactionNumber: startTime.getMilliseconds() * 55,
        transactionDate: m.IT_TRANSACTION.BUSINESSDAYDATE,
        transactionTime: '',
        storeNumber: '3243',
        channel: 'mobile',
        transactopnTypeCode: '3243',
        customerIdentifiers: customerIds,
        items: [
          {
            lineNo: 1,
            itemId: 645968546,
            qty: 2,
          },
          {
            lineNo: 2,
            itemId: 645968546,
            qty: 2,
          },
          {
            lineNo: 3,
            itemId: 645968546,
            qty: 2,
          },
          {
            lineNo: 4,
            itemId: 645968546,
            qty: 2,
          },
          {
            lineNo: 5,
            itemId: 645968546,
            qty: 2,
          },
        ],
      })
    }
  })
  let result
  let insertedCount = 0
  if (mappedMessages.length > 0) {
    const options = { ordered: true }
    result = await RebuyItem.insertMany(mappedMessages, options)
    insertedCount = result.insertedCount
  }
  const endTime = new Date()
  var timeDiff = endTime - startTime
  timeDiff /= 1000
  var seconds = Math.round(timeDiff)

  context.log.info(
    `mongo insert record count ${mappedMessages.length} in ${seconds} seconds. mongo result status = ${insertedCount} . content received  with onlineTransactionType file count = ${onlineMessageType} and other message = ${otherMessageTypes}`
  )
}
