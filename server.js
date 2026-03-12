const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure data directory and JSON files exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const files = ['videos', 'users', 'comments'];
files.forEach(f => {
  const filePath = path.join(dataDir, `${f}.json`);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
});

// Ensure upload directories exist
['uploads/videos', 'uploads/thumbnails'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Routes
app.use('/api/videos', require('./routes/videos'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/users', require('./routes/users'));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
