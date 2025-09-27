// models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: String,    // razorpay order id
  paymentId: String,  // razorpay payment id
  signature: String,  // razorpay signature
  amount: Number,     // amount in paisa
  currency: { type: String, default: "INR" },
  status: String,      // e.g. 'created', 'paid', 'failed'
  meta: Object         // any extra info
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
