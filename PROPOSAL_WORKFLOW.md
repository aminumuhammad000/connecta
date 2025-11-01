# Proposal & Project Workflow

## Overview
This document explains the complete workflow for job proposals, from creation to project approval and chat initiation.

## Workflow Steps

### 1. **Client Creates a Job**
- Client goes to `/client/create-job`
- Fills out the job form with title, description, budget, skills, etc.
- Clicks "Publish Job" to save it to the database

### 2. **Seed Proposals for All Freelancers**
Run this command in the server directory to create proposals for all freelancers:

```bash
cd server
npm run seed:job-proposals
```

This script will:
- Find all freelancers in the database
- Get the latest job created by a client
- Create a proposal for each freelancer linking to that job
- Set proposal status as "pending"

### 3. **Freelancers View & Accept Proposals**
- Freelancers go to `/freelancer/proposals`
- They see AI-recommended jobs (proposals)
- When they click "Accept", the proposal status changes to "accepted"

**API Endpoint for Acceptance:**
```
PATCH /api/proposals/:id/status
Body: { "status": "accepted" }
```

### 4. **Client Views Accepted Proposals**
- Client goes to `/client/projects`
- Clicks the "Proposals" tab
- Sees all freelancers who accepted their job proposals
- Can view:
  - Freelancer name, photo, email
  - Skills and bio
  - Proposed rate & estimated duration
  - Cover letter

**API Endpoint:**
```
GET /api/proposals/client/accepted
Headers: { "Authorization": "Bearer <token>" }
```

### 5. **Client Reviews & Approves/Declines**
- **Click on a proposal card** to view full details
- **Approve**: Creates an ongoing project and allows chat
- **Decline**: Rejects the proposal

**API Endpoints:**
```
PUT /api/proposals/:id/approve
PUT /api/proposals/:id/reject
```

### 6. **After Approval - Start Chatting**
- Proposal status changes to "approved"
- A new **Project** is created with status "ongoing"
- Both client and freelancer can see the project
- Client can click **"Start Chat"** to begin messaging the freelancer

**Chat Navigation:**
```
/messages?userId=<freelancerId>
```

### 7. **View Ongoing Projects**
- Client: `/client/projects` → Projects tab
- Freelancer: `/freelancer/dashboard` → Active Projects
- Both see the same project with progress tracking

## Database Models

### Proposal Model
```typescript
{
  title: string
  description: string
  budget: { amount: number, currency: string }
  dateRange: { startDate: Date, endDate: Date }
  type: 'recommendation' | 'referral'
  freelancerId: ObjectId
  jobId: ObjectId
  clientId: ObjectId
  status: 'pending' | 'accepted' | 'declined' | 'approved'
  level: 'entry' | 'intermediate' | 'expert'
  priceType: 'fixed' | 'hourly'
}
```

### Project Model (created on approval)
```typescript
{
  title: string
  description: string
  status: 'ongoing' | 'completed' | 'cancelled'
  budget: { amount: number, currency: string, type: string }
  dateRange: { startDate: Date, endDate: Date }
  clientId: ObjectId
  freelancerId: ObjectId
  jobId: ObjectId
  progress: number
}
```

## Quick Start Guide

### First Time Setup
1. **Create a job** as a client
2. **Run the seed script:**
   ```bash
   cd server
   npm run seed:job-proposals
   ```
3. **Login as a freelancer** and accept proposals at `/freelancer/proposals`
4. **Login as the client** and review proposals at `/client/projects` → Proposals tab
5. **Approve a freelancer** to create the project
6. **Start chatting** with the approved freelancer

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/proposals/freelancer/:id` | Get proposals for a freelancer | No |
| GET | `/api/proposals/client/accepted` | Get accepted proposals for client | Yes |
| PATCH | `/api/proposals/:id/status` | Accept/decline proposal (freelancer) | No |
| PUT | `/api/proposals/:id/approve` | Approve proposal & create project | Yes |
| PUT | `/api/proposals/:id/reject` | Reject proposal | Yes |
| GET | `/api/projects/client/my-projects` | Get client's projects | Yes |
| GET | `/api/projects/freelancer/my-projects` | Get freelancer's projects | Yes |

## Status Flow

```
Pending → (Freelancer Accepts) → Accepted → (Client Approves) → Approved + Project Created
                                          ↘ (Client Declines) → Declined
```

## Notes
- When a proposal is **approved**, both status changes to "approved" AND a new project is created
- The project links the client and freelancer together
- Chat functionality becomes available after approval
- Projects appear in both client and freelancer dashboards
- Freelancers can only accept/decline proposals
- Only clients can approve/reject accepted proposals
