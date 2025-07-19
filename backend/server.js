// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const loginRoutes = require('./routes/login');
const alumniRoutes = require('./routes/alumni');
const addressRoutes = require('./routes/address');
const degreeRoutes = require('./routes/degree');
const employmentRoutes = require('./routes/employment');
const donationRoutes = require('./routes/donation');
const skillsetRoutes = require('./routes/skillset');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with custom config
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url} | Headers:`, req.headers['user-agent']?.substring(0, 50) + '...');
  next();
});

// Set up session
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// API Routes (MUST come before static files)
app.use('/api/login', loginRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/degree', degreeRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/skillset', skillsetRoutes);

// Static frontend files (after API routes)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is alive 🔥' });
});

// Test route (temporary)
app.post('/api/test-login', (req, res) => {
  res.json({ status: 'success', message: 'This route is working!' });
});

// 404 fallback (MUST be last)
app.use((req, res) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: 'Route not found', attempted: req.originalUrl });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
