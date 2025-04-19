const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import User model



// 🔹 Send Connection Request
router.post("/request", async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Sender and receiver IDs are required." });
        }

        // Find receiver
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already connected
        if (receiver.connectedUsers.includes(senderId)) {
            return res.status(400).json({ message: "You are already connected to this user." });
        }

        // Check if request already exists
        if (receiver.connectionRequests.includes(senderId)) {
            return res.status(400).json({ message: "Connection request already sent." });
        }

        // Add sender ID to receiver’s pending requests
        receiver.connectionRequests.push(senderId);
        await receiver.save();

        res.status(200).json({ message: "Connection request sent successfully." });

    } catch (error) {
        console.error("❌ Error sending request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 Accept Connection Request
router.post("/accept", async (req, res) => {
    const { userId, requesterId } = req.body;

    try {
        if (!userId || !requesterId) {
            return res.status(400).json({ message: "User and requester IDs are required." });
        }

        // Find both users
        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return res.status(404).json({ message: "User not found." });
        }

        // Remove request from user's pending list
        user.connectionRequests = user.connectionRequests.filter(id => id.toString() !== requesterId);

        // Add each other as connected users
        user.connectedUsers.push(requesterId);
        requester.connectedUsers.push(userId);

        await user.save();
        await requester.save();

        res.status(200).json({ message: "Connection request accepted." });

    } catch (error) {
        console.error("❌ Error accepting request:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// 🔹 Reject Connection Request
router.post("/reject", async (req, res) => {
    const { userId, requesterId } = req.body;

    try {
        if (!userId || !requesterId) {
            return res.status(400).json({ message: "User and requester IDs are required." });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Remove request from user's pending list
        user.connectionRequests = user.connectionRequests.filter(id => id.toString() !== requesterId);
        await user.save();

        res.status(200).json({ message: "Connection request rejected." });

    } catch (error) {
        console.error("❌ Error rejecting request:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// 🔹 Get Pending Requests
router.get("/pending/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate("connectionRequests", "name university skills");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user.connectionRequests);

    } catch (error) {
        console.error("❌ Error fetching pending requests:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🔹 Get Connected Users
router.get("/connected/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate("connectedUsers", "name university skills");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user.connectedUsers);

    } catch (error) {
        console.error("❌ Error fetching connected users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
