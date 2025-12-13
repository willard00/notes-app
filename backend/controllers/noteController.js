const db = require('../config/database');

exports.getAllNotes = (req, res) => {
  db.all("SELECT * FROM notes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createNote = (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Missing fields" });

  const sql = "INSERT INTO notes (title, content) VALUES (?, ?)";
  db.run(sql, [title, content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, content });
  });
};

exports.updateNote = (req, res) => {
  const { title, content } = req.body;
  const sql = "UPDATE notes SET title = ?, content = ? WHERE id = ?";
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