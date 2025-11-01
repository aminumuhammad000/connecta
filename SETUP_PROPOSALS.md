# Quick Setup Guide for Proposal System

## 🚀 How to Set Up Sample Proposals

Follow these steps to test the complete proposal workflow:

### Step 1: Create a Job (as Client)
1. Start your application:
   ```bash
   npm run dev:all
   ```

2. Login as a **client** at `http://localhost:5173`

3. Go to **Create Job**: `http://localhost:5173/client/create-job`

4. Fill out the form and click **"Publish Job"**

### Step 2: Generate Proposals for All Freelancers
Open a new terminal in the server directory and run:

```bash
cd server
npm run seed:job-proposals
```

✅ This will:
- Find all freelancers in your database
- Get the latest job you just created
- Create a proposal for each freelancer
- Link all proposals to your job and client account

### Step 3: Accept Proposals (as Freelancer)
1. **Logout** from the client account

2. **Login as a freelancer** at `http://localhost:5173`

3. Go to **Proposals**: `http://localhost:5173/freelancer/proposals`

4. Click **"Accept"** on one or more proposals

### Step 4: Review Proposals (as Client)
1. **Logout** from the freelancer account

2. **Login back as the client**

3. Go to **Projects**: `http://localhost:5173/client/projects`

4. Click the **"Proposals"** tab

5. You'll see all freelancers who accepted your job!

### Step 5: Approve & Start Chatting
1. **Click on a freelancer card** to view full details

2. Click **"Approve"** to:
   - Create an ongoing project
   - Enable chat functionality

3. After approval, click **"Start Chat"** to message the freelancer

4. The project will now appear in:
   - **Client**: `/client/projects` → Projects tab
   - **Freelancer**: Their dashboard → Active Projects

---

## 📋 Commands Cheat Sheet

```bash
# In server directory

# Create proposals for all freelancers
npm run seed:job-proposals

# Alternative: Seed basic sample proposals
npm run seed:proposals
```

---

## 🔄 Complete Workflow

```
1. Client creates job
   ↓
2. Run: npm run seed:job-proposals
   ↓
3. Freelancers see proposals at /freelancer/proposals
   ↓
4. Freelancers click "Accept"
   ↓
5. Client sees accepted proposals at /client/projects → Proposals tab
   ↓
6. Client clicks "Approve"
   ↓
7. Project created + Chat enabled
   ↓
8. Both can see project & start chatting
```

---

## ⚠️ Important Notes

- **Always create a job first** before running the seed script
- The seed script uses the **most recent job** in the database
- You need **at least one freelancer** in your database
- Make sure you're **logged in as the correct user type**
- After approval, the proposal status becomes **"approved"** and a **project** is created

---

## 🐛 Troubleshooting

### "No freelancers found"
→ You need to register at least one freelancer account

### "No jobs found"
→ Create a job first at `/client/create-job`

### "No proposals showing up"
→ Make sure you ran `npm run seed:job-proposals` after creating the job

### "Can't approve proposal"
→ Make sure you're logged in as the **client who created the job**

---

## 📱 Testing the Full Flow

### Quick Test (5 minutes):
1. Register/Login as **Client**
2. Create a job at `/client/create-job`
3. Run `npm run seed:job-proposals` in server
4. Register/Login as **Freelancer**
5. Go to `/freelancer/proposals` and accept
6. Switch back to **Client**
7. Go to `/client/projects` → Proposals tab
8. Approve a freelancer
9. Click "Start Chat"

✅ Done! You now have a working proposal-to-project-to-chat workflow!

---

## 📚 For More Details
See [PROPOSAL_WORKFLOW.md](./PROPOSAL_WORKFLOW.md) for the complete technical documentation.
