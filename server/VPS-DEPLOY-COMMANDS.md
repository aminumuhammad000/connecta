# VPS Deployment Commands

## 🔴 CURRENT PROBLEM:
Your VPS is still trying to run: `node dist/app.js` (old compiled version)
It needs to run: `tsx src/app.ts` (new TypeScript runner)

---

## ✅ SOLUTION - Run these commands ON THE VPS:

### Quick Deploy (All-in-One)
```bash
ssh root@your-vps-ip
cd /var/www/connecta/server
git pull origin main
npm install
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 logs connecta-server
```

---

## 📋 Step-by-Step Commands (if you prefer)

### 1. SSH into VPS
```bash
ssh root@your-vps-ip
```

### 2. Navigate to project
```bash
cd /var/www/connecta/server
```

### 3. Pull latest changes
```bash
git pull origin main
```

### 4. Install tsx
```bash
npm install
```
This will install tsx (already added to package.json)

### 5. Stop old PM2 process
```bash
pm2 delete all
```
or
```bash
pm2 delete server
```

### 6. Start with new config
```bash
pm2 start ecosystem.config.js
```
This tells PM2 to run `tsx src/app.ts` instead of `node dist/app.js`

### 7. Save PM2 config
```bash
pm2 save
```

### 8. Check logs
```bash
pm2 logs connecta-server
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

---

## 🔍 What Changed:

### Before (❌ What VPS is currently doing):
- Running: `pm2 start dist/app.js --name server`
- Using compiled JavaScript in `dist/` folder
- Missing `.js` extensions causing module errors

### After (✅ What VPS should do):
- Running: `pm2 start ecosystem.config.js`
- Executes: `tsx src/app.ts`
- Runs TypeScript directly (no compilation)
- No module resolution errors

---

## 🆘 Troubleshooting:

### If `tsx` command not found after npm install:
```bash
npm install -g tsx
```

### If port 5000 already in use:
```bash
lsof -ti:5000 | xargs kill -9
pm2 restart connecta-server
```

### View full logs:
```bash
pm2 logs connecta-server --lines 200
```

### Check PM2 status:
```bash
pm2 status
pm2 monit
```

---

## 📝 Key Files on VPS:

- **ecosystem.config.js** - PM2 config (runs `tsx src/app.ts`)
- **package.json** - Updated scripts using tsx
- **src/app.ts** - Main TypeScript file (runs directly)
- ~~dist/~~ - No longer needed! Can be deleted

---

That's it! Once you run those commands on the VPS, it will run TypeScript directly. 🎉
