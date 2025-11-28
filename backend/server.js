const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

// ✅ FIXED CORS ORIGINS - Added https:// protocol
const allowedOrigins = [
  "https://mernevent.netlify.app",  // Fixed: added https://
  "http://localhost:3000"
];

// ✅ FIXED CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// ✅ FIXED Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "https://mernevent.netlify.app",  // Fixed: added https://
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ SET Socket.io instance for use in routes
app.set('io', io);

// Middleware
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

// ✅ REMOVED: Frontend static file serving (not needed on Render)
// ✅ ADDED: API root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Event RSVP API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      events: '/api/events',
      rsvps: '/api/rsvps'
    }
  });
});

// ✅ IMPROVED Socket.io for real-time updates with null checks
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-event', (eventId) => {
    if (eventId && socket) {
      socket.join(eventId);
      console.log(`User ${socket.id} joined event ${eventId}`);
    }
  });
  
  socket.on('new-rsvp', (data) => {
    // Add null checks to prevent "Cannot read properties of undefined" error
    if (data && data.eventId && socket) {
      console.log('New RSVP received:', data);
      socket.to(data.eventId).emit('rsvp-update', data);
    } else {
      console.log('Invalid RSVP data or socket not available:', data);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`🔌 Socket.io ready for real-time updates`);
  });
};

startServer();
