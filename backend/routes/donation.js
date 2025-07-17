// routes/donation.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { alumniID, amount, donationDate, donationType } = req.body;

  if (!alumniID || !amount || !donationDate || !donationType) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }

  const sql = 'INSERT INTO donation (alumniID, amount, donationDate, donationType) VALUES (?, ?, ?, ?)';
  db.query(sql, [alumniID, amount, donationDate, donationType], (err, result) => {
    if (err) {
      console.error('Error inserting donation:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to save donation' });
    }
    res.json({ status: 'success', message: 'Donation saved' });
  });
});

module.exports = router;
