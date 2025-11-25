const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",     
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log("🔄 Testing MongoDB connection...");
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    
    // Routes - only load after DB connects
    app.use("/api/events", require("./routes/events"));
    app.use("/api/auth", require("./routes/auth")); 
    app.use("/api/rsvps", require("./routes/rsvps"));
    
    // Health check
    app.get("/api/health", (req, res) => {
      res.json({ 
        status: "OK",
        database: "Connected",
        timestamp: new Date().toISOString()
      });
    });

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../frontend/build")));
    }

    // Serve React app in production
    if (process.env.NODE_ENV === "production") {
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
      });
    }

    // Socket.io for real-time updates
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);
      
      socket.on("join-event", (eventId) => {
        socket.join(eventId);
      });
      
      socket.on("new-rsvp", (data) => {
        socket.to(data.eventId).emit("rsvp-update", data);
      });
      
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log("🚀 Server running on port " + PORT);
      console.log("📊 MongoDB status: Connected");
    });
  })
  .catch(err => {
    console.log("❌ MongoDB Connection Failed:");
    console.log("Error:", err.message);
    process.exit(1);
  });
