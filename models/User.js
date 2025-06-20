const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  profile_image: String,
  otp: String,
  is_verified: { type: Boolean, default: false },
  celebrity_type: { type: String, default: null },
  about: { type: String, default: null },
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("User", UserSchema);