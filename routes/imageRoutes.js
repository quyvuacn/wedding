const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getRandomColor } = require('../utils/colorUtils');
const { generateUploadPage } = require('../templates/uploadPageTemplate');

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
  const html = generateUploadPage({ size, filename, width, height, fileExists });

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