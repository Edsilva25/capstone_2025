// routes/degree.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all degrees
router.get('/', (req, res) => {
  const query = `
    SELECT degreeID, alumniID, degreeName, year
    FROM degree
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching degrees:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});

// GET degree by alumni ID
router.get('/byAlumni/:alumniID', (req, res) => {
  const alumniID = req.params.alumniID;
  const sql = `
    SELECT degreeID, alumniID, degreeName, year
    FROM degree
    WHERE alumniID = ?
  `;
  db.query(sql, [alumniID], (err, results) => {
    if (err) {
      console.error('Error fetching degree by alumni ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Degree not found for this alumni' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

// GET degree by ID
router.get('/:id', (req, res) => {
  const degreeID = req.params.id;
  const sql = `
    SELECT degreeID, alumniID, degreeName, year
    FROM degree
    WHERE degreeID = ?
  `;
  db.query(sql, [degreeID], (err, results) => {
    if (err) {
      console.error('Error fetching degree by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Degree not found' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

// POST: Add new degree
router.post('/', (req, res) => {
  const { alumniID, degreeName, year } = req.body;

  console.log('🎯 Degree POST request received:', { alumniID, degreeName, year });

  if (!alumniID || !degreeName || !year) {
    console.log('❌ Missing required fields:', { alumniID, degreeName, year });
    return res.status(400).json({ 
      status: 'error', 
      message: 'All fields are required (alumniID, degreeName, year)' 
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

    console.log('✅ Alumni found, proceeding with degree insertion');

    // Get the next available degreeID
    db.query('SELECT MAX(degreeID) as maxID FROM degree', (err, results) => {
      if (err) {
        console.error('❌ Error getting max degreeID:', err);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database error getting next ID',
          details: err.message 
        });
      }

      const nextID = (results[0].maxID || 0) + 1;
      console.log('🎯 Next degreeID will be:', nextID);

      // Now insert the degree with the generated ID
      const insert = 'INSERT INTO degree (degreeID, alumniID, degreeName, year) VALUES (?, ?, ?, ?)';
      const values = [nextID, alumniID, degreeName, year];
      
      console.log('🎯 SQL Query:', insert);
      console.log('🎯 Values:', values);

      db.query(insert, values, (err, result) => {
        if (err) {
          console.error('❌ Database error inserting degree:', err);
          console.error('❌ Error code:', err.code);
          console.error('❌ Error message:', err.message);
          return res.status(500).json({ 
            status: 'error', 
            message: 'Failed to insert degree',
            details: err.message 
          });
        }

        console.log('✅ Degree inserted successfully, ID:', nextID);
        res.json({
          status: 'success',
          message: 'Degree saved successfully',
          degreeID: nextID,
        });
      });
    });
  });
});

// PUT update degree by ID
router.put('/:id', (req, res) => {
  const degreeID = req.params.id;
  const { alumniID, degreeName, year } = req.body;

  const sql = `
    UPDATE degree
    SET alumniID = ?, degreeName = ?, year = ?
    WHERE degreeID = ?
  `;

  db.query(sql, [alumniID, degreeName, year, degreeID], (err, result) => {
    if (err) {
      console.error('Error updating degree:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to update degree' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Degree not found' });
    }
    res.json({ status: 'success', message: 'Degree updated successfully' });
  });
});

// DELETE degree by ID
router.delete('/:id', (req, res) => {
  const degreeID = req.params.id;

  const sql = 'DELETE FROM degree WHERE degreeID = ?';
  db.query(sql, [degreeID], (err, result) => {
    if (err) {
      console.error('Error deleting degree:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to delete degree' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Degree not found' });
    }

    res.json({ status: 'success', message: 'Degree deleted successfully' });
  });
});

module.exports = router;
