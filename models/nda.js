// models/nda.js
const mongoose = require("mongoose");

const ndaSchema = new mongoose.Schema({
  userA: { type: String, required: true },
  userB: { type: String, required: true },
  userASigned: { type: Boolean, default: false },
  userBSigned: { type: Boolean, default: false }
});

module.exports = mongoose.model("NDA", ndaSchema);
