// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = window.APP_CONFIG && window.APP_CONFIG.basePath
            ? window.APP_CONFIG.basePath + '/service-worker.js'
            : './service-worker.js';
        navigator.serviceWorker.register(swPath)
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}

// PWA Install prompt
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBtn.classList.add('hidden');
    }
});

// Main app functionality
const fileInput = document.getElementById('file-input');
const uploadBox = document.querySelector('.upload-box');
const maxDimensionInput = document.getElementById('max-dimension');
const qualityInput = document.getElementById('quality');
const progressSection = document.getElementById('progress-section');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const resultsSection = document.getElementById('results');
const imageGrid = document.getElementById('image-grid');
const downloadAllBtn = document.getElementById('download-all');

let processedImages = [];

// Drag and drop functionality
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        handleFiles(files);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleFiles(files);
    }
});

// Handle files
async function handleFiles(files) {
    processedImages = [];
    imageGrid.innerHTML = '';
    progressSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    const maxDimension = parseInt(maxDimensionInput.value);
    const quality = parseInt(qualityInput.value) / 100;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressText.textContent = `Processing ${i + 1} of ${files.length}...`;
        progressFill.style.width = `${((i + 1) / files.length) * 100}%`;

        try {
            const resized = await resizeImage(file, maxDimension, quality);
            processedImages.push(resized);
            displayImage(resized);
        } catch (err) {
            console.error('Error processing image:', err);
        }
    }

    progressSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    fileInput.value = ''; // Reset input
}

// Resize image function
function resizeImage(file, maxDimension, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDimension) {
                        height = height * (maxDimension / width);
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = width * (maxDimension / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw resized image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob((blob) => {
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '_resized.jpg';
                    const url = URL.createObjectURL(blob);

                    resolve({
                        blob,
                        url,
                        fileName,
                        originalDimensions: `${img.width}x${img.height}`,
                        newDimensions: `${Math.round(width)}x${Math.round(height)}`,
                        size: formatBytes(blob.size)
                    });
                }, 'image/jpeg', quality);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Display image in grid
function displayImage(imageData) {
    const card = document.createElement('div');
    card.className = 'image-card';

    card.innerHTML = `
        <img src="${imageData.url}" alt="${imageData.fileName}">
        <div class="image-info">
            <p class="filename">${imageData.fileName}</p>
            <p class="dimensions">${imageData.originalDimensions} → ${imageData.newDimensions}</p>
            <p class="size">${imageData.size}</p>
            <button class="btn btn-small" onclick="downloadImage('${imageData.url}', '${imageData.fileName}')">
                Download
            </button>
        </div>
    `;

    imageGrid.appendChild(card);
}

// Download single image
function downloadImage(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Download all images
downloadAllBtn.addEventListener('click', () => {
    processedImages.forEach((image, index) => {
        setTimeout(() => {
            downloadImage(image.url, image.fileName);
        }, index * 100); // Stagger downloads
    });
});

// Format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}