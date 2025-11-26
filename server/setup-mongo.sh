#!/bin/bash

echo "🔧 Setting up MongoDB for Connecta..."
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed."
    echo ""
    echo "Please install MongoDB using one of these methods:"
    echo ""
    echo "Option 1: Using Docker (Recommended)"
    echo "  sudo snap install docker"
    echo "  docker-compose up -d"
    echo ""
    echo "Option 2: Install MongoDB Community Edition"
    echo "  Visit: https://www.mongodb.com/docs/manual/installation/"
    echo ""
    exit 1
fi

# Start MongoDB service
echo "🚀 Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Check if MongoDB is running
if systemctl is-active --quiet mongod; then
    echo "✅ MongoDB is running!"
    
    # Update .env file
    echo "📝 Updating .env file..."
    sed -i 's/MONGO_URI=memory/MONGO_URI=mongodb:\/\/localhost:27017\/connecta/' .env
    
    echo ""
    echo "✅ MongoDB setup complete!"
    echo "📍 Connection: mongodb://localhost:27017/connecta"
    echo ""
    echo "Now run: node scripts/create-admin.js"
else
    echo "❌ Failed to start MongoDB"
    exit 1
fi
