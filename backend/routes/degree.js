// routes/degree.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST: Add new degree
router.post('/', (req, res) => {
  const { degreeName, major, graduationYear, alumniID } = req.body;

  if (!degreeName || !major || !graduationYear || !alumniID) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }

  const sql = 'INSERT INTO degree (degreeName, major, graduationYear, alumniID) VALUES (?, ?, ?, ?)';
  db.query(sql, [degreeName, major, graduationYear, alumniID], (err, result) => {
    if (err) {
      console.error('Error inserting degree:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to save degree' });
    }
    res.json({ status: 'success', message: 'Degree saved' });
  });
});

// ✅ GET degree by alumni ID
router.get('/byAlumni/:alumniID', (req, res) => {
  const id = req.params.alumniID;
  db.query('SELECT * FROM degree WHERE alumniID = ? LIMIT 1', [id], (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to fetch degree' });
    if (results.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: results[0] });
  });
});

// ✅ PUT update degree by alumni ID
router.put('/byAlumni/:alumniID', (req, res) => {
  const { alumniID } = req.params;
  const { degreeName, major, graduationYear } = req.body;

  const sql = `
    UPDATE degree
    SET degreeName = ?, major = ?, graduationYear = ?
    WHERE alumniID = ?
  `;

  db.query(sql, [degreeName, major, graduationYear, alumniID], (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Update failed' });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Degree updated successfully' });
  });
});

module.exports = router;
