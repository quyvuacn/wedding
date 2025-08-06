function generateUploadPage({ size, filename, width, height, fileExists }) {
  return `<!DOCTYPE html>
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
}

module.exports = { generateUploadPage };