// models/nda.js
const mongoose = require("mongoose");

const ndaSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userASigned: { type: Boolean, default: false },
  userBSigned: { type: Boolean, default: false }
});

module.exports = mongoose.model("NDA", ndaSchema);
