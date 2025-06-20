const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stars: Number,
  comment: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rating", RatingSchema);