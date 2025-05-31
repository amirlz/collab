const express = require("express");
const router = express.Router();
const User = require("../models/User");
const NDA = require("../models/nda");

// Middleware to ensure user is an admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admins only." });
}

// Route: GET /api/admin/users → get all users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route: GET /api/admin/users/:id/connections → get connected users
router.get("/users/:id/connections", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("connectedUsers", "-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.connectedUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route: DELETE /api/admin/users/:id → delete a user
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove them from other users' connected lists
    await User.updateMany(
      { connectedUsers: req.params.id },
      { $pull: { connectedUsers: req.params.id } }
    );

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ NEW: PUT /api/admin/users/:id → update user profile
router.put("/users/:id", requireAdmin, async (req, res) => {
  try {
    const { name, email, educationLevel, university, faculty, department, skills } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        educationLevel,
        university,
        faculty,
        department,
        skills
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("❌ Admin update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
