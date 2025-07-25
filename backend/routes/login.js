// routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing username or password' });
  }

  db.query('SELECT * FROM user WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('❌ DB error during login:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    if (results.length === 0) {
      console.warn('⚠️ No user found for:', username);
      return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        console.log('✅ Successful login for', username);
        return res.json({ status: 'success', message: 'Login successful' });
      } else {
        console.warn('❌ Incorrect password for', username);
        return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
      }
    } catch (err) {
      console.error('❌ bcrypt error:', err);
      return res.status(500).json({ status: 'error', message: 'Password validation error' });
    }
  });
});

module.exports = router;
