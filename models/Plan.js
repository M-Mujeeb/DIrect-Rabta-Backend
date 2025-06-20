const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  name: String,
  description: String,
  message_limit: Number,
  priority_delivery: Boolean,
  price: Number,
  is_most_popular: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Plan", PlanSchema);