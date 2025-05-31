require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");

// Models
const Message = require("./models/message");

console.log("➡️  Loading Express...");
const app = express();
console.log("➡️  Creating Express app...");

// Middleware
app.use(express.json());
app.use(cors());

app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // no token provided, skip
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user; // Attach user to the request
    }
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
  }

  next(); // Continue to route
});

// Import routes that do NOT depend on DB connection
const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");
const connectionsRoutes = require("./routes/connections");
const messageRoutes = require("./routes/messages");
const ndaRoutes = require("./routes/nda");
const userRoutes = require("./routes/users");

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

// Setup Socket.io server
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

  const { encrypt, decrypt } = require("./utils/encryption");

socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
  console.log(`📩 New message from ${senderId} to ${receiverId}: ${message}`);

  try {
    const encrypted = encrypt(message);
    const newMessage = new Message({ senderId, receiverId, message: encrypted });
    await newMessage.save();
    console.log("✅ Encrypted message saved to DB.");
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
      if (onlineUsers[userId] === socket.id) {
        console.log(`❌ User ${userId} is now offline.`);
        delete onlineUsers[userId];
        break;
      }
    }
  });
});

// Connect to MongoDB first, then require admin routes and start the server
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    // Require routes that depend on models AFTER DB connection is ready
    const adminRoutes = require("./routes/admin");
    app.use("/api/admin", adminRoutes);

    // Now start the server
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
