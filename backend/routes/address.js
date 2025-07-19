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

  console.log('🎯 Address POST request received:', { alumniID, street, city, state, zip, primaryYN, mailingYN });

  if (!alumniID || !street || !city || !state || !zip) {
    console.log('❌ Missing required fields:', { alumniID, street, city, state, zip });
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing (alumniID, street, city, state, zip)',
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

    console.log('✅ Alumni found, proceeding with address insertion');

    // First, get the next available addressID
    db.query('SELECT MAX(addressID) as maxID FROM address', (err, results) => {
      if (err) {
        console.error('❌ Error getting max addressID:', err);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database error getting next ID',
          details: err.message 
        });
      }

      const nextID = (results[0].maxID || 0) + 1;
      console.log('🎯 Next addressID will be:', nextID);

      // Now insert the address with the generated ID
      const insert = 'INSERT INTO address (addressID, alumniID, street, city, state, zip, primaryYN, mailingYN) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [nextID, alumniID, street, city, state, zip, primaryYN || 0, mailingYN || 0];
      
      console.log('🎯 SQL Query:', insert);
      console.log('🎯 Values:', values);

      db.query(insert, values, (err, result) => {
        if (err) {
          console.error('❌ Database error inserting address:', err);
          console.error('❌ Error code:', err.code);
          console.error('❌ Error message:', err.message);
          return res.status(500).json({ 
            status: 'error', 
            message: 'Failed to insert address',
            details: err.message 
          });
        }

        console.log('✅ Address inserted successfully, ID:', nextID);
        res.json({
          status: 'success',
          message: 'Address saved successfully',
          addressID: nextID,
        });
      });
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
