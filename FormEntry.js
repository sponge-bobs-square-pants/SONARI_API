// FormEntry.js
const mongoose = require('mongoose');

const formEntrySchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  pincode: String,
  state: String,
  city: String,
  amount: String,
  orderID: String,
  cart:Array,
  isPaymentSuccessful: Boolean,
});

const FormEntry = mongoose.model('FormEntry', formEntrySchema);

module.exports = FormEntry;