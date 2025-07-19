// routes/skillset.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all skills
router.get('/', (req, res) => {
  const query = `
    SELECT skillID, alumniID, skillName, skillLevel
    FROM skillset
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching skills:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});

// GET skill by ID
router.get('/:id', (req, res) => {
  const skillID = req.params.id;
  const sql = `
    SELECT skillID, alumniID, skillName, skillLevel
    FROM skillset
    WHERE skillID = ?
  `;
  db.query(sql, [skillID], (err, results) => {
    if (err) {
      console.error('Error fetching skill by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Skill not found' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

// POST: Add new skill
router.post('/', (req, res) => {
  const { alumniID, skillName, skillLevel } = req.body;

  console.log('🎯 Skillset POST request received:', { alumniID, skillName, skillLevel });

  if (!alumniID || !skillName || !skillLevel) {
    console.log('❌ Missing required fields:', { alumniID, skillName, skillLevel });
    return res.status(400).json({ 
      status: 'error', 
      message: 'Required fields are missing (alumniID, skillName, skillLevel)' 
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

    console.log('✅ Alumni found, proceeding with skill insertion');

    // Get the next available skillID
    db.query('SELECT MAX(skillID) as maxID FROM skillset', (err, results) => {
      if (err) {
        console.error('❌ Error getting max skillID:', err);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Database error getting next ID',
          details: err.message 
        });
      }

      const nextID = (results[0].maxID || 0) + 1;
      console.log('🎯 Next skillID will be:', nextID);

      // Now insert the skill with the generated ID
      const insert = 'INSERT INTO skillset (skillID, alumniID, skillName, skillLevel) VALUES (?, ?, ?, ?)';
      const values = [nextID, alumniID, skillName, skillLevel];
      
      console.log('🎯 SQL Query:', insert);
      console.log('🎯 Values:', values);

      db.query(insert, values, (err, result) => {
        if (err) {
          console.error('❌ Database error inserting skill:', err);
          console.error('❌ Error code:', err.code);
          console.error('❌ Error message:', err.message);
          return res.status(500).json({ 
            status: 'error', 
            message: 'Failed to insert skill',
            details: err.message 
          });
        }

        console.log('✅ Skill inserted successfully, ID:', nextID);
        res.json({
          status: 'success',
          message: 'Skill saved successfully',
          skillID: nextID,
        });
      });
    });
  });
});

// PUT update skill by ID
router.put('/:id', (req, res) => {
  const skillID = req.params.id;
  const { alumniID, skillName, skillLevel } = req.body;

  const sql = `
    UPDATE skillset 
    SET alumniID = ?, skillName = ?, skillLevel = ?
    WHERE skillID = ?
  `;

  db.query(sql, [alumniID, skillName, skillLevel, skillID], (err, result) => {
    if (err) {
      console.error('Error updating skill:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to update skill' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Skill not found' });
    }
    res.json({ status: 'success', message: 'Skill updated successfully' });
  });
});

// DELETE skill by ID
router.delete('/:id', (req, res) => {
  const skillID = req.params.id;

  const sql = 'DELETE FROM skillset WHERE skillID = ?';
  db.query(sql, [skillID], (err, result) => {
    if (err) {
      console.error('Error deleting skill:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to delete skill' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Skill not found' });
    }

    res.json({ status: 'success', message: 'Skill deleted successfully' });
  });
});

module.exports = router;
