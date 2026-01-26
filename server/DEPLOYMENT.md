# Connecta Server - TypeScript Deployment Guide

## ✅ What We Fixed

Instead of compiling TypeScript to JavaScript (which requires `.js` extensions in imports), we're now **running TypeScript directly** on your VPS using **tsx**.

---

## 🚀 Deployment Steps on VPS

### 1. SSH into your VPS
```bash
ssh root@your-vps-ip
```

### 2. Navigate to server directory
```bash
cd /var/www/connecta/server
```

### 3. Pull latest changes
```bash
git pull origin main
```

### 4. Install dependencies (including tsx)
```bash
npm install
```

### 5. Stop the old PM2 process
```bash
pm2 delete all
# or specifically:
pm2 delete server
```

### 6. Start with new PM2 config
```bash
pm2 start ecosystem.config.js
```

### 7. Save PM2 configuration
```bash
pm2 save
pm2 startup
```

### 8. Check logs to verify it's running
```bash
pm2 logs connecta-server
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
🔌 Socket.io ready for real-time messaging
```

---

## 🎯 Key Changes

### Before (❌ Broken)
- Compiled TypeScript → JavaScript with `tsc`
- Node ESM required `.js` extensions in imports
- PM2 ran: `node dist/app.js`
- Error: `Cannot find module './config/db.config'`

### After (✅ Working)
- Run TypeScript directly with `tsx`
- No compilation needed
- PM2 runs: `tsx src/app.ts`
- No import extension issues

---

## 📦 What is tsx?

**tsx** is a fast TypeScript runner that:
- ✅ Runs `.ts` files directly (no build step)
- ✅ Handles ESM/CommonJS automatically
- ✅ Works with Node.js native ESM
- ✅ No need for `.js` extensions in TypeScript imports
- ✅ Hot reload support in development
- ✅ Production-ready

---

## 🔧 Local Development

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

---

## 📊 PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs connecta-server

# Restart
pm2 restart connecta-server

# Stop
pm2 stop connecta-server

# Delete
pm2 delete connecta-server

# Monitor
pm2 monit
```

---

## 🆘 Troubleshooting

### If tsx is not found on VPS:
```bash
npm install -g tsx
# or
npm install --save-dev tsx
```

### If port 5000 is busy:
```bash
lsof -ti:5000 | xargs kill -9
pm2 restart connecta-server
```

### View detailed logs:
```bash
pm2 logs connecta-server --lines 100
```

---

## ✨ Benefits of This Approach

1. **No Build Step**: Deploy source code directly
2. **Faster Deployments**: No compilation waiting time
3. **Easier Debugging**: Stack traces point to `.ts` files
4. **Simpler CI/CD**: Just pull and restart PM2
5. **Type Safety**: TypeScript checks happen at runtime
6. **Hot Reload**: `tsx watch` for development

---

## 🔐 Environment Variables

Make sure your `.env` file on the VPS has:
- `MONGO_URI`
- `JWT_SECRET`
- `PORT=5000`
- All other required environment variables

---

## 📝 Notes

- The `package.json` scripts now use `tsx` instead of `ts-node`
- The `ecosystem.config.js` is configured for PM2 to run `tsx src/app.ts`
- No `.js` extensions needed in TypeScript imports anymore
- Source code in `/var/www/connecta/server/src` runs directly

---

That's it! Your server will now run TypeScript directly on the VPS. 🎉
