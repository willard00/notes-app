const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Creates 'notes.db' in the backend root folder
const dbPath = path.resolve(__dirname, '../notes.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // UPDATED: Added created_at column
    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      created_at TEXT
    )`);
  }
});

module.exports = db;