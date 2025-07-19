// routes/employment.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all employment records
router.get('/', (req, res) => {
  const query = `
    SELECT employmentID, alumniID, company, position, startDate, endDate
    FROM employment
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employment:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});

// GET employment by ID
router.get('/:id', (req, res) => {
  const employmentID = req.params.id;
  const sql = `
    SELECT employmentID, alumniID, company, position, startDate, endDate
    FROM employment
    WHERE employmentID = ?
  `;
  db.query(sql, [employmentID], (err, results) => {
    if (err) {
      console.error('Error fetching employment by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employment not found' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

// POST: Add new employment
router.post('/', (req, res) => {
  const { alumniID, company, position, startDate, endDate } = req.body;

  console.log('🎯 Employment POST request received:', { alumniID, company, position, startDate, endDate });

  if (!alumniID || !company || !position || !startDate) {
    console.log('❌ Missing required fields:', { alumniID, company, position, startDate });
    return res.status(400).json({ 
      status: 'error', 
      message: 'Required fields are missing (alumniID, company, position, startDate)' 
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

    console.log('✅ Alumni found, proceeding with employment insertion');

    // Get the next available employmentID
    db.query('SELECT MAX(employmentID) as maxID FROM employment', (err, results) => {
      if (err) {
        console.error('❌ Error getting max employmentID:', err);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database error getting next ID',
          details: err.message 
        });
      }

      const nextID = (results[0].maxID || 0) + 1;
      console.log('🎯 Next employmentID will be:', nextID);

      // Now insert the employment with the generated ID
      const insert = 'INSERT INTO employment (employmentID, alumniID, company, position, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [nextID, alumniID, company, position, startDate, endDate];
      
      console.log('🎯 SQL Query:', insert);
      console.log('🎯 Values:', values);

      db.query(insert, values, (err, result) => {
        if (err) {
          console.error('❌ Database error inserting employment:', err);
          console.error('❌ Error code:', err.code);
          console.error('❌ Error message:', err.message);
          return res.status(500).json({ 
            status: 'error', 
            message: 'Failed to insert employment',
            details: err.message 
          });
        }

        console.log('✅ Employment inserted successfully, ID:', nextID);
        res.json({
          status: 'success',
          message: 'Employment saved successfully',
          employmentID: nextID,
        });
      });
    });
  });
});

// PUT update employment by ID
router.put('/:id', (req, res) => {
  const employmentID = req.params.id;
  const { alumniID, company, position, startDate, endDate } = req.body;

  const sql = `
    UPDATE employment 
    SET alumniID = ?, company = ?, position = ?, startDate = ?, endDate = ?
    WHERE employmentID = ?
  `;

  db.query(sql, [alumniID, company, position, startDate, endDate, employmentID], (err, result) => {
    if (err) {
      console.error('Error updating employment:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to update employment' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Employment not found' });
    }
    res.json({ status: 'success', message: 'Employment updated successfully' });
  });
});

// DELETE employment by ID
router.delete('/:id', (req, res) => {
  const employmentID = req.params.id;

  const sql = 'DELETE FROM employment WHERE employmentID = ?';
  db.query(sql, [employmentID], (err, result) => {
    if (err) {
      console.error('Error deleting employment:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to delete employment' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Employment not found' });
    }

    res.json({ status: 'success', message: 'Employment deleted successfully' });
  });
});

module.exports = router;
