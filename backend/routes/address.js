// routes/address.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST create a new address
router.post('/', (req, res) => {
  const { street, city, state, zipCode, country } = req.body;

  if (!street || !city || !state || !zipCode) {
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing',
    });
  }

  const insert = 'INSERT INTO address (street, city, state, zipCode, country) VALUES (?, ?, ?, ?, ?)';
  db.query(insert, [street, city, state, zipCode, country || null], (err, result) => {
    if (err) {
      console.error('Error inserting address:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to insert address' });
    }

    res.json({
      status: 'success',
      message: 'Address saved',
      addressID: result.insertId,
    });
  });
});

module.exports = router;
