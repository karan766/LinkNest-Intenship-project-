#!/bin/bash

# Build script for Render deployment
set -e

echo "🚀 Starting LinkNest build process..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Clean any existing node_modules and lock files to avoid conflicts
echo "🧹 Cleaning existing dependencies..."
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --only=production
cd ..

# Install frontend dependencies (including dev dependencies for build)
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

# Verify build output
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend build successful!"
    echo "📁 Build output:"
    ls -la frontend/dist/
else
    echo "❌ Frontend build failed - dist directory not found"
    exit 1
fi

echo "🎉 Build process completed successfully!"