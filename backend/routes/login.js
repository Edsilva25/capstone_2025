// routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Login route
router.post('/', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing username or password' });
  }

  db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    if (results.length === 0) {
      console.log('No user found for', username);
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }

    const user = results[0];

    if (user.password === password) {
      console.log('✅ Plaintext login successful for:', username);
      return res.json({ status: 'success', message: 'Login successful' });
    } else {
      console.log('❌ Wrong password for:', username);
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
  });
});

module.exports = router;
