#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const requiredFiles = [
  'index.html',
  'assets'
];

console.log('🔍 Verifying production build...');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Build failed: dist directory not found');
  process.exit(1);
}

// Check required files
for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Build failed: ${file} not found in dist`);
    process.exit(1);
  }
}

// Check index.html content
const indexPath = path.join(distPath, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (!indexContent.includes('<div id="root">')) {
  console.error('❌ Build failed: index.html missing root div');
  process.exit(1);
}

if (!indexContent.includes('<script')) {
  console.error('❌ Build failed: index.html missing script tags');
  process.exit(1);
}

// Check assets directory
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  const hasJS = assets.some(file => file.endsWith('.js'));
  const hasCSS = assets.some(file => file.endsWith('.css'));
  
  if (!hasJS) {
    console.error('❌ Build failed: No JavaScript files found in assets');
    process.exit(1);
  }
  
  if (!hasCSS) {
    console.error('❌ Build failed: No CSS files found in assets');
    process.exit(1);
  }
}

console.log('✅ Build verification successful!');
console.log(`📦 Build size: ${getDirSize(distPath)} MB`);

function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  }
  
  return (size / (1024 * 1024)).toFixed(2);
}