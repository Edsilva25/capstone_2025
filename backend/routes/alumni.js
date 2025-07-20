// routes/alumni.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all alumni
router.get('/', (req, res) => {
  const query = `
    SELECT 
      a.alumniID, 
      a.fName AS firstName, 
      a.lName AS lastName, 
      a.email,
      d.year AS graduationYear,
      d.degreeName
    FROM alumni a
    LEFT JOIN degree d ON a.alumniID = d.alumniID
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching alumni:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    res.json({ status: 'success', data: results });
  });
});

// GET alumni by ID (MUST come before the general '/' route)
router.get('/:id', (req, res) => {
  console.log('🎯 GET /:id route hit with ID:', req.params.id);
  const alumniID = req.params.id;
  const sql = `
    SELECT alumniID, fName AS firstName, lName AS lastName, email, phone
    FROM alumni
    WHERE alumniID = ?
  `;
  db.query(sql, [alumniID], (err, results) => {
    if (err) {
      console.error('Error fetching alumni by ID:', err);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Alumni not found' });
    }
    res.json({ status: 'success', data: results[0] });
  });
});

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

// DELETE an alumni by ID
router.delete('/:id', (req, res) => {
  const alumniID = req.params.id;

  // Use a transaction to ensure all-or-nothing deletion
  req.app.get('db') ? req.app.get('db').getConnection((err, connection) => {
    if (err) {
      console.error('Error getting DB connection:', err);
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to start transaction' });
      }
      // Delete from all related tables first
      const tables = [
        { table: 'degree', col: 'alumniID' },
        { table: 'address', col: 'alumniID' },
        { table: 'employment', col: 'alumniID' },
        { table: 'donation', col: 'alumniID' },
        { table: 'skillset', col: 'alumniID' }
      ];
      let idx = 0;
      function deleteNext() {
        if (idx >= tables.length) {
          // Now delete the alumni
          connection.query('DELETE FROM alumni WHERE alumniID = ?', [alumniID], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error deleting alumni:', err);
                res.status(500).json({ status: 'error', message: 'Failed to delete alumni' });
              });
            }
            if (result.affectedRows === 0) {
              return connection.rollback(() => {
                connection.release();
                res.status(404).json({ status: 'error', message: 'Alumni not found' });
              });
            }
            connection.commit(err => {
              connection.release();
              if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
              }
              res.json({ status: 'success', message: 'Alumni deleted successfully' });
            });
          });
        } else {
          const { table, col } = tables[idx++];
          connection.query(`DELETE FROM ${table} WHERE ${col} = ?`, [alumniID], (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error(`Error deleting from ${table}:`, err);
                res.status(500).json({ status: 'error', message: `Failed to delete related ${table}` });
              });
            }
            deleteNext();
          });
        }
      }
      deleteNext();
    });
  }) : db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting DB connection:', err);
      return res.status(500).json({ status: 'error', message: 'Database connection error' });
    }
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to start transaction' });
      }
      // Delete from all related tables first
      const tables = [
        { table: 'degree', col: 'alumniID' },
        { table: 'address', col: 'alumniID' },
        { table: 'employment', col: 'alumniID' },
        { table: 'donation', col: 'alumniID' },
        { table: 'skillset', col: 'alumniID' }
      ];
      let idx = 0;
      function deleteNext() {
        if (idx >= tables.length) {
          // Now delete the alumni
          connection.query('DELETE FROM alumni WHERE alumniID = ?', [alumniID], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error deleting alumni:', err);
                res.status(500).json({ status: 'error', message: 'Failed to delete alumni' });
              });
            }
            if (result.affectedRows === 0) {
              return connection.rollback(() => {
                connection.release();
                res.status(404).json({ status: 'error', message: 'Alumni not found' });
              });
            }
            connection.commit(err => {
              connection.release();
              if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ status: 'error', message: 'Failed to commit transaction' });
              }
              res.json({ status: 'success', message: 'Alumni deleted successfully' });
            });
          });
        } else {
          const { table, col } = tables[idx++];
          connection.query(`DELETE FROM ${table} WHERE ${col} = ?`, [alumniID], (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error(`Error deleting from ${table}:`, err);
                res.status(500).json({ status: 'error', message: `Failed to delete related ${table}` });
              });
            }
            deleteNext();
          });
        }
      }
      deleteNext();
    });
  });
});

module.exports = router;
