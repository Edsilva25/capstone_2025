// routes/login.js
const express = require('express');
const router = express.Router();

// Fake login route (no DB involved)
router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded check
  if (username === 'admin' && password === 'admin123') {
    console.log('✅ Fake login success for:', username);
    return res.json({ status: 'success', message: 'Login successful' });
  }

  console.log('❌ Fake login failed for:', username);
  return res.status(401).json({ status: 'error', message: 'Invalid username or password' });
});

module.exports = router;
