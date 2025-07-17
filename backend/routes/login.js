// routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Login route
router.post('/', (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 Login attempt:', username);

  if (!username || !password) {
    console.log('⚠️ Missing username or password');
    return res.status(400).json({ status: 'error', message: 'Missing username or password' });
  }

  db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    if (results.length === 0) {
      console.log('❌ No user found with username:', username);
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }

    const user = results[0];
    console.log('✅ User found, checking password');

    if (user.password === password) {
      console.log('✅ Login successful for user:', username);
      return res.json({ status: 'success', message: 'Login successful' });
    } else {
      console.log('❌ Incorrect password for user:', username);
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
  });
});

module.exports = router;
