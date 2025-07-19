// routes/donation.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all donations
router.get('/', (req, res) => {
  const query = `
    SELECT donationID, alumniID, donationType, amount, donationDate
    FROM donation
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching donations:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});

// GET donation by ID
router.get('/:id', (req, res) => {
  const donationID = req.params.id;
  const sql = `
    SELECT donationID, alumniID, donationType, amount, donationDate
    FROM donation
    WHERE donationID = ?
  `;
  db.query(sql, [donationID], (err, results) => {
    if (err) {
      console.error('Error fetching donation by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Donation not found' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

// POST: Add new donation
router.post('/', (req, res) => {
  const { alumniID, donationType, amount, donationDate } = req.body;

  console.log('🎯 Donation POST request received:', { alumniID, donationType, amount, donationDate });

  if (!alumniID || !donationType || !amount || !donationDate) {
    console.log('❌ Missing required fields:', { alumniID, donationType, amount, donationDate });
    return res.status(400).json({ 
      status: 'error', 
      message: 'Required fields are missing (alumniID, donationType, amount, donationDate)' 
    });
  }

  // First, check if the alumni exists
  db.query('SELECT alumniID FROM alumni WHERE alumniID = ?', [alumniID], (err, results) => {
    if (err) {
      console.error('❌ Error checking alumni existence:', err);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Database error checking alumni',
        details: err.message 
      });
    }

    if (results.length === 0) {
      console.log('❌ Alumni not found with ID:', alumniID);
      return res.status(400).json({
        status: 'error',
        message: `Alumni with ID ${alumniID} does not exist. Please enter a valid Alumni ID.`,
      });
    }

    console.log('✅ Alumni found, proceeding with donation insertion');

    // Get the next available donationID
    db.query('SELECT MAX(donationID) as maxID FROM donation', (err, results) => {
      if (err) {
        console.error('❌ Error getting max donationID:', err);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database error getting next ID',
          details: err.message 
        });
      }

      const nextID = (results[0].maxID || 0) + 1;
      console.log('🎯 Next donationID will be:', nextID);

      // Now insert the donation with the generated ID
      const insert = 'INSERT INTO donation (donationID, alumniID, donationType, amount, donationDate) VALUES (?, ?, ?, ?, ?)';
      const values = [nextID, alumniID, donationType, amount, donationDate];
      
      console.log('🎯 SQL Query:', insert);
      console.log('🎯 Values:', values);

      db.query(insert, values, (err, result) => {
        if (err) {
          console.error('❌ Database error inserting donation:', err);
          console.error('❌ Error code:', err.code);
          console.error('❌ Error message:', err.message);
          return res.status(500).json({ 
            status: 'error', 
            message: 'Failed to insert donation',
            details: err.message 
          });
        }

        console.log('✅ Donation inserted successfully, ID:', nextID);
        res.json({
          status: 'success',
          message: 'Donation saved successfully',
          donationID: nextID,
        });
      });
    });
  });
});

// PUT update donation by ID
router.put('/:id', (req, res) => {
  const donationID = req.params.id;
  const { alumniID, donationType, amount, donationDate } = req.body;

  const sql = `
    UPDATE donation 
    SET alumniID = ?, donationType = ?, amount = ?, donationDate = ?
    WHERE donationID = ?
  `;

  db.query(sql, [alumniID, donationType, amount, donationDate, donationID], (err, result) => {
    if (err) {
      console.error('Error updating donation:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to update donation' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Donation not found' });
    }
    res.json({ status: 'success', message: 'Donation updated successfully' });
  });
});

// DELETE donation by ID
router.delete('/:id', (req, res) => {
  const donationID = req.params.id;

  const sql = 'DELETE FROM donation WHERE donationID = ?';
  db.query(sql, [donationID], (err, result) => {
    if (err) {
      console.error('Error deleting donation:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to delete donation' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Donation not found' });
    }

    res.json({ status: 'success', message: 'Donation deleted successfully' });
  });
});

module.exports = router;
