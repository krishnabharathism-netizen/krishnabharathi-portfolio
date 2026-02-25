#!/usr/bin/env node
// scripts/setup-assets.js
// Run: node scripts/setup-assets.js
// This creates placeholder PNG files for development

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

// Ensure dirs exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal 1x1 transparent PNG in base64
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const files = [
  'profile.png',
  'y1.png', 'y2.png', 'y3.png', 'y4.png', 'y5.png', 'y6.png', 'y7.png',
  'g1.png', 'g2.png', 'g3.png',
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png',
];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, TRANSPARENT_PNG);
    console.log(`✓ Created placeholder: assets/images/${file}`);
  } else {
    console.log(`⚡ Exists: assets/images/${file}`);
  }
});

// Sound dir
const soundDir = path.join(__dirname, '..', 'assets', 'sound');
if (!fs.existsSync(soundDir)) {
  fs.mkdirSync(soundDir, { recursive: true });
}

// PDF dir
const pdfDir = path.join(__dirname, '..', 'assets', 'pdf');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

console.log('\n✅ Asset setup complete!');
console.log('📌 Replace placeholder images with your actual screenshots.');
console.log('📌 Add your backgroundSound.mp3 and success.wav to assets/sound/');
console.log('📌 Add resume.pdf to assets/pdf/');
