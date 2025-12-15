const db = require('../config/database');

exports.getAllNotes = (req, res) => {
  // UPDATED: Sort by created_at DESC (Newest notes first)
  db.all("SELECT * FROM notes ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createNote = (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Missing fields" });

  // UPDATED: Generate current time (ISO format)
  const createdAt = new Date().toISOString();

  const sql = "INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)";
  
  // UPDATED: Pass createdAt to the database
  db.run(sql, [title, content, createdAt], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Return the new data (including time) to the frontend
    res.json({ 
      id: this.lastID, 
      title, 
      content, 
      created_at: createdAt 
    });
  });
};

exports.updateNote = (req, res) => {
  const { title, content } = req.body;
  const sql = "UPDATE notes SET title = ?, content = ? WHERE id = ?";
  
  // (We usually don't update created_at when editing)
  db.run(sql, [title, content, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Updated", changes: this.changes });
  });
};

exports.deleteNote = (req, res) => {
  const sql = "DELETE FROM notes WHERE id = ?";
  db.run(sql, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted", changes: this.changes });
  });
};