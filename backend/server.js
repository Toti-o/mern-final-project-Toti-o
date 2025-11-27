const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup for production
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",     
    methods: ["GET", "POST"]
  }
});

// Middleware - updated CORS for production
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// MongoDB Connection - simplified for production
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('Error:', error.message);
    process.exit(1);
  }
};

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/rsvps', require('./routes/rsvps'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  
  // Serve React app for all other routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join-event', (eventId) => socket.join(eventId));
  socket.on('new-rsvp', (data) => socket.to(data.eventId).emit('rsvp-update', data));
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
