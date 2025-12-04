@echo off
REM Startup script for Online Coding Interview Platform (Windows)

echo.
echo ========================================
echo.
echo 🚀 Online Coding Interview Platform
echo.
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Navigate to backend
cd backend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing backend dependencies...
    call npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🌐 Starting server on http://localhost:3000
echo 📤 Share the session link with interview candidates
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
pause
