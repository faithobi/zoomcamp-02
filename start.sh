#!/bin/bash
# Startup script for Online Coding Interview Platform

echo "🚀 Online Coding Interview Platform"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🌐 Starting server on http://localhost:3000"
echo "📤 Share the session link with interview candidates"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
