# ⏰ Scraper Schedule Configuration

## Current Schedule

✅ **Daily at 2:00 AM** (Every single day automatically)

This is configured in `ecosystem.config.js`:
```javascript
cron_restart: "0 2 * * *"
```

---

## How It Works

### Daily Cycle:

```
Day 1 - 2:00 AM
├─ PM2 starts scraper
├─ Scraper fetches jobs from:
│  ├─ Jobberman
│  ├─ MyJobMag
│  └─ WeWorkRemotely
├─ Validates each job
├─ Categorizes jobs
├─ Saves to database (isExternal: true)
├─ Runs 14-day cleanup
└─ Scraper exits

PM2 waits...

Day 2 - 2:00 AM
├─ PM2 starts scraper again
└─ Repeat process
```

**This happens EVERY SINGLE DAY automatically!** ♻️

---

## Why 2 AM?

✅ **Low server load** - Fewer users, less traffic  
✅ **Quieter time** - Less competition for resources  
✅ **Fresh jobs** - Ready for morning users  
✅ **Less network congestion** - Faster scraping  

---

## Change Schedule (Optional)

If you want to change when it runs, edit `ecosystem.config.js`:

### More Frequent Scraping

**Every 6 hours** (4 times daily):
```javascript
cron_restart: "0 */6 * * *"
// Runs at: 12 AM, 6 AM, 12 PM, 6 PM
```

**Every 12 hours** (2 times daily):
```javascript
cron_restart: "0 */12 * * *"
// Runs at: 12 AM, 12 PM
```

**Twice daily** (Morning & Evening):
```javascript
cron_restart: "0 8,20 * * *"
// Runs at: 8 AM, 8 PM
```

### Less Frequent Scraping

**Every 2 days** at 2 AM:
```javascript
cron_restart: "0 2 */2 * *"
// Runs every 2 days at 2 AM
```

**Weekly** (Every Monday at 2 AM):
```javascript
cron_restart: "0 2 * * 1"
// Runs only on Mondays at 2 AM
```

---

## After Changing Schedule

If you modify `ecosystem.config.js`, you need to restart PM2:

```bash
# On your VPS
pm2 restart connecta-scraper

# Or delete and recreate
pm2 delete connecta-scraper
pm2 start ecosystem.config.js
pm2 save
```

---

## Manual Run (Anytime)

You can also run the scraper manually anytime:

```bash
# On VPS
cd /var/www/connecta-scraper
npm start

# Or with PM2
pm2 restart connecta-scraper --update-env
```

---

## Monitor Schedule

### Check when last ran:
```bash
pm2 list
# Shows "restart time" and "uptime"
```

### View logs:
```bash
pm2 logs connecta-scraper --lines 50
# See when scraper last ran and results
```

### Real-time monitoring:
```bash
pm2 monit
# Watch scraper in real-time
```

---

## Schedule Recommendations

### For Fresh Jobs (Recommended):
```javascript
cron_restart: "0 2 * * *"  // Daily at 2 AM ⭐
```

### For Very Active Sites:
```javascript
cron_restart: "0 */6 * * *"  // Every 6 hours
```

### For Resource Saving:
```javascript
cron_restart: "0 2 * * 1,4"  // Twice weekly (Mon & Thu)
```

---

## Important Notes

✅ **Automatic Cleanup**: Runs after EVERY scraping cycle  
✅ **14-Day Policy**: Jobs not seen in 14 days are deleted  
✅ **No Manual Work**: PM2 handles everything automatically  
✅ **Survives Reboots**: PM2 auto-starts on server restart  

---

## FAQ

### Q: Will it run even if I'm not logged in?
**A:** Yes! PM2 runs in the background as a service.

### Q: What if the scraper fails?
**A:** PM2 will retry at the next scheduled time (e.g., next day at 2 AM).

### Q: Can I run it more than once a day?
**A:** Yes! Just change the cron schedule (see examples above).

### Q: Will it scrape ALL sources at once?
**A:** Yes! It scrapes Jobberman, MyJobMag, and WeWorkRemotely in one run.

### Q: How long does each run take?
**A:** Usually 5-15 minutes depending on how many jobs are found.

### Q: Will old jobs be deleted immediately?
**A:** No! Jobs stay for 14 days after last being seen (14-day policy).

---

## Current Configuration Summary

| Setting | Value |
|---------|-------|
| **Schedule** | Daily at 2:00 AM |
| **Frequency** | Every 24 hours |
| **Auto-restart** | No (runs once, then exits) |
| **Auto-cleanup** | Yes (after each run) |
| **Sources** | Jobberman, MyJobMag, WeWorkRemotely |
| **Validation** | Enabled |
| **Categorization** | Enabled |
| **14-Day Policy** | Enabled |

---

**Your scraper will run automatically every single day at 2 AM!** 🎉

No manual work needed - PM2 handles everything! ✅
