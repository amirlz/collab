require('dotenv').config();

// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// REGISTER endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if(existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }
    
    // Hash the password before saving to the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    
    // Generate a JWT token with the new user's id and email
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, "secretkey", { expiresIn: "1h" });
    
    console.log("✅ User registered:", newUser.email);
    
    // Respond with a success message, token, and the new user object
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

// LOGIN endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the given password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token containing the user's id and email
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    console.log("✅ User logged in:", user.email);

    // Send the response including the message, token, and the user object
    res.status(200).json({
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Complete Profile api
router.put('/complete-profile', async (req, res) => {
  try {
    // Expecting the userId along with the profile fields
    const { userId, education, university, faculty, department, skills } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Update the user document with the provided fields
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
