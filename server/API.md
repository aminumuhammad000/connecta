# Connecta Backend API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication & Users (`/api/users`)

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/signup` | Register new user | No |
| POST | `/api/users/signin` | Login user | No |
| POST | `/api/users/google/signup` | Register with Google | No |
| POST | `/api/users/google/signin` | Login with Google | No |

### User Data Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users with filters (`?userType=freelancer&skills=React&limit=20`) | No |
| GET | `/api/users/:id` | Get user by ID | No |

---

## 👤 Profiles (`/api/profiles`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/profiles` | Create new profile | No |
| GET | `/api/profiles` | Get all profiles | No |
| GET | `/api/profiles/me` | Get authenticated user's profile | Yes |
| GET | `/api/profiles/:id` | Get profile by ID | No |
| PUT | `/api/profiles/:id` | Update profile | No |
| DELETE | `/api/profiles/:id` | Delete profile | No |

---

## 💼 Jobs (`/api/jobs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs` | Get all jobs with filters | No |
| GET | `/api/jobs/client/my-jobs` | Get current client's jobs | Yes |
| GET | `/api/jobs/recommended` | Get recommended jobs (Jobs You May Like) | No |
| GET | `/api/jobs/search` | Search jobs | No |
| GET | `/api/jobs/:id` | Get job by ID | No |
| POST | `/api/jobs` | Create new job | Yes |
| PUT | `/api/jobs/:id` | Update job | No |

---

## 📝 Proposals (`/api/proposals`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/proposals` | Get all proposals (admin/general) | No |
| GET | `/api/proposals/client/accepted` | Get accepted proposals for client | Yes |
| GET | `/api/proposals/freelancer/:freelancerId` | Get proposals for specific freelancer | No |
| GET | `/api/proposals/stats/:freelancerId` | Get proposal statistics for freelancer | No |
| GET | `/api/proposals/:id` | Get single proposal by ID | No |
| POST | `/api/proposals` | Create new proposal | Yes |
| PUT | `/api/proposals/:id/approve` | Approve a proposal | Yes |
| PUT | `/api/proposals/:id/reject` | Reject a proposal | Yes |
| PATCH | `/api/proposals/:id/status` | Update proposal status (accept/decline) | No |
| PUT | `/api/proposals/:id` | Update proposal | No |
| DELETE | `/api/proposals/:id` | Delete proposal | No |

---

## 🚀 Projects (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all projects (admin) | No |
| GET | `/api/projects/client/my-projects` | Get logged-in client's projects | Yes |
| GET | `/api/projects/freelancer/:freelancerId` | Get projects for specific freelancer | No |
| GET | `/api/projects/client/:clientId` | Get projects for specific client | No |
| GET | `/api/projects/stats/:userId` | Get project statistics | No |
| GET | `/api/projects/:id` | Get single project by ID | No |
| POST | `/api/projects` | Create new project | No |
| PUT | `/api/projects/:id` | Update project | No |
| PATCH | `/api/projects/:id/status` | Update project status | No |
| POST | `/api/projects/:id/upload` | Add file upload to project | No |
| POST | `/api/projects/:id/activity` | Add activity to project | No |
| DELETE | `/api/projects/:id` | Delete project | No |

---

## 💬 Messages & Conversations (`/api/messages`)

### Conversation Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/messages/conversations` | Get or create conversation | No |
| GET | `/api/messages/user/:userId/conversations` | Get all conversations for user | No |
| GET | `/api/messages/conversations/:userId` | Get conversations (legacy route) | No |
| GET | `/api/messages/conversations/:conversationId/messages` | Get conversation messages | No |

### Message Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/between/:userId1/:userId2` | Get messages between two users | No |
| POST | `/api/messages` | Send message | No |
| PATCH | `/api/messages/read` | Mark messages as read | No |
| DELETE | `/api/messages/:id` | Delete message | No |
| GET | `/api/messages/thread/:threadId/summarize` | Summarize conversation (AI agent) | No |

---

## 📊 Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Get client dashboard stats | Yes |
| GET | `/api/dashboard/freelancers` | Get top freelancers recommendations | Yes |
| GET | `/api/dashboard/messages` | Get recent messages for dashboard | Yes |

---

## 📁 File Uploads (`/api/uploads`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/uploads/upload` | Upload file to Google Drive | No |

**Note:** Requires multipart/form-data with file field named "file"

---

## 🤖 AI Agent (`/api/agent`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/agent` | Process AI agent request | No |

**Request Body:**
```json
{
  "input": "User message/query",
  "userId": "user_id",
  "userType": "freelancer|client"
}
```

---

## 💰 Payments (`/api/payments`)

### Payment Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/initialize` | Initialize payment | Yes |
| POST | `/api/payments/job-verification` | Initialize job verification payment | Yes |
| GET | `/api/payments/verify/:reference` | Verify payment | Yes |
| POST | `/api/payments/:paymentId/release` | Release payment | Yes |
| POST | `/api/payments/:paymentId/refund` | Refund payment | Yes |
| GET | `/api/payments/history` | Get payment history | Yes |

### Wallet Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/payments/wallet/balance` | Get wallet balance | Yes |
| GET | `/api/payments/transactions` | Get transaction history | Yes |

