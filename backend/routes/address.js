// routes/address.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all addresses
router.get('/', (req, res) => {
  const query = `
    SELECT addressID, alumniID, street, city, state, zip, primaryYN, mailingYN
    FROM address
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching addresses:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});

// GET address by ID
router.get('/:id', (req, res) => {
  const addressID = req.params.id;
  const sql = `
    SELECT addressID, alumniID, street, city, state, zip, primaryYN, mailingYN
    FROM address
    WHERE addressID = ?
  `;
  db.query(sql, [addressID], (err, results) => {
    if (err) {
      console.error('Error fetching address by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Address not found' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

// POST create a new address
router.post('/', (req, res) => {
  const { alumniID, street, city, state, zip, primaryYN, mailingYN } = req.body;

  if (!alumniID || !street || !city || !state || !zip) {
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing (alumniID, street, city, state, zip)',
    });
  }

  const insert = 'INSERT INTO address (alumniID, street, city, state, zip, primaryYN, mailingYN) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(insert, [alumniID, street, city, state, zip, primaryYN || 0, mailingYN || 0], (err, result) => {
    if (err) {
      console.error('Error inserting address:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to insert address' });
    }

    res.json({
      status: 'success',
      message: 'Address saved successfully',
      addressID: result.insertId,
    });
  });
});

// PUT update an address
router.put('/:id', (req, res) => {
  const addressID = req.params.id;
  const { alumniID, street, city, state, zip, primaryYN, mailingYN } = req.body;

  const sql = `
    UPDATE address 
    SET alumniID = ?, street = ?, city = ?, state = ?, zip = ?, primaryYN = ?, mailingYN = ?
    WHERE addressID = ?
  `;

  db.query(sql, [alumniID, street, city, state, zip, primaryYN || 0, mailingYN || 0, addressID], (err, result) => {
    if (err) {
      console.error('Error updating address:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to update address' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Address not found' });
    }

    res.json({ status: 'success', message: 'Address updated successfully' });
  });
});

// DELETE an address
router.delete('/:id', (req, res) => {
  const addressID = req.params.id;

  const sql = 'DELETE FROM address WHERE addressID = ?';
  db.query(sql, [addressID], (err, result) => {
    if (err) {
      console.error('Error deleting address:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to delete address' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Address not found' });
    }

    res.json({ status: 'success', message: 'Address deleted successfully' });
  });
});

module.exports = router;
