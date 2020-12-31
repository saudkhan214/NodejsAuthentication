var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tokenAuthentication = new Schema({
    token: String,
    requestLimit: Number,
    remainingRequests:Number,
    whenCreated:Date
  })

  module.exports = mongoose.model('TokenAuthentication', tokenAuthentication );