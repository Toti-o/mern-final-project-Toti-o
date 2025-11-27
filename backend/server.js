const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

// ✅ FIXED CORS CONFIGURATION
const corsOptions = {
  origin: [
    "https://mernevent.netlify.app",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// ✅ Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "https://mernevent.netlify.app",     
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
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

    // API root endpoint
    app.get("/", (req, res) => {
      res.json({
        message: "Event RSVP API Server",
        status: "Running",
        version: "1.0.0",
        endpoints: {
          health: "/api/health",
          auth: "/api/auth",
          events: "/api/events", 
          rsvps: "/api/rsvps"
        },
        frontend: "Deployed separately on Netlify"
      });
    });

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
      console.log("🌐 CORS enabled for: https://mernevent.netlify.app");
    });
  })
  .catch(err => {
    console.log("❌ MongoDB Connection Failed:");
    console.log("Error:", err.message);
    process.exit(1);
  });
