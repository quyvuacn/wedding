const express = require('express');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const PORT = 3000;

// Serve static files from project root
app.use(express.static('.'));

// Register image-related routes
app.use('/', imageRoutes);

// Root path serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  console.log('Image fallback is active for /images/:size/:filename');
  console.log('Use ?preview=true for preview, no parameter for upload form');
}); 