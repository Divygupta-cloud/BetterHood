const express = require('express'); // Import express framework
const app = express(); // Create an instance of express

const dotenv = require('dotenv'); // Import dotenv to load environment variables
dotenv.config(); 
const port = process.env.PORT || 10000; // Default port

const db = require('./config/db'); // Import the database connection

const authRoutes = require('./routes/authRoutes'); // Import authentication routes
app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded requests
app.use('/api/auth', authRoutes); // Use authentication routes

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});