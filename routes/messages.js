const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const { encrypt, decrypt } = require("../utils/encryption");

// SEND
router.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const encrypted = encrypt(message);

    const newMessage = new Message({
      senderId,
      receiverId,
      message: encrypted,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", savedMessage });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET CHAT HISTORY
router.get("/", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "senderId and receiverId are required." });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    const decryptedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      message: decrypt(msg.message),
    }));

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
