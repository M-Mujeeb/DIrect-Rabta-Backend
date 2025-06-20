const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  amount: Number,
  currency: String,
  payment_method: String,
  transaction_id: String,
  paid_at: Date
});

module.exports = mongoose.model("Payment", PaymentSchema);