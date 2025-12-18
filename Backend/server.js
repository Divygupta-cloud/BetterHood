const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load environment variables first
dotenv.config();

// Initialize Firebase Admin
require("./config/firebase");

const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const verifyFirebaseToken = require('./middlewares/firebaseAuthMiddleware');
const errorHandler = require("./middlewares/errorHandler");
const checkEnv = require("./config/checkEnv");

// Check environment variables
checkEnv();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Cross-Origin-Resource-Policy']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
app.use(express.json({ limit: '50mb' }));

// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Database connection with better error handling
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if we can't connect to MongoDB
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

// Error handler middleware (must be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
