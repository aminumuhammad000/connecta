# 🚀 Deploying Connecta Scraper to VPS

## Prerequisites

Before deploying, ensure your VPS has:
- ✅ Node.js (v16 or higher)
- ✅ npm or yarn
- ✅ PM2 (process manager)
- ✅ Git (optional, for easier updates)

---

## Method 1: Using Git (Recommended)

### Step 1: Push Code to Git Repository

**On Your Local Machine:**

```bash
cd /home/amee/Desktop/connecta/connecta-scraper

# Initialize git if not already done
git init

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/connecta-scraper.git

# Add all files
git add .

# Commit changes
git commit -m "feat: improved scraper with validation, categorization, and 14-day policy"

# Push to repository
git push -u origin main
```

### Step 2: Clone on VPS

**On Your VPS:**

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to your application directory
cd /var/www  # or wherever you keep your apps

# Clone the repository
git clone https://github.com/yourusername/connecta-scraper.git

# Navigate to scraper directory
cd connecta-scraper
```

### Step 3: Install Dependencies & Build

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 4: Configure Environment

```bash
# Create .env file
nano .env
```

**Add your configuration:**

```env
# API Configuration
CONNECTA_API_URL=https://your-production-api.com/api
CONNECTA_API_KEY=your-secret-api-key-here

# Scraping Configuration
SCRAPE_INTERVAL_HOURS=24
MAX_RETRIES=3
RETRY_DELAY_MS=5000

# Logging
LOG_LEVEL=info
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 5: Set Up PM2

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the scraper with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to auto-start on server reboot
pm2 startup

# Follow the command output to set up auto-start
```

### Step 6: Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs connecta-scraper

# Monitor in real-time
pm2 monit
```

---

## Method 2: Using SCP/SFTP (Manual Upload)

### Step 1: Prepare Files Locally

**On Your Local Machine:**

```bash
cd /home/amee/Desktop/connecta

# Create a tarball of the scraper directory
tar -czf connecta-scraper.tar.gz connecta-scraper/

# Or zip it
# zip -r connecta-scraper.zip connecta-scraper/
```

### Step 2: Upload to VPS Using SCP

```bash
# Upload the tarball
scp connecta-scraper.tar.gz user@your-vps-ip:/var/www/

# OR upload the entire directory
scp -r connecta-scraper user@your-vps-ip:/var/www/
```

### Step 3: Extract and Setup on VPS

**On Your VPS:**

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to upload location
cd /var/www

# Extract tarball (if you uploaded .tar.gz)
tar -xzf connecta-scraper.tar.gz

# Navigate to directory
cd connecta-scraper

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 4: Configure Environment

```bash
# Create .env file
nano .env
```

Add your configuration (same as Method 1 Step 4)

### Step 5: Set Up PM2

Same as Method 1 Step 5

---

## Method 3: Using SFTP Client (GUI)

### Step 1: Use FileZilla/WinSCP

