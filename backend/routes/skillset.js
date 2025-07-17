// routes/skillset.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { skillName, proficiencyLevel, alumniID } = req.body;

  if (!skillName || !proficiencyLevel || !alumniID) {
    return res.status(400).json({ status: 'error', message: 'All fields are required' });
  }

  const sql = 'INSERT INTO skillset (skillName, proficiencyLevel, alumniID) VALUES (?, ?, ?)';
  db.query(sql, [skillName, proficiencyLevel, alumniID], (err, result) => {
    if (err) {
      console.error('Error inserting skill:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to save skill' });
    }
    res.json({ status: 'success', message: 'Skill saved!' });
  });
});

module.exports = router;
