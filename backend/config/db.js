const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB connection URL from .env file
const mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL, {});

// Get the default connection
const db = mongoose.connection;

// Event listeners for connection status
db.on('connected', () => {
  console.log('Connected to MongoDB database');
});

db.on('error', (error) => {
  console.error('Error connecting to MongoDB:', error);
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

// Export the connection 
module.exports = db;
