var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
    email: String,
    password: String,
    whenCreated:Date
  })

  module.exports = mongoose.model('Admin', user );