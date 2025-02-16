const express = require('express');
const connectDB = require('./config/db');
const gameRoutes = require('./routes/gameRoutes');
const { corsMiddleware, errorHandler } = require('./middleware/middleware.js');
const fs = require('fs');
const https = require('https');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(corsMiddleware);
app.use(errorHandler);


connectDB();

// Routes
app.use('/api', gameRoutes);

const PORT = process.env.PORT || 5000;

// Load SSL Certificates if they exist
if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure server running on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
