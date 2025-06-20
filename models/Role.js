const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: { type: String, enum: ["fan", "celebrity", "admin"], required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);