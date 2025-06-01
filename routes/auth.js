require('dotenv').config();

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ name, email, password: hashedPassword, role: "user" });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "1h" }
    );

    console.log("✅ User registered:", newUser.email);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: newUser
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Incoming login for:", email);
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("🧠 Hashed password from DB:", foundUser.password);

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      console.log("🔐 Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
    const token = jwt.sign(
      { id: foundUser._id, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ User logged in:", foundUser.email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// COMPLETE PROFILE
router.put('/complete-profile', async (req, res) => {
  try {
    const { userId, education, university, faculty, department, skills } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { education, university, faculty, department, skills },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
