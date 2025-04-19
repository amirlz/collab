// routes/nda.js
const express = require("express");
const router = express.Router();
const NDA = require("../models/nda"); // A hypothetical NDA model or you can store in existing user/connection model

// POST /api/nda/sign
router.post("/sign", async (req, res) => {
  try {
    const { userId, receiverId } = req.body;
    if (!userId || !receiverId) {
      return res.status(400).json({ message: "User ID and receiver ID are required." });
    }

    // Check if an NDA record already exists for this pair
    let ndaRecord = await NDA.findOne({
      $or: [
        { userA: userId, userB: receiverId },
        { userA: receiverId, userB: userId }
      ]
    });

    if (!ndaRecord) {
      // If no record, create one
      ndaRecord = new NDA({
        userA: userId,
        userB: receiverId,
        userASigned: true,  // The user who made this request
        userBSigned: false, // The other user
      });
      await ndaRecord.save();
      return res.status(201).json({ message: "NDA created and signed by you. Waiting for other party to sign." });
    }

    // If record exists, update who has signed
    if (ndaRecord.userA === userId && !ndaRecord.userASigned) {
      ndaRecord.userASigned = true;
    } else if (ndaRecord.userB === userId && !ndaRecord.userBSigned) {
      ndaRecord.userBSigned = true;
    } else {
      // If already signed, return a message
      return res.status(200).json({ message: "You have already signed this NDA." });
    }

    await ndaRecord.save();

    // Check if both parties have signed now
    if (ndaRecord.userASigned && ndaRecord.userBSigned) {
      return res.status(200).json({ message: "Both parties have signed the NDA. You can discuss ideas freely!" });
    } else {
      return res.status(200).json({ message: "NDA updated. Waiting for the other party to sign." });
    }
  } catch (error) {
    console.error("❌ Error signing NDA:", error);
    res.status(500).json({ message: "Server error signing NDA." });
  }
});

module.exports = router;
