#!/bin/bash

# 🚀 Quick Deployment Script for Connecta Scraper
# This script helps you deploy the scraper to your VPS

echo "======================================"
echo "  Connecta Scraper - Quick Deploy"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
read -p "Enter your VPS IP address: " VPS_IP
read -p "Enter your VPS username: " VPS_USER
read -p "Enter remote directory (default: /var/www): " REMOTE_DIR
REMOTE_DIR=${REMOTE_DIR:-/var/www}

echo ""
echo "Configuration:"
echo "  VPS IP: $VPS_IP"
echo "  User: $VPS_USER"
echo "  Remote Dir: $REMOTE_DIR"
echo ""

# Ask for deployment method
echo "Choose deployment method:"
echo "  1) Git (recommended)"
echo "  2) SCP (manual upload)"
echo ""
read -p "Enter choice [1-2]: " METHOD

if [ "$METHOD" == "1" ]; then
    echo ""
    echo "${YELLOW}=== Git Deployment ===${NC}"
    echo ""
    
    # Push to git
    read -p "Enter your Git repository URL: " GIT_REPO
    
    echo "${GREEN}Pushing to Git repository...${NC}"
    git add .
    git commit -m "Deploy: improved scraper with validation and categorization"
    git push origin main
    
    echo ""
    echo "${GREEN}Now run these commands on your VPS:${NC}"
    echo ""
    echo "ssh $VPS_USER@$VPS_IP"
    echo "cd $REMOTE_DIR"
    echo "git clone $GIT_REPO"
    echo "cd connecta-scraper"
    echo "npm install"
    echo "npm run build"
    echo "nano .env  # Configure your environment"
    echo "pm2 start ecosystem.config.js"
    echo "pm2 save"
    echo "pm2 startup"
    echo ""
    
elif [ "$METHOD" == "2" ]; then
    echo ""
    echo "${YELLOW}=== SCP Deployment ===${NC}"
    echo ""
    
    # Create tarball
    echo "${GREEN}Creating tarball...${NC}"
    cd ..
    tar -czf connecta-scraper.tar.gz connecta-scraper/ \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        --exclude='.env'
    
    echo "${GREEN}Uploading to VPS...${NC}"
    scp connecta-scraper.tar.gz $VPS_USER@$VPS_IP:$REMOTE_DIR/
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "${GREEN}✅ Upload successful!${NC}"
        echo ""
        echo "${GREEN}Now run these commands on your VPS:${NC}"
        echo ""
        echo "ssh $VPS_USER@$VPS_IP"
        echo "cd $REMOTE_DIR"
        echo "tar -xzf connecta-scraper.tar.gz"
        echo "cd connecta-scraper"
        echo "npm install"
        echo "npm run build"
        echo "nano .env  # Configure your environment"
        echo "pm2 start ecosystem.config.js"
        echo "pm2 save"
        echo "pm2 startup"
        echo ""
    else
        echo "${RED}❌ Upload failed!${NC}"
        echo "Please check your SSH credentials and try again."
        exit 1
    fi
    
    # Cleanup
    rm connecta-scraper.tar.gz
    cd connecta-scraper
else
    echo "${RED}Invalid choice!${NC}"
    exit 1
fi

echo "======================================"
echo "${GREEN}Deployment preparation complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. SSH into your VPS"
echo "  2. Follow the commands above"
echo "  3. Configure .env with your API credentials"
echo "  4. Start the scraper with PM2"
echo "  5. Verify with: pm2 logs connecta-scraper"
echo ""
echo "For detailed instructions, see:"
echo "  DEPLOYMENT_GUIDE.md"
echo ""
