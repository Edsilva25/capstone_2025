// routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Login route
router.post('/', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM user WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });

    if (results.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ status: 'success', message: 'Login successful' });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }
  });
});

module.exports = router;
