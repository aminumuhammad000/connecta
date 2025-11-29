# Backend Seed Script Setup Guide

This guide explains how to seed your backend database with comprehensive mock data for the Connecta app.

## Prerequisites

- Node.js installed
- MongoDB running (local or cloud)
- Backend server setup with Mongoose models

## Installation Steps

### 1. Copy the seed script to your backend folder

Move `seed-database.js` from the React Native app folder to your backend server folder:

```bash
cp seed-database.js ../backend/
cd ../backend/
```

### 2. Install required dependencies (if not already installed)

```bash
npm install mongoose bcryptjs
```

### 3. Update MongoDB Connection String

Open `seed-database.js` and update the MongoDB URI on line 12:

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
```

Or set it as an environment variable:

```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/connecta"
```

### 4. Verify Model Schemas

The seed script uses basic schemas. You may need to adjust them to match your actual Mongoose models. Open `seed-database.js` and update the schemas (lines 13-118) to match your backend models.

**Alternative:** Import your actual models instead of defining schemas:

```javascript
// Replace the schema definitions with:
const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');
// ... etc
```

### 5. Run the seed script

```bash
node seed-database.js
```

## What Gets Seeded

The script creates:

- **1 Client User**
  - Email: `uteach38@gmail.com`
  - Password: `password123`
  - Full Name: John Doe
  - UserType: client

- **10 Freelancer Users**
  - Various skills and expertise
  - Different hourly rates
  - Ratings and reviews

- **10 Jobs**
  - Different categories (Mobile Dev, Design, Writing, etc.)
  - Various budgets and durations
  - Multiple statuses (open, in_progress, completed)

- **25 Proposals**
  - Different statuses (pending, approved, rejected)
  - Various amounts and timelines

- **5 Active Projects**
  - Different progress levels
  - Various statuses

- **5 Conversations**
  - 50 total messages between client and freelancers

- **1 Wallet**
  - Balance: ₦450,000
  - 10 transactions (deposits, payments, withdrawals)

- **15 Notifications**
  - Different types (proposals, messages, payments, etc.)
  - Some read, some unread

- **8 Reviews**
  - Ratings between 4.0 and 5.0
  - Detailed comments

- **3 Contracts**
  - Active and completed contracts
  - Signed by both parties

## Expected Output

```
✅ Connected to MongoDB
🔄 Clearing existing data...
👤 Creating client user...
✅ Client user created: uteach38@gmail.com
👥 Creating freelancers...
💼 Creating jobs...
📝 Creating proposals...
🚀 Creating active projects...
💬 Creating messages and conversations...
💰 Creating wallet and transactions...
🔔 Creating notifications...
⭐ Creating reviews...
📄 Creating contracts...

✅ Database seeding completed successfully!

📊 Summary:
   - 1 Client User (uteach38@gmail.com)
   - 10 Freelancer Users
   - 10 Jobs
   - 25 Proposals
   - 5 Active Projects
   - 5 Conversations with 50 Messages
   - 1 Wallet with 10 Transactions
   - 15 Notifications
   - 8 Reviews
   - 3 Contracts

💡 Login credentials:
   Email: uteach38@gmail.com
   Password: password123

🔌 Database connection closed
```

## Testing the App

1. **Start your backend server**:
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **Update API_BASE_URL in constants.ts** (if needed):
   ```typescript
   // For local development
   export const API_BASE_URL = 'http://192.168.x.x:5000'; // Your local IP
   ```

3. **Run the React Native app**:
   ```bash
   cd ../connecta-app
   npm start
   ```

4. **Login with seeded credentials**:
   - Email: `uteach38@gmail.com`
   - Password: `password123`

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running:
```bash
# For local MongoDB
mongod

# Or check if MongoDB service is running
sudo systemctl status mongod
```

### Schema Mismatch
```
Error: Field 'x' is not in schema
```
**Solution**: Update the schemas in `seed-database.js` to match your actual models.

### Duplicate Key Error
```
Error: E11000 duplicate key error
```
**Solution**: The script already clears data. If you still get this error, manually drop the collections:
```bash
mongo connecta --eval "db.dropDatabase()"
```

## Re-running the Script

The script automatically clears all existing data before seeding. You can run it multiple times without issues:

```bash
node seed-database.js
```

## Customization

To modify the seed data:

1. **Change user count**: Edit the loop at line 198
2. **Add more jobs**: Add to `jobData` array at line 229
3. **Modify amounts**: Update budget values in the job data
4. **Change notifications**: Edit `notificationData` array at line 427

## API Endpoints Used by the App

Make sure your backend has these endpoints:

- `POST /api/users/signup` - User registration
- `POST /api/users/signin` - User login
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/freelancers` - Recommended freelancers
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/client/my-jobs` - Client's jobs
- `GET /api/proposals` - Get proposals
- `GET /api/projects/client/my-projects` - Client's projects
- `GET /api/messages/user/:userId/conversations` - Get conversations
- `GET /api/notifications` - Get notifications
- `GET /api/payments/transactions` - Get transactions
- `GET /api/reviews/user/:userId` - Get reviews

## Next Steps

1. ✅ Run the seed script
2. ✅ Start your backend server
3. ✅ Update API_BASE_URL in the app
4. ✅ Login with seeded credentials
5. ✅ Test all features in the client dashboard

## Support

If you encounter issues:
1. Check MongoDB connection
2. Verify backend server is running
3. Check API_BASE_URL in constants.ts
4. Review backend logs for errors
5. Ensure all required endpoints are implemented

---

**Note**: This is test data for development. Never use this in production!