1. **Download FileZilla** (https://filezilla-project.org/) or **WinSCP** (https://winscp.net/)
2. **Connect to your VPS:**
   - Host: `your-vps-ip`
   - Username: `your-username`
   - Password: `your-password`
   - Port: `22` (default SSH)

3. **Upload the scraper:**
   - Local directory: `/home/amee/Desktop/connecta/connecta-scraper`
   - Remote directory: `/var/www/connecta-scraper`
   - Drag and drop all files

### Step 2: SSH and Setup

Follow Method 2, Steps 3-5

---

## PM2 Configuration

The scraper includes `ecosystem.config.js` which is already configured:

```javascript
module.exports = {
  apps: [
    {
      name: "connecta-scraper",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 2 * * *", // Run daily at 2 AM
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### PM2 Commands Cheat Sheet

```bash
# Start scraper
pm2 start ecosystem.config.js

# Stop scraper
pm2 stop connecta-scraper

# Restart scraper
pm2 restart connecta-scraper

# Delete from PM2
pm2 delete connecta-scraper

# View logs
pm2 logs connecta-scraper

# Real-time logs
pm2 logs connecta-scraper --lines 100

# Monitor
pm2 monit

# Save current PM2 state
pm2 save

# List all processes
pm2 list

# Show process details
pm2 show connecta-scraper
```

---

## Scheduling Options

### Option 1: PM2 Cron (Already Configured)

The `ecosystem.config.js` already has cron configured to run daily at 2 AM:

```javascript
cron_restart: "0 2 * * *", // Daily at 2 AM
```

**Different schedules:**
- Every 6 hours: `0 */6 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at midnight: `0 0 * * *`
- Daily at 2 AM: `0 2 * * *`
- Twice daily (6 AM & 6 PM): `0 6,18 * * *`

### Option 2: System Cron (Alternative)

```bash
# Edit crontab
crontab -e

# Add daily run at 2 AM
0 2 * * * cd /var/www/connecta-scraper && /usr/bin/npm start >> /var/log/connecta-scraper.log 2>&1
```

---

## Nginx Configuration (If Using Reverse Proxy)

If you want to expose scraper stats via API:

```nginx
# /etc/nginx/sites-available/connecta-scraper
server {
    listen 80;
    server_name scraper.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoring & Logs

### View PM2 Logs

```bash
# Real-time logs
pm2 logs connecta-scraper

# Last 100 lines
pm2 logs connecta-scraper --lines 100

# Error logs only
pm2 logs connecta-scraper --err

# Output logs only
pm2 logs connecta-scraper --out
```

### Check Scraper Statistics

```bash
# After a scraping run, check the logs for:
# - Number of jobs scraped
# - Number of jobs validated
# - Number of jobs rejected
# - Number of jobs categorized
# - Number of jobs saved
# - Cleanup statistics
```

### System Resource Monitoring

```bash
# PM2 built-in monitoring
pm2 monit

# Linux system resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

---

## Updating the Scraper

### Using Git

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to scraper directory
cd /var/www/connecta-scraper

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild TypeScript
npm run build

# Restart PM2
pm2 restart connecta-scraper
```

### Using SCP/SFTP

1. Upload updated files using same method as initial deployment
2. SSH into VPS and rebuild:

```bash
cd /var/www/connecta-scraper
npm install
npm run build
pm2 restart connecta-scraper
```

---

## Troubleshooting

### Scraper Not Running

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs connecta-scraper --err

# Restart
pm2 restart connecta-scraper
```

### Connection Issues

```bash
# Test API connection
curl -X GET "https://your-api.com/api/external-gigs?limit=1" \
  -H "X-API-Key: your-api-key"

# Check environment variables
pm2 env 0  # Replace 0 with your process ID
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/connecta-scraper
chmod -R 755 /var/www/connecta-scraper
```

---

## Security Best Practices

### 1. Secure Environment Variables

```bash
# Protect .env file
chmod 600 .env

# Don't commit .env to git
echo ".env" >> .gitignore
```

### 2. Use SSH Keys (Instead of Password)

```bash
# Generate SSH key on local machine
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy to VPS
ssh-copy-id user@your-vps-ip

# Now you can SSH without password
ssh user@your-vps-ip
```

### 3. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS if needed
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 4. Keep System Updated

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (using nvm)
nvm install --lts
nvm use --lts
```

---

## Complete Deployment Checklist

- [ ] **Prerequisites installed** (Node.js, npm, PM2)
- [ ] **Code uploaded** to VPS (via Git, SCP, or SFTP)
- [ ] **Dependencies installed** (`npm install`)
- [ ] **TypeScript built** (`npm run build`)
- [ ] **Environment configured** (`.env` file created)
- [ ] **PM2 configured** and started
- [ ] **PM2 auto-start** enabled (`pm2 startup`)
- [ ] **First run tested** (check logs for success)
- [ ] **Cron schedule** verified (daily at 2 AM)
- [ ] **Monitoring** set up (`pm2 monit`)
- [ ] **Logs** reviewed for errors
- [ ] **Database** checked for new external jobs
- [ ] **Documentation** saved for future reference

---

## Quick Deploy Script

Create a deployment script for easy updates:

```bash
# deploy.sh
#!/bin/bash

echo "🚀 Deploying Connecta Scraper..."

# Navigate to directory
cd /var/www/connecta-scraper

# Pull latest changes (if using git)
git pull origin main

# Install dependencies
npm install

# Build TypeScript
npm run build

# Restart PM2
pm2 restart connecta-scraper

# Show status
pm2 status

echo "✅ Deployment complete!"
```

Make it executable:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Support & Maintenance

### Regular Checks (Weekly)

```bash
# Check PM2 status
pm2 status

# Review logs for errors
pm2 logs connecta-scraper --lines 50 --err

# Check database for external jobs
# Connect to MongoDB and verify jobs are being saved
```

### Monthly Maintenance

```bash
# Update dependencies
npm update

# Rebuild
npm run build

# Restart
pm2 restart connecta-scraper

# Clear old PM2 logs
pm2 flush
```

---

## Contact & Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs connecta-scraper`
2. Verify .env configuration
3. Test API connection manually
4. Review error messages in logs
5. Check database connectivity

**Your scraper is now ready for production! 🎉**
