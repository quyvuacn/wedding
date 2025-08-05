const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const size = req.params.size;
        const uploadPath = path.join(__dirname, 'images', size);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Use the filename from URL parameter
        cb(null, req.params.filename);
    }
});

const upload = multer({ storage: storage });

// Serve static files from current directory
app.use(express.static('.'));

// Generate random color
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#FAD7A0', '#A9CCE3', '#F9E79F', '#D5A6BD', '#A3E4D7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Handle image requests with fallback
app.get('/images/:size/:filename', (req, res) => {
    const { size, filename } = req.params;
    const { preview } = req.query;
    
    // Parse size (e.g., "s650x650" -> width: 650, height: 650)
    const sizeMatch = size.match(/s(\d+)x(\d+)/);
    if (!sizeMatch) {
        return res.status(400).send('Invalid size format');
    }
    
    const width = parseInt(sizeMatch[1]);
    const height = parseInt(sizeMatch[2]);
    
    // Check if actual file exists
    const filePath = path.join(__dirname, 'images', size, filename);
    const fileExists = fs.existsSync(filePath);
    
    // If preview=true, always show SVG preview
    if (preview === 'true') {
        // Generate random colors
        const bgColor = getRandomColor();
        const borderColor = getRandomColor();
        const textColor = '#FFFFFF'; // White text for better contrast
        
        // Create SVG image with original filename and size
        const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" stroke="${borderColor}" stroke-width="3"/>
  <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 8}" 
        text-anchor="middle" fill="${textColor}" dominant-baseline="middle" font-weight="bold">${filename}</text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 12}" 
        text-anchor="middle" fill="${textColor}" dominant-baseline="middle">${width}x${height}</text>
</svg>`;
        
        // Set response headers
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        // Send the SVG
        res.send(svg);
    } else {
        // If preview !== 'true', show upload form with preview of existing file
        const html = `
<!DOCTYPE html>
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
            ${fileExists ? 
                `<img src="/images/${size}/${filename}?preview=true" alt="Current image" />` : 
                `<p>No image uploaded yet</p>`
            }
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
        // Handle form submission
        document.querySelector('form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const statusDiv = document.getElementById('status');
            
            try {
                const response = await fetch('/images/${size}/${filename}', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    statusDiv.innerHTML = '<div class="status success">Upload successful! Refreshing...</div>';
                    setTimeout(() => location.reload(), 1000);
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
    }
});

// Handle file upload
app.post('/images/:size/:filename', upload.single('image'), (req, res) => {
    const { size, filename } = req.params;
    
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
            path: req.file.path
        }
    });
});

// Handle root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
    console.log('Image fallback is active for /images/:size/:filename');
    console.log('Use ?preview=true for preview, no parameter for upload form');
}); 