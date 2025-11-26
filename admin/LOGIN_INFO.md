# Connecta Admin Dashboard - Login Information

## 🚀 Demo Mode (Works Without Database)

The admin dashboard now includes **Demo Mode** that works even if MongoDB is not set up!

### Login Credentials

You can use either of these admin accounts:

**Account 1:**
- **Email:** `admin@connecta.com`  
- **Password:** `demo1234`

**Account 2:**
- **Email:** `safe@admin.com`  
- **Password:** `imsafe`

### How It Works

1. **With MongoDB:** Authenticates against real database
2. **Without MongoDB:** Automatically falls back to demo mode with mock data

Both accounts work in both modes!

### Demo Mode Features

✅ Full UI access to all admin pages  
✅ Mock admin user profile  
✅ Sample dashboard statistics  
✅ Test data for users, projects, contracts  
✅ All UI features work (search, filter, view)  

---

## 🔧 Setting Up Real Database

For production use with real data, you need to set up MongoDB:

### Quick Setup

1. **Check if backend is running:**
   ```bash
   cd ../server
   npm run dev
   ```

2. **Setup MongoDB (Choose one option):**

   **Option A: Docker (Easiest)**
   ```bash
   cd ../server
   sudo snap install docker
   docker-compose up -d
   node scripts/create-admin.js
   ```

   **Option B: Local Installation**
   ```bash
   # Follow instructions in ../server/MONGODB_SETUP.md
   ```

   **Option C: MongoDB Atlas (Cloud - Free)**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Get connection string
   - Update `../server/.env` with your connection string

3. **Create admin user:**
   ```bash
   cd ../server
   node scripts/create-admin.js
   ```

---

## 📱 Starting the Application

### Frontend (Admin Dashboard)
```bash
cd /home/mrcoder/Documents/ProjectStation/connecta/admin
npm run dev
# Opens at http://localhost:5173
```

### Backend (API Server)
```bash
cd /home/mrcoder/Documents/ProjectStation/connecta/server
npm run dev
# Runs at http://localhost:5000
```

---

## 🎯 What's Next?

### Current Status
✅ Login page with demo mode  
✅ Dashboard with statistics  
✅ Users management page  
✅ Projects tracking  
✅ Contracts management  
✅ Profile & settings page  
✅ Header with logo, theme toggle, profile dropdown  

### To Be Completed
⏳ Payments page integration  
⏳ Proposals page integration  
⏳ Reviews management  
⏳ Gig Applications tracking  
⏳ Analytics dashboard  
⏳ Notifications system  

---

## 🐛 Troubleshooting

### "User not found" Error
- **Solution:** The app now automatically uses demo mode if database is unavailable
- Just use the demo credentials above

### Backend Not Responding
- Check if backend is running on port 5000
- Check MongoDB connection in `../server/.env`
- Use demo mode to test frontend without backend

### Can't Access After Login
- Clear browser localStorage: `localStorage.clear()`
- Try logging in again with demo credentials

---

## 📚 Documentation

- **MongoDB Setup:** `../server/MONGODB_SETUP.md`
- **API Documentation:** `../server/API.md`
- **Project README:** `./README.md`

---

## 💡 Tips

1. **Demo Mode is perfect for:**
   - Frontend development
   - UI/UX testing
   - Demonstrations
   - Learning the system

2. **Use real database for:**
   - Production deployment
   - Data persistence
   - Multi-user testing
   - API integration testing

3. **Theme Toggle:**
   - Click the moon/sun icon in the header to switch themes
   - System automatically saves your preference

4. **Profile Access:**
   - Click your avatar in the top-right
   - Access profile, settings, help, or logout
