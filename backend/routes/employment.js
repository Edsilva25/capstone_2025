// routes/employment.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { companyName, position, startDate, endDate, currentJob, alumniID } = req.body;

  if (!companyName || !position || !startDate || !alumniID) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO employment (companyName, position, startDate, endDate, currentJob, alumniID)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [companyName, position, startDate, endDate || null, currentJob ? 1 : 0, alumniID], (err, result) => {
    if (err) {
      console.error('Error inserting employment:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to save employment' });
    }

    res.json({ status: 'success', message: 'Employment saved' });
  });
});

module.exports = router;
