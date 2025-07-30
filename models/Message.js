const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["voice", "preset_text"] },
  content: String,
  duration: Number,
  sent_at: Date,
  reviewed: Boolean,
  accepted_policy: Boolean,
  waveform: { type: [Number],default: []},
  approved: Boolean,
});

module.exports = mongoose.model("Message", MessageSchema);