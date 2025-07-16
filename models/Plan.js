const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  name: String,
  description: String,
  message_limit: Number,          // ← how many voice messages the fan can send
  priority_delivery: Boolean,     // ← if the plan has faster delivery
  price: Number,                  // ← in PKR or whatever currency
  is_most_popular: Boolean        // ← for UI highlighting
}, { timestamps: true });

module.exports = mongoose.model("Plan", PlanSchema);
