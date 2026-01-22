#!/bin/bash

# Deploy Connecta Server to VPS with tsx
# Run this script ON THE VPS

echo "🚀 Deploying Connecta Server with tsx..."

# Navigate to server directory
cd /var/www/connecta/server || exit 1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies (includes tsx)
echo "📦 Installing dependencies..."
npm install



# Delete old PM2 processes
echo "🗑️  Stopping old PM2 processes..."
pm2 delete all || pm2 delete server || true

# Remove old dist folder (not needed anymore)
echo "🧹 Cleaning up old build files..."
rm -rf dist dist50

# Start with new ecosystem config
echo "▶️  Starting server with tsx..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Viewing logs (press Ctrl+C to exit)..."
pm2 logs connecta-server --lines 50
