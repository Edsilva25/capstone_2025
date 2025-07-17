// routes/login.js
const express = require('express');
const router = express.Router();

// Fake login route (no DB)
router.post('/', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing username or password' });
  }

  if (username === 'admin' && password === 'admin123') {
    return res.json({ status: 'success', message: 'Login successful!' });
  } else {
    return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
  }
});

module.exports = router;
