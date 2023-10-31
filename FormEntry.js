// FormEntry.js
const mongoose = require('mongoose');
const cartItemSchema = new mongoose.Schema({
  // Define the fields for each cart item
  name: String,
  Price: Number,
  amount:Number,
  size:String,
  id:String,
  image:String,
  Description:String,
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
  phoneNumber:{
    type:String,
    default:'No phone number',
  },
  userId:String,
});

const FormEntry = mongoose.model('FormEntry', formEntrySchema);

module.exports = FormEntry;