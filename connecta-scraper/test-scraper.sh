#!/bin/bash

# Connecta Scraper - Test Run Script
# This script runs the scraper once for testing purposes

echo "======================================"
echo "  Connecta Scraper - Test Run"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the connecta-scraper directory"
    echo "Please run: cd /home/amee/Desktop/connecta/connecta-scraper"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env from env.example..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your API credentials."
    exit 1
fi

# Build the scraper
echo "📦 Building scraper..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Run the scraper
echo "🚀 Running scraper..."
echo "This will:"
echo "  1. Scrape jobs from external sources"
echo "  2. Validate each job"
echo "  3. Auto-categorize jobs"
echo "  4. Save to database with isExternal: true"
echo "  5. Run 14-day cleanup"
echo ""
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

npm start

echo ""
echo "======================================"
echo "  Test Run Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  - Check logs above for errors"
echo "  - Verify jobs in database have isExternal: true"
echo "  - Verify jobs are categorized correctly"
echo "  - Check that validation rejected any invalid jobs"
echo ""
