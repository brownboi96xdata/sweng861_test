const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Establishes a connection to the MongoDB database.
 * Logs a success message upon connection or exits the process on failure.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;