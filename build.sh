#!/bin/bash

# Build script for Render deployment
set -e

echo "🚀 Starting LinkNest build process..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production
cd ..

# Install frontend dependencies (including dev dependencies for build)
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci
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