const express = require("express");
const User = require("../models/User"); // Import the User model

const router = express.Router();

// 🔍 SEARCH USERS ROUTE
router.get("/", async (req, res) => {
    try {
        let { query } = req.query;
        if (query === undefined) {
            return res.status(400).json({ message: "Query parameter is required." });
        }
        // Allow an empty query to return all users (optional)
        if (!query) query = "";
        const searchRegex = new RegExp(query, "i"); // Case-insensitive

        // Search in multiple fields
        const users = await User.find({
            $or: [
                { name: searchRegex },
                { skills: searchRegex },
                { educationLevel: searchRegex },
                { university: searchRegex },
                { faculty: searchRegex },
                { department: searchRegex }
            ]
        }).select("-password"); // Exclude password from results

        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error searching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