### Withdrawal Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/withdrawal/request` | Request withdrawal | Yes |
| POST | `/api/payments/withdrawal/:withdrawalId/process` | Process withdrawal | Yes |

### Bank Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/payments/banks` | Get available banks | Yes |
| POST | `/api/payments/banks/resolve` | Resolve bank account | Yes |

---

## 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get all notifications | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/api/notifications/:notificationId/read` | Mark notification as read | Yes |
| PATCH | `/api/notifications/mark-all-read` | Mark all as read | Yes |
| DELETE | `/api/notifications/:notificationId` | Delete notification | Yes |
| DELETE | `/api/notifications/clear-read` | Clear all read notifications | Yes |

---

## ⭐ Reviews & Ratings (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews` | Create review | Yes |
| GET | `/api/reviews/user/:userId` | Get reviews for user | No |
| GET | `/api/reviews/user/:userId/stats` | Get review statistics for user | No |
| POST | `/api/reviews/:reviewId/respond` | Respond to review | Yes |
| POST | `/api/reviews/:reviewId/vote` | Vote on review (helpful/not helpful) | Yes |
| POST | `/api/reviews/:reviewId/flag` | Flag a review | Yes |
| PUT | `/api/reviews/:reviewId` | Update review | Yes |

---

## 📄 Contracts (`/api/contracts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contracts` | Create contract (client only) | Yes |
| GET | `/api/contracts` | Get user's contracts | Yes |
| GET | `/api/contracts/templates/:type` | Get contract template | No |
| GET | `/api/contracts/:contractId` | Get contract by ID | Yes |
| POST | `/api/contracts/:contractId/sign` | Sign contract | Yes |
| POST | `/api/contracts/:contractId/terminate` | Terminate contract | Yes |

---

## 🎯 Gigs (`/api/gigs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gigs/matched` | Get matched gigs for user | No |
| POST | `/api/gigs/:gigId/apply` | Apply to gig | No |
| POST | `/api/gigs/:gigId/save` | Save gig | No |
| GET | `/api/gigs/saved` | Get saved gigs | No |
| GET | `/api/gigs/applications` | Track applications | No |
| GET | `/api/gigs/recommendations` | Get recommended gigs | No |

---

## 📈 Insights & Analytics (`/api/insights`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/insights/profile` | Get profile analytics | No |
| GET | `/api/insights/gigs` | Get gig performance | No |
| POST | `/api/insights/skills/compare` | Compare skills to market | No |
| GET | `/api/insights/reports/weekly` | Generate weekly report | No |

---

## 🛠️ Support (`/api/support`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/support/explain` | Explain feature | No |
| GET | `/api/support/help` | Get help | No |
| POST | `/api/support/feedback` | Send feedback | No |
| POST | `/api/support/onboarding` | Onboarding support | No |

---

## 📝 Proposal Improvements (`/api/proposal-improvements`)

### Proposal Editing
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/proposal-improvements/:proposalId/edit` | Edit proposal | Yes |
| POST | `/api/proposal-improvements/:proposalId/withdraw` | Withdraw proposal | Yes |

### Counter-offers
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/proposal-improvements/:proposalId/counter-offer` | Create counter-offer | Yes |
| POST | `/api/proposal-improvements/:proposalId/counter-offer/:offerIndex/respond` | Respond to counter-offer | Yes |

### Templates
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/proposal-improvements/templates` | Create proposal template | Yes |
| GET | `/api/proposal-improvements/templates` | Get proposal templates | Yes |
| POST | `/api/proposal-improvements/templates/:templateId/use` | Use template | Yes |
| DELETE | `/api/proposal-improvements/templates/:templateId` | Delete template | Yes |

### Expiry Handling
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/proposal-improvements/expire-old` | Handle expired proposals (admin/cron) | No |

---

## 🔌 WebSocket Events

The application uses Socket.IO for real-time communication on the same port as the HTTP server.

### Connection Events
- `connection` - User connects
- `disconnect` - User disconnects
- `join` - Join a room/conversation
- `leave` - Leave a room/conversation

### Message Events
- `sendMessage` - Send real-time message
- `messageReceived` - Receive real-time message
- `typing` - User typing indicator
- `stopTyping` - Stop typing indicator

---

## 📋 Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## 🚀 Getting Started

1. **Base URL**: All API endpoints are prefixed with the base URL
2. **Authentication**: Include Bearer token for protected routes
3. **Content-Type**: Use `application/json` for JSON requests
4. **File Uploads**: Use `multipart/form-data` for file uploads
5. **WebSocket**: Connect to the same base URL for real-time features

---

## 📱 Mobile App Integration Notes

- **Authentication**: Store JWT token securely and include in headers
- **Real-time**: Implement Socket.IO client for live messaging
- **File Uploads**: Handle multipart form data for file uploads
- **Error Handling**: Check `success` field in all responses
- **Pagination**: Most list endpoints support query parameters for pagination
- **Filtering**: Use query parameters for filtering (e.g., `?userType=freelancer`)

---

*Last Updated: November 2024*
*Total Endpoints: 100+*
