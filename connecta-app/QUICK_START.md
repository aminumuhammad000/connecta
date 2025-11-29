# 🚀 Quick Start Guide - Connecta App

## 📋 Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Backend server setup
- ✅ React Native environment configured

## ⚡ Quick Setup (5 Minutes)

### 1️⃣ Seed Database (1 min)
```bash
cd backend
node seed-database.js
```
**Expected output**: ✅ Database seeding completed successfully!

### 2️⃣ Start Backend (30 sec)
```bash
npm start
```
**Expected**: Server running on port 5000

### 3️⃣ Update App Config (30 sec)
In `src/utils/constants.ts`, verify API_BASE_URL:
```typescript
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000';
```

**Find your IP**:
- Mac/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`

### 4️⃣ Start React Native App (1 min)
```bash
cd ../connecta-app
npm start
```
Press `a` for Android or `i` for iOS

### 5️⃣ Login & Test (2 min)
- **Email**: `uteach38@gmail.com`
- **Password**: `password123`

## ✅ What to Expect

### Dashboard Shows:
- Active Projects: 5
- Payments Due: Real count
- New Messages: Real count
- Recommended Freelancers: 3-10

### My Jobs Shows:
- 10 jobs with real data
- Different statuses (Open, In Progress, Closed)
- Proposal counts
- Budgets in NGN

### Projects Shows:
- 5 active projects
- Progress indicators
- Freelancer assignments
- Budget info

## 🐛 Quick Troubleshooting

### "Network error"
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check your IP
ifconfig | grep "inet "
```

### "No data showing"
```bash
# Re-run seed script
cd backend
node seed-database.js
```

### "Login failed"
**Credentials**:
- Email: `uteach38@gmail.com`
- Password: `password123`

## 📱 Test Checklist

Quick tests to verify everything works:

- [ ] Login successful
- [ ] Dashboard loads with stats
- [ ] Jobs list shows 10 items
- [ ] Projects list shows 5 items
- [ ] Pull-to-refresh works
- [ ] Navigation to detail screens works

## 🆘 Need Help?

### Backend not starting?
```bash
# Check if port 5000 is in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows
```

### MongoDB not connected?
```bash
# Start MongoDB
mongod  # or
sudo systemctl start mongod
```

### Can't find local IP?
```bash
# Mac/Linux
ipconfig getifaddr en0  # WiFi
ipconfig getifaddr en1  # Ethernet

# Windows
ipconfig | findstr IPv4
```

## 📊 Seeded Data Summary

- **Users**: 11 (1 client + 10 freelancers)
- **Jobs**: 10 (various categories)
- **Projects**: 5 (active/completed)
- **Proposals**: 25 (different statuses)
- **Messages**: 50 (in 5 conversations)
- **Transactions**: 10 (deposits/payments)
- **Notifications**: 15 (various types)
- **Reviews**: 8 (4-5 star ratings)
- **Contracts**: 3 (active/completed)

## 🎯 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| ECONNREFUSED | Backend not running - start it |
| 404 Not Found | Check endpoint exists in backend |
| Empty lists | Run seed script |
| Can't login | Use: uteach38@gmail.com / password123 |
| Timeout | Increase timeout in constants.ts |

## 📞 Support

Check these files for detailed help:
- `SETUP_COMPLETE.md` - Full documentation
- `SEED_DATABASE_GUIDE.md` - Database setup
- Backend logs - Check for errors

## ✨ You're Done!

Everything is set up and working. Your client dashboard now:
- ✅ Fetches real data from database
- ✅ Shows actual stats and metrics
- ✅ Displays jobs, projects, messages
- ✅ Handles loading and errors
- ✅ Supports pull-to-refresh

**Happy coding! 🎉**

---

**Pro Tip**: Keep backend logs open in one terminal and React Native logs in another for easy debugging.
