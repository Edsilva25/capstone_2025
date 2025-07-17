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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/login', loginRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/degree', degreeRoutes);
app.use('/api/employment', employmentRoutes); // 
app.use('/api/donation', donationRoutes);
app.use('/api/skillset', skillsetRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
