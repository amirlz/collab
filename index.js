require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

console.log("➡️  Loading Express...");
const app = express();
console.log("➡️  Creating Express app...");

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");
const connectionsRoutes = require("./routes/connections");
const messageRoutes = require("./routes/messages");
const ndaRoutes = require("./routes/nda");
const userRoutes = require("./routes/users");

//serving Static Frontend
const path = require('path');


app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/connections", connectionsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/nda", ndaRoutes);
app.use("/api/users", userRoutes);

// Serve static frontend from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Optional: When someone visits the root URL, show the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 5001;
console.log(`➡️  PORT is set to ${PORT}`);

const mongoURI = process.env.MONGO_URI; // Load MongoDB connection string

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Setup Socket.io
const http = require("http");
const { Server } = require("socket.io");

// Import Message model for storing messages
const Message = require("./models/message");

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Chat system
const onlineUsers = {};

io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    socket.on("join", (userId) => {
        onlineUsers[userId] = socket.id;
        console.log(`✅ User ${userId} is now online.`);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        console.log(`📩 New message from ${senderId} to ${receiverId}: ${message}`);
        try {
            const newMessage = new Message({ senderId, receiverId, message });
            await newMessage.save();
            console.log("✅ Message saved to DB.");
        } catch (error) {
            console.error("❌ Error saving message:", error);
        }
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
            console.log(`✅ Message sent to ${receiverId}`);
        } else {
            console.log(`⚠️ User ${receiverId} is offline. Message stored.`);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 A user disconnected:", socket.id);
        for (const userId in onlineUsers) {
            if (onlineUsers[userId] === socke