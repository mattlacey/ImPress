# Image Resizer PWA

A quick and easy Progressive Web App for resizing images for forums and online use. Works completely offline once installed!

## Features

- 📸 Take photos or select multiple images at once
- 🔄 Automatic resizing maintaining aspect ratio
- 📏 Customizable maximum dimension (default: 1024px)
- 🎨 Adjustable JPEG quality (default: 90%)
- 💾 Automatic download of resized images
- 📱 Installable as a PWA on mobile and desktop
- 🚀 Works offline after installation
- 🎯 Drag and drop support

## How to Use

### Running Locally

1. Navigate to the project directory:
   ```bash
   cd image-resizer-pwa
   ```

2. Start the local server:
   ```bash
   python3 server.py
   ```

3. Open your browser and go to:
   ```
   http://localhost:8000
   ```

### Installing as a PWA

1. Open the app in Chrome, Edge, or any PWA-compatible browser
2. Look for the install icon in the address bar or browser menu
3. Click "Install" when prompted
4. The app will be available as a standalone application

### Using the App

1. **Select Images**: Click the upload box or drag and drop images
2. **Adjust Settings** (optional):
   - Maximum dimension: Controls the longest side of the resized image
   - JPEG Quality: Higher = better quality but larger file size
3. **Process**: Images are automatically resized
4. **Download**: Click individual download buttons or "Download All"

## File Structure

```
image-resizer-pwa/
├── index.html          # Main HTML file
├── app.js             # Core functionality
├── styles.css         # Styling
├── service-worker.js  # Offline support
├── manifest.json      # PWA configuration
├── server.py          # Local test server
└── icons/
    └── icon.svg       # App icon
```

## Technical Details

- Images are resized client-side using HTML5 Canvas
- No data is sent to any server
- All processing happens in your browser
- Maintains aspect ratio automatically
- Outputs JPEG format for best compression

## Browser Support

Works on all modern browsers that support:
- HTML5 Canvas
- File API
- Service Workers (for offline functionality)
- PWA installation (Chrome, Edge, Safari, Firefox)

## Privacy

This app processes all images locally in your browser. No images are uploaded to any server, ensuring complete privacy.

## License

See LICENSE.md
