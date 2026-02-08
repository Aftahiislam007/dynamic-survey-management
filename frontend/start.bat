@echo off
echo 🚀 Starting Survey Management System Frontend...

REM Check if .env.local exists
if not exist .env.local (
    echo ⚠️  Warning: .env.local file not found.
    echo Creating from .env.example...
    copy .env.example .env.local
    echo Please update .env.local with your configuration
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
)

REM Start the development server
echo ⚡ Starting Next.js development server...
call npm run dev