#!/bin/bash

echo "Fixing Next.js configuration..."

# Check if next.config.ts exists
if [ -f "next.config.ts" ]; then
    echo "Found next.config.ts - renaming to next.config.js"
    mv next.config.ts next.config.js
    echo "✅ Configuration file renamed"
else
    echo "next.config.ts not found, checking for other config files..."
fi

# Create next.config.js if it doesn't exist
if [ ! -f "next.config.js" ] && [ ! -f "next.config.mjs" ]; then
    echo "Creating next.config.js..."
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
EOF
    echo "✅ next.config.js created"
fi

echo "✅ Configuration fix complete!"
echo "You can now run: npm run dev"