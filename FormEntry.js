// FormEntry.js
const mongoose = require('mongoose');
const cartItemSchema = new mongoose.Schema({
  // Define the fields for each cart item
  name: String,
  price: Number,
  amount:Number,
  size:String,
  id:String
  // Add other fields as needed
});
const formEntrySchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  pincode: String,
  state: String,
  city: String,
  amount: String,
  orderID: String,
  cart:[cartItemSchema],
  isPaymentSuccessful: Boolean,
});

const FormEntry = mongoose.model('FormEntry', formEntrySchema);

module.exports = FormEntry;