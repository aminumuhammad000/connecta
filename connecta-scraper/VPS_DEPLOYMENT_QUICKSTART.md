# 🚀 VPS Deployment - Quick Reference

## Option 1: Interactive Script (Easiest)

```bash
cd /home/amee/Desktop/connecta/connecta-scraper
./deploy-to-vps.sh
```

Follow the prompts to deploy automatically!

---

## Option 2: Manual Git Deployment

### On Local Machine:
```bash
cd /home/amee/Desktop/connecta/connecta-scraper

# Push to Git
git add .
git commit -m "Deploy improved scraper"
git push origin main
```

### On VPS:
```bash
# Connect
ssh user@your-vps-ip

# Clone & Setup
cd /var/www
git clone https://github.com/yourusername/connecta-scraper.git
cd connecta-scraper
npm install
npm run build

# Configure
nano .env
```

**Add to .env:**
```env
CONNECTA_API_URL=https://your-api.com/api
CONNECTA_API_KEY=your-secret-key
SCRAPE_INTERVAL_HOURS=24
MAX_RETRIES=3
RETRY_DELAY_MS=5000
LOG_LEVEL=info
```

**Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Option 3: Manual SCP Upload

### On Local Machine:
```bash
cd /home/amee/Desktop/connecta

# Create tarball (excluding node_modules)
tar -czf scraper.tar.gz connecta-scraper/ \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git'

# Upload
scp scraper.tar.gz user@your-vps-ip:/var/www/
```

### On VPS:
```bash
# Extract & Setup
cd /var/www
tar -xzf scraper.tar.gz
cd connecta-scraper
npm install
npm run build

# Configure .env (same as above)
nano .env

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Essential PM2 Commands

```bash
# Start scraper
pm2 start ecosystem.config.js

# View logs
pm2 logs connecta-scraper

# Check status
pm2 status

# Restart
pm2 restart connecta-scraper

# Monitor
pm2 monit

# Stop
pm2 stop connecta-scraper

# Save configuration
pm2 save
```

---

## Verify Deployment

### 1. Check PM2 Status
```bash
pm2 status
# Should show: connecta-scraper | online
```

### 2. View Logs
```bash
pm2 logs connecta-scraper --lines 50
# Look for:
# ✅ Scraping completed
# ✅ Jobs validated
# ✅ Jobs categorized
# ✅ Cleanup service ran
```

### 3. Test Manually (Optional)
```bash
cd /var/www/connecta-scraper
npm start
# Should see scraping logs
```

---

## Troubleshooting

### Issue: PM2 Not Found
```bash
npm install -g pm2
```

### Issue: Permission Denied
```bash
sudo chown -R $USER:$USER /var/www/connecta-scraper
```

### Issue: Port Already in Use
```bash
pm2 list
pm2 delete <conflicting-process>
```

### Issue: Build Errors
```bash
cd /var/www/connecta-scraper
rm -rf node_modules dist
npm install
npm run build
```

---

## Update Scraper (After Changes)

### Using Git:
```bash
cd /var/www/connecta-scraper
git pull origin main
npm install
npm run build
pm2 restart connecta-scraper
```

### Using SCP:
```bash
# Upload new tarball, then:
cd /var/www
rm -rf connecta-scraper
tar -xzf scraper-new.tar.gz
cd connecta-scraper
npm install
npm run build
pm2 restart connecta-scraper
```

---

## Scheduled Runs

The scraper is configured to run **daily at 2 AM** automatically via PM2 cron.

**To change schedule**, edit `ecosystem.config.js`:
```javascript
cron_restart: "0 2 * * *", // Daily at 2 AM
// Examples:
// "0 */6 * * *"   - Every 6 hours
// "0 */12 * * *"  - Every 12 hours
// "0 0 * * *"     - Daily at midnight
```

Then restart:
```bash
pm2 restart connecta-scraper
```

---

## Important Files

- **`.env`** - API credentials (keep secret!)
- **`ecosystem.config.js`** - PM2 configuration
- **`DEPLOYMENT_GUIDE.md`** - Full deployment docs
- **`deploy-to-vps.sh`** - Interactive deploy script

---

## Quick Health Check

```bash
# Run all checks
pm2 status && \
pm2 logs connecta-scraper --lines 10 && \
echo "Last run:" && \
pm2 ls | grep connecta-scraper
```

---

## Need Help?

1. **Check logs first:** `pm2 logs connecta-scraper`
2. **Review full guide:** `cat DEPLOYMENT_GUIDE.md`
3. **Test manually:** `cd /var/www/connecta-scraper && npm start`

---

**Your scraper is production-ready! 🎉**

Next: Wait for scheduled run at 2 AM or test manually with `npm start`
