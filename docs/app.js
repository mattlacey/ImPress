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

// PWA Installation
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

// Debug: Log initial state
console.log('PWA Install: Script loaded, waiting for beforeinstallprompt event...');

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA Install: beforeinstallprompt event fired!');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installBtn.classList.remove('hidden');
    console.log('PWA Install: Install button should now be visible');

    installBtn.addEventListener('click', async () => {
        console.log('PWA Install: Install button clicked');
        // Hide the install button
        installBtn.classList.add('hidden');
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA Install: User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again
        deferredPrompt = null;
    });
});

// Debug: Check if the browser even supports PWA installation
if (!('BeforeInstallPromptEvent' in window)) {
    console.log('PWA Install: Browser does not support beforeinstallprompt event');
}

// Debug: Manual check after page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!deferredPrompt) {
            console.log('PWA Install: No install prompt received after 3 seconds. Possible reasons:');
            console.log('  - App may already be installed');
            console.log('  - Browser doesn\'t support PWA installation');
            console.log('  - Site doesn\'t meet PWA criteria');
            console.log('  - Need more user engagement (try clicking around)');
            console.log('  - Chrome may require 2 visits 30 seconds apart');

            // Show install button with instructions if not in standalone mode
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                installBtn.classList.remove('hidden');
                installBtn.textContent = '📲 Install App';
                installBtn.addEventListener('click', () => {
                    showManualInstallInstructions();
                });
            }
        }
    }, 3000);
});

// Show manual install instructions
function showManualInstallInstructions() {
    const ua = navigator.userAgent.toLowerCase();
    let instructions = '';
    let icon = '📲';

    if (/iphone|ipad|ipod/.test(ua) && /safari/.test(ua)) {
        icon = '□ ↑';  // Share icon representation
        instructions = 'Tap the Share button at the bottom of Safari, then scroll down and select "Add to Home Screen"';
    } else if (/android/.test(ua)) {
        if (/firefox/.test(ua)) {
            icon = '⚠️';
            instructions = 'Firefox doesn\'t fully support PWA installation. For the best experience, try Chrome or Edge.';
        } else {
            icon = '⋮';  // Three dots menu
            instructions = 'Tap the menu (⋮) in the top right corner, then select "Add to Home Screen" or "Install app"';
        }
    } else if (/firefox/.test(ua)) {
        icon = '⚠️';
        instructions = 'Firefox doesn\'t support PWA installation on desktop. Try Chrome, Edge, or Safari for the best experience.';
    } else {
        icon = '💻';
        instructions = 'Look for the install icon in your browser\'s address bar, or use the browser menu to find "Install" or "Add to Home Screen"';
    }

    // Create a simple modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 90%;
        width: 400px;
        text-align: center;
    `;

    modal.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
        <h2 style="margin: 0 0 1rem 0; color: #1e293b;">Install ImPress</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 1.5rem 0;">${instructions}</p>
        <button onclick="this.closest('div').remove()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
        ">Got it!</button>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    backdrop.onclick = () => {
        modal.remove();
        backdrop.remove();
    };

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// Hide install button if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installBtn.classList.add('hidden');
});

// Check if app is running in standalone mode
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running in standalone mode');
    installBtn.classList.add('hidden');
}