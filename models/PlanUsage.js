const mongoose = require("mongoose");

const PlanUsageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  remaining_messages: Number,
  purchased_at: Date,
  expires_at: Date
});

module.exports = mongoose.model("PlanUsage", PlanUsageSchema);