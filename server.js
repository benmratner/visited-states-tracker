const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database in data directory
const dbPath = path.join(dataDir, 'state-tracker.db');
const db = new Database(dbPath);
console.log(`📊 Database location: ${dbPath}`);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS state_visits (
    state_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes

// Get all state data
app.get('/api/states', (req, res) => {
  try {
    const stmt = db.prepare('SELECT state_id, status FROM state_visits');
    const rows = stmt.all();
    
    const stateData = {};
    rows.forEach(row => {
      stateData[row.state_id] = row.status;
    });
    
    res.json(stateData);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch state data' });
  }
});

// Update a single state
app.post('/api/states/:stateId', (req, res) => {
  try {
    const { stateId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO state_visits (state_id, status, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(state_id) DO UPDATE SET
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(stateId, status);
    res.json({ success: true, stateId, status });
  } catch (error) {
    console.error('Error updating state:', error);
    res.status(500).json({ error: 'Failed to update state' });
  }
});

// Delete a state (set to "none")
app.delete('/api/states/:stateId', (req, res) => {
  try {
    const { stateId } = req.params;
    
    const stmt = db.prepare('DELETE FROM state_visits WHERE state_id = ?');
    stmt.run(stateId);
    
    res.json({ success: true, stateId });
  } catch (error) {
    console.error('Error deleting state:', error);
    res.status(500).json({ error: 'Failed to delete state' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🗺️  State Tracker server running at http://0.0.0.0:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n👋 Database closed. Server shutting down.');
  process.exit(0);
});
