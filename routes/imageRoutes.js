const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getRandomColor } = require('../utils/colorUtils');

const router = express.Router();

// Multer configuration for dynamic destination based on URL params
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const size = req.params.size;
    const uploadPath = path.join(__dirname, '..', 'images', size);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use the filename from URL parameter
    cb(null, req.params.filename);
  },
});

const upload = multer({ storage });

// Helper to generate SVG preview
function generateSvg(filename, width, height) {
  const bgColor = getRandomColor();
  const borderColor = getRandomColor();
  const textColor = '#FFFFFF';

  return `\n<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n  <rect width="100%" height="100%" fill="${bgColor}" stroke="${borderColor}" stroke-width="3"/>\n  <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}"\n        text-anchor="middle" fill="${textColor}" dominant-baseline="middle" font-weight="bold">${filename}</text>\n  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 12}"\n        text-anchor="middle" fill="${textColor}" dominant-baseline="middle">${width}x${height}</text>\n</svg>`;
}

// GET /images/:size/:filename
router.get('/images/:size/:filename', (req, res) => {
  const { size, filename } = req.params;
  const { preview } = req.query;

  const sizeMatch = size.match(/s(\d+)x(\d+)/);
  if (!sizeMatch) {
    return res.status(400).send('Invalid size format');
  }

  const width = parseInt(sizeMatch[1], 10);
  const height = parseInt(sizeMatch[2], 10);
  const filePath = path.join(__dirname, '..', 'images', size, filename);
  const fileExists = fs.existsSync(filePath);

  if (preview === 'true') {
    const svg = generateSvg(filename, width, height);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(svg);
  }

  // Serve upload form with preview
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Image Upload - ${size}/${filename}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .preview { margin: 20px 0; text-align: center; }
    .preview img { max-width: 100%; border: 1px solid #ccc; }
    .upload-form { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .upload-form input[type="file"] { margin: 10px 0; }
    .upload-form button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
    .upload-form button:hover { background: #0056b3; }
    .status { margin: 10px 0; padding: 10px; border-radius: 3px; }
    .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Image Upload</h1>
    <p><strong>Path:</strong> /images/${size}/${filename}</p>
    <p><strong>Size:</strong> ${width}x${height}</p>
    <div class="preview">
      <h3>Current Image:</h3>
      ${fileExists ? `<img src="/images/${size}/${filename}?preview=true" alt="Current image" />` : '<p>No image uploaded yet</p>'}
    </div>
    <div class="upload-form">
      <h3>Upload New Image:</h3>
      <form action="/images/${size}/${filename}" method="post" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required />
        <br>
        <button type="submit">Upload Image</button>
      </form>
    </div>
    <div id="status"></div>
  </div>
  <script>
    document.querySelector('form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const statusDiv = document.getElementById('status');
      try {
        const response = await fetch('/images/${size}/${filename}', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
          statusDiv.innerHTML = '<div class="status success">Upload successful! Refreshing...</div>';
          setTimeout(() => window.location.reload(), 1200);
        } else {
          statusDiv.innerHTML = '<div class="status error">Upload failed</div>';
        }
      } catch (error) {
        statusDiv.innerHTML = '<div class="status error">Upload failed: ' + error.message + '</div>';
      }
    });
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// POST /images/:size/:filename
router.post('/images/:size/:filename', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      path: req.file.path,
    },
  });
});

module.exports = router;