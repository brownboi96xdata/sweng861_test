// middleware/corsAndErrorMiddleware.js

const cors = require('cors');

// CORS configuration options
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your allowed origin(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// CORS middleware
const corsMiddleware = cors(corsOptions);

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
}

module.exports = {
  corsMiddleware,
  errorHandler,
};