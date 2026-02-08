#!/bin/bash

# Start the Survey Management System Frontend

echo "🚀 Starting Survey Management System Frontend..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local file not found."
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo "Please update .env.local with your configuration"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s --head --request GET "$NEXT_PUBLIC_API_URL" > /dev/null; then
    echo "✅ Backend is accessible at $NEXT_PUBLIC_API_URL"
else
    echo "⚠️  Warning: Backend at $NEXT_PUBLIC_API_URL is not accessible"
    echo "Please ensure your NestJS backend is running on port 3001"
fi

# Start the development server
echo "⚡ Starting Next.js development server..."
npm run dev