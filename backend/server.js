const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Added for debugging
const noteRoutes = require('./routes/noteRoutes');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. API Routes
app.use('/api/notes', noteRoutes);

// 2. DEBUG: Check if frontend files exist (Look in the logs for this!)
const distPath = path.join(__dirname, '../frontend/dist');
console.log('Checking for frontend at:', distPath);

if (fs.existsSync(distPath)) {
  console.log('✅ Frontend folder FOUND!');
  const files = fs.readdirSync(distPath);
  console.log('   Files found:', files);
} else {
  console.error('❌ Frontend folder NOT found. Did the build run?');
}

// 3. Serve Static Frontend Files
app.use(express.static(distPath));

// 4. Handle SPA (Single Page App) History Mode
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Error: index.html not found. Please check build logs.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});