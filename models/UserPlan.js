const mongoose = require("mongoose");

const UserPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  remaining_messages: {
    type: Number,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  purchased_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("UserPlan", UserPlanSchema);
