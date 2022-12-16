var mongoose = require('mongoose');


var RebuySchema = mongoose.Schema({
    "transactionNumber": {
      "type": "String"
    },
    "transactionDateTime": {
      "type": "String"
    },
    "storeNumber": {
      "type": "Date"
    },
    "channel": {
      "type": "String"
    },
    "transactopnTypeCode": {
      "type": "Date"
    },
    "customerIdentifiers": {
      "type": [
        "Mixed"
      ]
    },
    "items": {
      "type": [
        "Mixed"
      ]
    }
  },
  { timestamps: true });

  module.exports = mongoose.model('RebuyItem', RebuySchema)
