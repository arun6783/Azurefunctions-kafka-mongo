require('dotenv').config() 
module.exports = {
  'bootstrap.servers': `${process.env.BROKER_ENDPOINT}`,
  'security.protocol': 'SASL_SSL',
  'sasl.mechanisms': 'PLAIN',
  'sasl.username': `${process.env.CLUSTER_API_KEY}`,
  'sasl.password': `${process.env.CLUSTER_API_SECRET}`,
  'topic':'topic_0'
}
