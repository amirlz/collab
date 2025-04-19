// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET user profile
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE user profile
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, education, university, faculty, department, skills } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, education, university, faculty, department, skills },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
