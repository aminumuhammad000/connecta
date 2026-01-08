# 🚀 Quick Start Guide - Job Scraper Service

## Prerequisites
- Node.js installed
- Connecta server running

## Step-by-Step Setup (5 minutes)

### 1. Install Scraper Dependencies
```bash
cd /home/amee/Desktop/connecta/connecta-scraper
npm install
npx playwright install chromium
```

### 2. Create Environment File
```bash
cd /home/amee/Desktop/connecta/connecta-scraper
cat > .env << EOF
CONNECTA_API_URL=http://localhost:5000/api
CONNECTA_API_KEY=connecta-scraper-key-2026
SCRAPE_INTERVAL_HOURS=24
MAX_RETRIES=3
RETRY_DELAY_MS=5000
LOG_LEVEL=info
EOF
```

### 3. Add API Key to Connecta Server
```bash
cd /home/amee/Desktop/connecta/server
echo "SCRAPER_API_KEY=connecta-scraper-key-2026" >> .env
```

### 4. Restart Connecta Server
```bash
# If using npm
npm run dev

# If using ts-node
ts-node --swc src/app.ts
```

### 5. Test the Scraper
```bash
cd /home/amee/Desktop/connecta/connecta-scraper
npm run scrape:manual
```

Expected output:
```
[INFO] Starting scraping job...
[INFO] Running scraper: jobberman
[INFO] Scraped X gigs from jobberman
[INFO] ✅ Created/Updated gig: [title] from jobberman
[INFO] ✅ Completed scraper: jobberman
```

### 6. Start Automated Service (Optional)
```bash
npm run dev
```

This will:
- Run immediately on startup
- Schedule automatic scraping every 24 hours
- Keep running in the background

## Verification

Check if external gigs are in database:
```bash
# In MongoDB shell or via API
GET http://localhost:5000/api/external-gigs
Header: X-API-Key: connecta-scraper-key-2026
```

## Troubleshooting

### "API key required"
- Make sure `.env` files are created in both `connecta-scraper` and `server`
- Verify API keys match exactly

### "Cannot find module"
- Run `npm install` in `connecta-scraper` directory

### "Playwright browser not found"
- Run `npx playwright install chromium`

### No gigs scraped
- Job platform may have changed structure
- Check logs for specific errors
- Update selectors in `src/scrapers/jobberman.scraper.ts`

## Next Steps

1. Monitor logs for successful scraping
2. Check Connecta app to see external gigs
3. Add more scrapers (copy `example.scraper.ts`)
4. Configure notification preferences

---

**Need help?** Check the full [README.md](file:///home/amee/Desktop/connecta/connecta-scraper/README.md) or [walkthrough.md](file:///home/amee/.gemini/antigravity/brain/dd0ff26d-d59b-46d6-99c8-b38debfd5982/walkthrough.md)
