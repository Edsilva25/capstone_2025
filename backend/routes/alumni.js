// routes/alumni.js
const express = require('express');
const router = express.Router();
const db = require('../db');


// POST create a new alumni
router.post('/', (req, res) => {
  const { fName, lName, email, phone } = req.body;

  if (!fName || !lName) {
    return res.status(400).json({ status: 'error', message: 'First and last name are required' });
  }

  const insert = 'INSERT INTO alumni (fName, lName, email, phone) VALUES (?, ?, ?, ?)';
  db.query(insert, [fName, lName, email || null, phone || null], (err, result) => {
    if (err) {
      console.error('Error adding alumni:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to add alumni' });
    }

    res.json({ status: 'success', message: 'Alumni added', alumniID: result.insertId });
  });
});
// DELETE an alumni by ID
router.delete('/:id', (req, res) => {
  const alumniID = req.params.id;

  const sql = 'DELETE FROM alumni WHERE alumniID = ?';
  db.query(sql, [alumniID], (err, result) => {
    if (err) {
      console.error('Error deleting alumni:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to delete alumni' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Alumni not found' });
    }

    res.json({ status: 'success', message: 'Alumni deleted successfully' });
  });
});
// UPDATE an alumni by ID
router.put('/:id', (req, res) => {
  const alumniID = req.params.id;
  const { fName, lName, email, phone } = req.body;

  const sql = `
  UPDATE alumni 
  SET fName = ?, lName = ?, email = ?, phone = ? 
  WHERE alumniID = ?
`;

  db.query(sql, [fName, lName, email, phone, alumniID], (err, result) => {
    if (err) {
      console.error('Error updating alumni:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to update alumni' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Alumni not found' });
    }

    res.json({ status: 'success', message: 'Alumni updated successfully' });
  });
});
router.get('/', (req, res) => {
  const query = `
    SELECT 
      a.alumniID, 
      a.fName AS firstName, 
      a.lName AS lastName, 
      a.email,
      (
        SELECT d.degreeName 
        FROM degree d 
        WHERE d.alumniID = a.alumniID 
        ORDER BY d.graduationYear DESC 
        LIMIT 1
      ) AS degreeName,
      (
        SELECT d.graduationYear 
        FROM degree d 
        WHERE d.alumniID = a.alumniID 
        ORDER BY d.graduationYear DESC 
        LIMIT 1
      ) AS graduationYear
    FROM alumni a
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching alumni with degrees:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});




module.exports = router;
