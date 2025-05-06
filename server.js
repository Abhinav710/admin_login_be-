// server.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const seedSuperadmin = require('./utils/seedSuperadmin');

// Connect to MongoDB
connectDB().then(() => {
  // Seed default superadmin if it does not exist
  seedSuperadmin();
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

// Register API routes
app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
