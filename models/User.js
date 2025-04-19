const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    educationLevel: { type: String, default: "" },
    university: { type: String, default: "" },
    faculty: { type: String, default: "" },
    department: { type: String, default: "" },
    skills: { type: [String], default: [] } ,
    connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Store user IDs who sent requests
    connectedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Store accepted connections
});

module.exports = mongoose.model("User", userSchema);
