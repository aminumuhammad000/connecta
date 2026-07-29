# Connecta Web — Product Requirements Document (PRD)
## Version 1.0 | React.js Web Application

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Roles & Personas](#user-roles--personas)
4. [Technical Architecture](#technical-architecture)
5. [Authentication & Onboarding](#authentication--onboarding)
6. [Client Features](#client-features)
7. [Freelancer Features](#freelancer-features)
8. [Shared Features](#shared-features)
9. [Real-Time Features](#real-time-features)
10. [API Integration Map](#api-integration-map)
11. [Navigation & Routing Structure](#navigation--routing-structure)
12. [Component Architecture](#component-architecture)
13. [State Management Strategy](#state-management-strategy)
14. [Design System & UI Guidelines](#design-system--ui-guidelines)
15. [Non-Functional Requirements](#non-functional-requirements)

---

## 1. Executive Summary

Connecta Web is a full-featured React.js web application that provides the same experience as the Connecta mobile app, allowing clients to post jobs and hire freelancers, and freelancers to find work — all through a browser-based interface. The web app connects to the existing production API at `https://api.myconnecta.ng` and uses the same authentication, real-time socket infrastructure, and all existing endpoints.

**Scope**: Feature parity with the Connecta mobile app. No new features. Every capability in the mobile app must exist in the web app.

---

## 2. Product Overview

| Property | Value |
|---|---|
| **Product Name** | Connecta Web |
| **Platform** | Web (React.js) |
| **API Base URL** | `https://api.myconnecta.ng` |
| **Auth Method** | JWT Bearer Token (localStorage) |
| **Real-time** | Socket.IO client |
| **Framework** | React.js (Vite) |
| **Folder** | `/connecta-web` |
| **Target Users** | Clients (employers), Freelancers |

---

## 3. User Roles & Personas

### 3.1 Client
A business owner or individual who posts jobs, reviews proposals, manages projects, and pays freelancers.
**Mobile app user type**: `client`

### 3.2 Freelancer
A professional who searches for jobs, submits proposals, delivers work, and withdraws earnings.
**Mobile app user type**: `freelancer`

### 3.3 Guest (Public)
An unauthenticated visitor who can browse public job listings and freelancer profiles.

---

## 4. Technical Architecture

### 4.1 Tech Stack
| Layer | Technology |
|---|---|
| Framework | React.js 18+ (Vite) |
| Routing | React Router v6 |
| State Management | React Context + useReducer |
| HTTP Client | Axios |
| Real-time | Socket.IO Client |
| Styling | Vanilla CSS (CSS Variables + CSS Modules) |
| File Uploads | Browser FormData + Axios |
| Auth Storage | localStorage (`connecta_token`) |
| Icons | React Icons |
| Fonts | Google Fonts (Inter) |

### 4.2 Environment Configuration
```
VITE_API_URL=https://api.myconnecta.ng
VITE_SOCKET_URL=https://api.myconnecta.ng
```

### 4.3 Project Structure
```
connecta-web/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/         # Button, Card, Avatar, Badge, Modal, Toast, Spinner, EmptyState, Pagination
│   │   ├── layout/         # Navbar, Sidebar, Footer, PageWrapper
│   │   ├── feed/
│   │   ├── jobs/
│   │   ├── proposals/
│   │   ├── projects/
│   │   ├── chat/
│   │   ├── wallet/
│   │   └── profile/
│   ├── contexts/           # AuthContext, RoleContext, SocketContext, ThemeContext, ToastContext
│   ├── hooks/              # useAuth, useSocket, useRole, useToast
│   ├── pages/
│   │   ├── auth/
│   │   ├── client/
│   │   ├── freelancer/
│   │   └── shared/
│   ├── services/
│   │   └── api.ts          # Axios instance + all API service modules
│   ├── utils/              # storage.ts, constants.ts, helpers.ts
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── .env.production
├── vite.config.ts
└── package.json
```

---

## 5. Authentication & Onboarding

### 5.1 Welcome / Landing Page (`/`)
**Mobile equivalent**: `WelcomeScreen`
- Hero section with Connecta branding and tagline
- "Get Started" CTA → Role Selection
- "Sign In" link → Login page
- Public navigation to Job Search and Freelancer Search

---

### 5.2 Role Selection (`/register/role`)
**Mobile equivalent**: `RoleSelectionScreen`
- Two large cards: "I'm a Client — I want to hire" and "I'm a Freelancer — I want to work"
- Clicking either sets role and proceeds to Sign Up

---

### 5.3 Sign Up — Step 1: Basic Info (`/register`)
**Mobile equivalent**: `SignupScreen`

**Form Fields:**
- First Name (required)
- Last Name (required)
- Email (required) → `POST /api/users/check-email`
- Phone Number (required) → `POST /api/users/check-phone`
- WhatsApp Number (optional)

---

### 5.4 Sign Up — Step 2: Password (`/register/password`)
**Mobile equivalent**: `SignupPasswordScreen`
- Password (min 8 chars, show/hide toggle)
- Confirm Password
- Submit → `POST /api/users/signup`
- On success → Skill Selection (freelancer) or Dashboard (client)

---

### 5.5 Skill Selection (`/register/skills`)
**Mobile equivalent**: `SkillSelectionScreen` — **Freelancer only**
- Multi-select grid of skill chips/tags
- Search/filter skills
- Continue → Profile Setup

---

### 5.6 Freelancer Profile Setup (`/register/profile-setup`)
**Mobile equivalent**: `FreelancerProfileSetupScreen` — **Freelancer only**
- Professional Title, Bio, Hourly Rate, Years of Experience, Portfolio links
- Profile Photo upload → `POST /api/uploads/upload`

---

### 5.7 Login (`/login`)
**Mobile equivalent**: `LoginScreen`
- Email, Password (show/hide toggle)
- Sign In → `POST /api/users/signin`
- Google Sign In → `POST /api/users/google/signin`
- Forgot Password → `/forgot-password`
- On success: Store JWT, redirect by `userType` to dashboard

---

### 5.8 Forgot Password (`/forgot-password`)
**Mobile equivalent**: `ForgotPasswordScreen`

3-step wizard:
1. Enter email → `POST /api/users/forgot-password`
2. Enter OTP → `POST /api/users/verify-otp`
3. New password → `POST /api/users/reset-password`

---

### 5.9 Email Verification Banner
**Mobile equivalent**: `EmailVerificationModal`
- Persistent banner on dashboard if not verified
- Resend → `POST /api/users/resend-verification`

---

## 6. Client Features

### 6.1 Client Dashboard (`/client/dashboard`)
**Mobile equivalent**: `ClientDashboardScreen`

**Content:**
1. **Stats Bar** — Active Jobs, Proposals Received, Active Projects, Total Spent
2. **Search Bar** — Search freelancers with filters (skills, rate, category)
3. **Recommended Freelancers** — Grid of freelancer cards with "View Profile" and "Invite" actions
4. **Recent Activity** — Latest notification events

**API:**
- `GET /api/dashboard/stats`
- `GET /api/users/freelancers`

**Real-time:** `notification:new`, `message:receive` → update badge counts

---

### 6.2 Post a Job (`/client/jobs/post`)
**Mobile equivalent**: `PostJobScreen`

**Form Fields:**
| Field | Type | Required |
|---|---|---|
| Job Title | Text | Yes |
| Category | Dropdown | Yes |
| Description | Textarea | Yes |
| Skills Required | Multi-select tags | Yes |
| Budget (₦) | Number | Yes |
| Budget Type | Fixed / Hourly | Yes |
| Job Type | Remote / Onsite / Hybrid | No |
| Duration (days) | Number | Yes |
| Deadline | Date picker | No |
| Location | Text | No |

**Actions:** Save as Draft → `POST /api/jobs` (status: draft) | Publish → `POST /api/jobs` (status: active)

---

### 6.3 My Jobs (`/client/jobs`)
**Mobile equivalent**: `ClientJobsScreen`
- Tabs: All | Active | Closed | Draft
- Per card: title, budget, proposal count badge, status, actions (View Proposals, Edit, Close)
- `GET /api/jobs/client/my-jobs`

---

### 6.4 Job Detail — Client View (`/client/jobs/:id`)
**Mobile equivalent**: `JobDetailScreen` (client role)
- Full job description, skills, budget
- **Proposals Tab**: Submitted proposals with freelancer info, bid, cover letter; Accept/Decline/Message actions
- **API:** `GET /api/jobs/:id`, `GET /api/proposals/job/:jobId`, `PATCH /api/proposals/:id/status`

---

### 6.5 Proposals Received (`/client/proposals`)
**Mobile equivalent**: `ProposalsScreen` (client view)
- Filterable list: all proposals across all jobs
- Per card: Freelancer info, job title, bid amount, status, "View Full Proposal" button
- `GET /api/proposals`

---

### 6.6 Proposal Detail — Client View (`/client/proposals/:id`)
**Mobile equivalent**: `ProposalDetailScreen` (client)
- Freelancer profile summary, cover letter, bid, delivery time
- Actions: Accept → `PUT /api/proposals/:id/approve` | Decline → `PUT /api/proposals/:id/reject` | Message

---

### 6.7 Client Projects (`/client/projects`)
**Mobile equivalent**: `ClientProjectsScreen`
- Tabs: Active | Submitted | Completed | Cancelled
- `GET /api/projects/client/my-projects`

---

### 6.8 Project Detail (`/client/projects/:id`)
**Mobile equivalent**: `ProjectDetailScreen` (client view)

**Tabs:**
- **Overview**: Title, description, freelancer info, status timeline, start/end dates, deliverables checklist
- **Milestones**: List with status and due dates
- **Files**: Uploaded deliverables (downloadable), client file upload area
- **Activity**: Chronological project event log

**Actions:**
- Message Freelancer
- Accept Submission → `PATCH /api/projects/:id/accept`
- Request Revision → `PATCH /api/projects/:id/request-revision`
- Upload files → `POST /api/projects/:id/upload`

---

### 6.9 Client Wallet & Payments (`/client/wallet`)
**Mobile equivalent**: `ClientWalletScreen`

**Sections:**
- **Balance Card**: Current wallet balance + "Top Up" button → Paystack flow (`POST /api/payments/initialize-topup`)
- **Escrow**: Funds held in active project escrow
- **Transaction History**: Date | Description | Amount | Type | Status — paginated table

**API:** `GET /api/payments/wallet/balance`, `GET /api/payments/transactions`, `POST /api/payments/initialize-topup`

---

### 6.10 Freelancer Public Profile — Client Invite View (`/freelancers/:id`)
- Full freelancer profile (see Section 8.6)
- "Invite to Job" button → Modal to select job
- "Message" button → Opens chat

---

### 6.11 Write Review — Client (`/client/review/:projectId`)
**Mobile equivalent**: `ClientWriteReviewScreen`
- Star rating (1-5), review textarea
- `POST /api/reviews`

---

## 7. Freelancer Features

### 7.1 Freelancer Dashboard (`/freelancer/dashboard`)
**Mobile equivalent**: `FreelancerDashboardScreen`

**Content:**
1. **Stats Cards**: Total Earnings, Active Jobs, Proposals Submitted, Success Rate, Profile Completion %
2. **Matched Gigs**: AI-matched job cards with "View" and "Apply" actions
3. **Active Contracts**: Current ongoing project summaries

**API:**
- `GET /api/proposals/stats/:id`
- `GET /api/jobs/matched`
- `GET /api/projects/freelancer/:id`

---

### 7.2 Browse All Jobs (`/freelancer/jobs`)
**Mobile equivalent**: `FreelancerMatchedGigsScreen`
- Search bar + filter sidebar (category, budget range, job type, skills)
- Job listings grid with pagination/infinite scroll
- Per card: title, client, budget, duration, skills chips, posted date, Apply button
- `GET /api/jobs`, `GET /api/jobs/search?q=`, `GET /api/jobs/recommended`

---

### 7.3 Job Detail — Freelancer View (`/freelancer/jobs/:id`)
**Mobile equivalent**: `JobDetailScreen` (freelancer role)
- Full job info, client details, skills
- "Apply Now" → Apply page | "Message Client" → Chat

---

### 7.4 Apply for Job (`/freelancer/jobs/:id/apply`)
**Mobile equivalent**: `ApplyJobScreen`

**Form Fields:**
| Field | Type | Required |
|---|---|---|
| Cover Letter | Textarea | Yes |
| Bid Amount (₦) | Number | Yes |
| Delivery Time (days) | Number | Yes |
| Attachments | File upload | No |

**Submit → `POST /api/proposals`**

---

### 7.5 My Proposals (`/freelancer/proposals`)
**Mobile equivalent**: `MyProposalsScreen`
- Tabs: All | Pending | Accepted | Declined
- Per card: Job title, client, bid amount, status, "View Details", "Withdraw" (if pending → `DELETE /api/proposals/:id`)
- `GET /api/proposals/my-proposals`

---

### 7.6 Proposal Detail — Freelancer View (`/freelancer/proposals/:id`)
**Mobile equivalent**: `ProposalDetailScreen` (freelancer)
- Job summary, your cover letter and bid, status timeline
- If accepted: "View Project" button
- `GET /api/proposals/:id`

---

### 7.7 Freelancer Projects (`/freelancer/projects`)
**Mobile equivalent**: `FreelancerProjectsScreen`
- Tabs: Active | Submitted | Completed
- `GET /api/projects/freelancer/:userId`

---

### 7.8 Project Detail — Freelancer View (`/freelancer/projects/:id`)
**Mobile equivalent**: `ProjectDetailScreen` (freelancer view)

**Tabs:**
- **Overview**: Project info with freelancer-specific actions
- **Milestones**: View milestones list
- **Files**: Upload deliverables → `POST /api/projects/:id/upload`, view uploaded files
- **Activity**: Project event log

**Actions:**
- "Submit for Review" → Modal with submission summary → `POST /api/projects/:id/submit`
- "Message Client" → Opens chat

---

### 7.9 Freelancer Wallet (`/freelancer/wallet`)
**Mobile equivalent**: `WalletScreen`

**Sections:**
- **Balance Card**: Available balance + "Withdraw" button
- **Withdrawal Form** (`/freelancer/wallet/withdraw`): Bank name, account number, account name (auto-fetched), amount → `POST /api/payments/withdrawal/request`
- **Transaction History**: Date | Type | Amount | Status | Reference — paginated

**API:** `GET /api/payments/wallet/balance`, `GET /api/payments/transactions`, `POST /api/payments/withdrawal/request`

---

### 7.10 Edit Profile (`/freelancer/profile/edit`)
**Mobile equivalent**: `EditProfileScreen`
- Profile photo upload, name, title, bio, skills, hourly rate, experience, portfolio links, social links
- `PUT /api/users/me`, `PUT /api/profiles/me`, `POST /api/uploads/upload`

---

### 7.11 Write Review — Freelancer (`/freelancer/review/:projectId`)
**Mobile equivalent**: `FreelancerWriteReviewScreen`
- Star rating (1-5), review text → `POST /api/reviews`

---

## 8. Shared Features

### 8.1 Feed (`/feed`)
**Mobile equivalent**: `FeedScreen`
**Access**: Both roles (authenticated)

**Layout:**
- Main feed column (center) + Trending sidebar (right, desktop only)

**Per Post Card:**
- Avatar, name, timestamp, post content (text + optional image)
- Reaction count, comment count

**Interactions:**
- React → `POST /api/feed/:id/react` | Un-react → `DELETE /api/feed/:id/react`
- View/Add comments → `POST /api/feed/:id/comments`
- Load more (pagination)

**Real-time:** Socket events `feed:new_post`, `feed:reaction`, `feed:comment`

**API:** `GET /api/feed`, `GET /api/feed/trending`

---

### 8.2 Messaging / Chat (`/messages`)
**Mobile equivalent**: `ChatsScreen` + `MessagesScreen`

**Layout:** Two-panel (desktop) | Single panel with back nav (mobile-web)

**Left Panel — Conversation List:**
- Search conversations
- Per thread: Avatar, name, last message preview, timestamp, unread badge (sorted by latest)

**Right Panel — Chat Thread:**
- Sent (right) / Received (left) bubbles
- Sender avatar on received messages, timestamps
- Typing indicator ("...")
- Text input + send button + file attachment + emoji picker

**API:**
- `GET /api/messages/conversations`
- `GET /api/messages/conversations/:id/messages`
- `POST /api/messages/message/send`
- `PATCH /api/messages/message/read`
- `POST /api/messages/conversations`

**Real-time Emits:** `sendMessage`, `typing:start`, `typing:stop`, `message:read`, `room:join`, `room:leave`
**Real-time Listens:** `message:receive`, `typing:start`, `typing:stop`

---

### 8.3 Notifications (`/notifications`)
**Mobile equivalent**: `NotificationsScreen`

- Full-page list of notifications
- Per item: icon (type-based), title, description, timestamp, unread dot, click → navigate to context
- "Mark all as read" → `PATCH /api/notifications/mark-all-read`
- Mark single read → `PATCH /api/notifications/:id/read`
- Delete → `DELETE /api/notifications/:id`
- Real-time: `notification:new` updates navbar badge

---

### 8.4 Public Job Search (`/jobs`)
**Mobile equivalent**: `PublicJobSearch`
**Access**: Public (no login)
- Search bar + filter sidebar
- Job listings grid with "Sign in to Apply" CTA for guests
- `GET /api/jobs` (public)

---

### 8.5 Public Freelancer Search (`/freelancers`)
**Mobile equivalent**: `PublicFreelancerSearch`
**Access**: Public
- Search + filters (skills, rate range, category)
- Freelancer cards grid
- `GET /api/users/freelancers`

---

### 8.6 Freelancer Public Profile (`/freelancers/:id`)
**Mobile equivalent**: `FreelancerPublicProfile`

**Content:**
- Header: avatar, name, title, location, rating, hourly rate, verified badge
- Stats: Jobs Completed, Success Rate, Response Time
- About / Bio
- Skills chips
- Portfolio links
- Reviews & Ratings (star average + individual reviews)
- Work History (completed projects)

**Authenticated Client Actions:** "Invite to Job" | "Message"

**API:** `GET /api/users/:id`, `GET /api/profiles/user/:userId`, `GET /api/reviews/user/:userId`

---

### 8.7 Client Public Profile (`/clients/:id`)
**Mobile equivalent**: `ClientProfile`
- Avatar, name, member since, jobs posted count, total spent
- Reviews from freelancers
- `GET /api/users/:id`, `GET /api/reviews/user/:userId`

---

### 8.8 Settings (`/settings`)
**Mobile equivalent**: `SettingsScreen`

#### Account Settings (`/settings/account`)
- Change name, email (with OTP), profile photo, preferred language
- `PUT /api/users/me`

#### Security (`/settings/security`)
**Mobile equivalent**: `SecurityScreen`
- Change password form → `POST /api/users/change-password`

---

### 8.9 Help & Support (`/support`)
**Mobile equivalent**: `HelpSupportScreen`
- FAQ accordion
- Contact form (name, email, message) → `POST /api/contact`
- Support email display

---

### 8.10 About (`/about`)
**Mobile equivalent**: `AboutScreen`
- About Connecta, version info, social links

---

### 8.11 Terms & Privacy (`/terms`, `/privacy`)
**Mobile equivalent**: `TermsScreen`
- Static legal text pages

---

## 9. Real-Time Features

### 9.1 Socket Connection
- Connect on login with JWT: `{ auth: { token } }`
- Emit `user:join` with userId
- Disconnect on logout

### 9.2 Socket Events Map

| Event | Direction | Effect |
|---|---|---|
| `user:join` | Emit | Register user on server |
| `room:join` | Emit | Join conversation room |
| `room:leave` | Emit | Leave conversation room |
| `sendMessage` | Emit | Send chat message |
| `typing:start` | Emit | Notify other user typing |
| `typing:stop` | Emit | Notify stopped typing |
| `message:read` | Emit | Mark messages as read |
| `message:receive` | Listen | Update chat + show toast alert |
| `notification:new` | Listen | Update navbar badge + show alert |
| `conversation:update` | Listen | Refresh conversation list |
| `feed:new_post` | Listen | Prepend post to feed |
| `feed:reaction` | Listen | Update reaction count |
| `feed:comment` | Listen | Update comment count |
| `typing:start` | Listen | Show "typing..." indicator |
| `typing:stop` | Listen | Hide typing indicator |

### 9.3 Browser Notifications
- Request permission on login
- Show browser notification for new messages when tab is out of focus

---

## 10. API Integration Map

### 10.1 Axios Instance Pattern (`src/services/api.ts`)
- Base URL from `VITE_API_URL`
- Request interceptor: attach `Authorization: Bearer {token}` from localStorage
- Response interceptor: on 401 → clear storage + redirect to `/login`

### 10.2 API Service Modules

| Module | Key Methods |
|---|---|
| `authAPI` | login, signup, googleSignin, forgotPassword, verifyOtp, resetPassword, checkEmail, checkPhone |
| `usersAPI` | getMe, updateMe, getById, listFreelancers, changePassword, verifyEmail, resendVerification |
| `jobsAPI` | create, getAll, getById, search, getMyJobs, getRecommended, getMatched, update, delete |
| `proposalsAPI` | submit, getAll, getMyProposals, getByJob, getById, approve, reject, updateStatus, delete |
| `projectsAPI` | getClientProjects, getFreelancerProjects, getById, submit, uploadFile, accept, requestRevision |
| `messagesAPI` | getConversations, getMessages, sendMessage, markRead, startConversation |
| `paymentsAPI` | getBalance, getTransactions, initializeTopup, requestWithdrawal |
| `feedAPI` | getAll, getTrending, react, unreact, addComment |
| `notificationsAPI` | getAll, markRead, markAllRead, delete |
| `reviewsAPI` | create, getByUser |
| `profilesAPI` | getMe, updateMe, getByUserId |
| `uploadsAPI` | upload |
| `dashboardAPI` | getClientStats, getFreelancerStats |
| `contactAPI` | submit |

---

## 11. Navigation & Routing Structure

```
/ ..................................... Welcome / Landing (Public)
├── /login ............................ Login
├── /forgot-password .................. Forgot Password (3-step)
├── /register/role .................... Role Selection
├── /register ......................... Sign Up Step 1
├── /register/password ................ Sign Up Step 2
├── /register/skills .................. Skill Selection [Freelancer]
├── /register/profile-setup ........... Profile Setup [Freelancer]
│
├── /jobs ............................. Public Job Listings
├── /jobs/:id ......................... Public Job Detail
├── /freelancers ...................... Public Freelancer Search
├── /freelancers/:id .................. Freelancer Public Profile
├── /clients/:id ...................... Client Public Profile
├── /about ............................ About
├── /terms ............................ Terms of Service
├── /privacy .......................... Privacy Policy
│
├── /feed ............................. Social Feed [Auth]
├── /messages ......................... Conversations List [Auth]
├── /messages/:conversationId ......... Chat Thread [Auth]
├── /notifications .................... Notifications [Auth]
├── /settings/account ................. Account Settings [Auth]
├── /settings/security ................ Security Settings [Auth]
├── /support .......................... Help & Support
│
├── /client/* ......................... [Client Auth Guard]
│   ├── /client/dashboard
│   ├── /client/jobs
│   ├── /client/jobs/post
│   ├── /client/jobs/:id
│   ├── /client/proposals
│   ├── /client/proposals/:id
│   ├── /client/projects
│   ├── /client/projects/:id
│   ├── /client/wallet
│   ├── /client/profile
│   ├── /client/profile/edit
│   └── /client/review/:projectId
│
└── /freelancer/* ..................... [Freelancer Auth Guard]
    ├── /freelancer/dashboard
    ├── /freelancer/jobs
    ├── /freelancer/jobs/:id
    ├── /freelancer/jobs/:id/apply
    ├── /freelancer/proposals
    ├── /freelancer/proposals/:id
    ├── /freelancer/projects
    ├── /freelancer/projects/:id
    ├── /freelancer/wallet
    ├── /freelancer/wallet/withdraw
    ├── /freelancer/profile
    ├── /freelancer/profile/edit
    └── /freelancer/review/:projectId
```

**Route Guards:**
- `<PublicRoute>` — Redirect to dashboard if already logged in
- `<PrivateRoute>` — Redirect to `/login` if not authenticated
- `<ClientRoute>` — Redirect if `userType !== 'client'`
- `<FreelancerRoute>` — Redirect if `userType !== 'freelancer'`

---

## 12. Component Architecture

### 12.1 Layout Components

#### `<Navbar />`
- Logo (left) | Nav links (center, public) | Notification bell + Message icon + Avatar dropdown (right)
- Dropdown: Profile, Settings, Sign Out
- Sticky on scroll, unread badges on bell and message icon

#### `<Sidebar />` (Dashboard pages)
- Logo + navigation items with icons
- **Client**: Dashboard, Post Job, My Jobs, Proposals, Projects, Wallet, Messages, Feed, Settings
- **Freelancer**: Dashboard, Browse Jobs, My Proposals, Projects, Wallet, Messages, Feed, Settings
- Collapsible on mobile (hamburger menu)

### 12.2 Common Components

| Component | Description |
|---|---|
| `<Button>` | Primary, secondary, outline, ghost, danger variants |
| `<Card>` | Container with consistent shadow/border |
| `<Avatar>` | Circular user image with fallback initials |
| `<Badge>` | Status badge with color variants |
| `<Modal>` | Accessible overlay dialog |
| `<Toast>` | Notification snackbars (top-right) |
| `<Spinner>` | Loading indicator |
| `<EmptyState>` | Illustration + message for empty lists |
| `<Pagination>` | Page-based navigation |
| `<SkillTag>` | Skill chip with optional remove |
| `<StarRating>` | Interactive or display-only stars |
| `<FileUpload>` | Drag & drop + click zone |
| `<SearchBar>` | Debounced search with filter support |
| `<Tabs>` | Accessible tab navigation |
| `<Table>` | Sortable data table |

### 12.3 Feature Components

**Job Components:** `<JobCard>`, `<JobFilters>`, `<JobForm>`, `<JobDetailView>`

**Proposal Components:** `<ProposalCard>`, `<ProposalForm>`, `<ProposalActions>`

**Project Components:** `<ProjectCard>`, `<MilestoneList>`, `<FileList>`, `<ActivityLog>`, `<SubmitWorkModal>`

**Chat Components:** `<ConversationList>`, `<MessageBubble>`, `<ChatInput>`, `<TypingIndicator>`

**Feed Components:** `<FeedPost>`, `<CommentSection>`, `<ReactionBar>`

**Profile Components:** `<ProfileHeader>`, `<SkillsList>`, `<ReviewsList>`, `<PortfolioGrid>`

**Wallet Components:** `<BalanceCard>`, `<TransactionTable>`, `<WithdrawalForm>`, `<TopUpModal>`

---

## 13. State Management Strategy

### 13.1 Context Provider Tree
```
<ThemeProvider>
  <AuthProvider>
    <RoleProvider>
      <SocketProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SocketProvider>
    </RoleProvider>
  </AuthProvider>
</ThemeProvider>
```

### 13.2 AuthContext Shape
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}
```

### 13.3 Page-Level State Pattern
Each page manages its own fetch state using the `data / loading / error` pattern with `useState` and custom hooks (e.g., `useJobs()`, `useProposals()`).

---

## 14. Design System & UI Guidelines

### 14.1 Color Palette
> ⚠️ **These are the EXACT same colors from the mobile app (`src/theme/theme.ts`). The web must match perfectly for brand consistency.**

| Token | Value | Mobile Source | Usage |
|---|---|---|---|
| `--primary` | `#FD6730` | `palette.primary` | Primary CTAs, links, active states, key highlights |
| `--secondary` | `#FF8F6B` | `palette.secondary` | Secondary actions, hover gradients |
| `--accent` | `#FD6730` | `palette.accent` | Badges, tags, premium accents |
| `--success` | `#10B981` | `palette.success` | Success states, completed badges |
| `--error` | `#EF4444` | `palette.error` | Errors, destructive actions |
| `--warning` | `#F59E0B` | Derived | Warnings, caution states |
| `--bg-light` | `#FFFFFF` | `palette.backgroundLight` | Light mode page background |
| `--bg-dark` | `#121212` | `palette.backgroundDark` | Dark mode page background |
| `--card-light` | `#FFFFFF` | `palette.cardLight` | Light mode card background |
| `--card-dark` | `#1E1E1E` | `palette.cardDark` | Dark mode card background |
| `--text-light` | `#111827` | `palette.textLight` | Light mode primary text |
| `--text-dark` | `#E5E7EB` | `palette.textDark` | Dark mode primary text |
| `--subtext-light` | `#6B7280` | `palette.subtextLight` | Light mode subtext, captions |
| `--subtext-dark` | `#9CA3AF` | `palette.subtextDark` | Dark mode subtext, captions |
| `--border-light` | `#E5E7EB` | `palette.borderLight` | Light mode dividers, borders |
| `--border-dark` | `#374151` | `palette.borderDark` | Dark mode dividers, borders |
| `--bg-secondary-light` | `#F7F8FC` | `gradients.light[1]` | Light mode section backgrounds |

**Gradients (match mobile exactly):**
| Name | Value | Mobile Source |
|---|---|---|
| Primary gradient | `#FD6730 → #FF8F6B` | `gradients.primary` |
| Dark background | `#121212 → #1E1E1E` | `gradients.dark` |
| Light background | `#FFFFFF → #F7F8FC` | `gradients.light` |
| Glass (light) | `rgba(255,255,255,0.8) → rgba(255,255,255,0.4)` | `gradients.glass` |
| Glass (dark) | `rgba(30,30,30,0.8) → rgba(30,30,30,0.4)` | `gradients.glassDark` |

**CSS Variables Implementation (`src/index.css`):**
```css
:root {
  --primary: #FD6730;
  --secondary: #FF8F6B;
  --accent: #FD6730;
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;

  /* Light mode (default) */
  --bg: #FFFFFF;
  --bg-secondary: #F7F8FC;
  --card: #FFFFFF;
  --text: #111827;
  --subtext: #6B7280;
  --border: #E5E7EB;
}

[data-theme="dark"] {
  --bg: #121212;
  --bg-secondary: #1E1E1E;
  --card: #1E1E1E;
  --text: #E5E7EB;
  --subtext: #9CA3AF;
  --border: #374151;
}
```

### 14.2 Typography
- **Font**: `Inter` (Google Fonts)
- H1: 32px/700 | H2: 24px/600 | H3: 20px/600 | Body: 16px/400 | Small: 12px/400

### 14.3 Spacing Scale
Base 4px: 4, 8, 12, 16, 24, 32, 48, 64px

### 14.4 Border Radius
Small: 4px | Medium: 8px | Large: 12px | Round: 50%

### 14.5 Responsive Breakpoints
| Name | Width |
|---|---|
| Mobile | < 768px |
| Tablet | 768px – 1024px |
| Desktop | > 1024px |

Sidebar collapses to icon-only on tablet, hamburger menu on mobile.

### 14.6 Dark Mode
- Respect `prefers-color-scheme` + user preference (localStorage)
- Switch via `[data-theme="dark"]` on `<html>`

---

## 15. Non-Functional Requirements

### 15.1 Performance
- Initial load < 3s (production)
- Loading skeletons (not blocking spinners)
- Lazy load page components with `React.lazy()` + `Suspense`
- Images with `loading="lazy"`

### 15.2 Security
- JWT in localStorage, HTTPS only
- No sensitive data in console (production)
- File uploads restricted to allowed MIME types

### 15.3 Accessibility
- Semantic HTML (headings, landmarks, lists)
- Keyboard accessible interactive elements
- ARIA labels on icon-only buttons
- WCAG AA color contrast minimum

### 15.4 Error Handling
- Global error boundary
- API errors via Toast with helpful messages
- 404 page for unknown routes
- Empty states with clear CTAs

### 15.5 SEO
- Meta title + description per page
- Open Graph tags on public pages
- Semantic HTML structure

---

## Appendix A: Feature Parity Checklist

| Feature | Mobile | Web |
|---|---|---|
| User Registration (Client) | ✅ | 📋 Planned |
| User Registration (Freelancer) | ✅ | 📋 Planned |
| Skill Selection (Freelancer onboarding) | ✅ | 📋 Planned |
| Freelancer Profile Setup | ✅ | 📋 Planned |
| Login (Email/Password) | ✅ | 📋 Planned |
| Google OAuth Login | ✅ | 📋 Planned |
| Forgot Password (OTP flow) | ✅ | 📋 Planned |
| Email Verification | ✅ | 📋 Planned |
| Client Dashboard | ✅ | 📋 Planned |
| Freelancer Dashboard | ✅ | 📋 Planned |
| Post a Job | ✅ | 📋 Planned |
| Browse Jobs (Public) | ✅ | 📋 Planned |
| Job Search & Filters | ✅ | 📋 Planned |
| Job Detail View | ✅ | 📋 Planned |
| AI Job Matching (Freelancer) | ✅ | 📋 Planned |
| Apply for Job | ✅ | 📋 Planned |
| Proposals Received (Client) | ✅ | 📋 Planned |
| My Proposals (Freelancer) | ✅ | 📋 Planned |
| Accept/Reject Proposal | ✅ | 📋 Planned |
| Projects — Client View | ✅ | 📋 Planned |
| Projects — Freelancer View | ✅ | 📋 Planned |
| Project Detail + Milestones | ✅ | 📋 Planned |
| File Upload on Project | ✅ | 📋 Planned |
| Submit Work (Freelancer) | ✅ | 📋 Planned |
| Accept/Request Revision (Client) | ✅ | 📋 Planned |
| Activity Log on Project | ✅ | 📋 Planned |
| Real-time Messaging / Chat | ✅ | 📋 Planned |
| Typing Indicator | ✅ | 📋 Planned |
| File Attachments in Chat | ✅ | 📋 Planned |
| Conversation List | ✅ | 📋 Planned |
| Feed — View Posts | ✅ | 📋 Planned |
| Feed — React to Post | ✅ | 📋 Planned |
| Feed — Comments | ✅ | 📋 Planned |
| Real-time Feed Updates | ✅ | 📋 Planned |
| Client Wallet — Top Up | ✅ | 📋 Planned |
| Client Wallet — Escrow | ✅ | 📋 Planned |
| Freelancer Wallet — Balance | ✅ | 📋 Planned |
| Freelancer Withdrawal | ✅ | 📋 Planned |
| Transaction History | ✅ | 📋 Planned |
| Notifications List | ✅ | 📋 Planned |
| Real-time Notifications | ✅ | 📋 Planned |
| Freelancer Public Profile | ✅ | 📋 Planned |
| Client Public Profile | ✅ | 📋 Planned |
| Invite Freelancer to Job | ✅ | 📋 Planned |
| Write Review (Client → Freelancer) | ✅ | 📋 Planned |
| Write Review (Freelancer → Client) | ✅ | 📋 Planned |
| Settings — Account | ✅ | 📋 Planned |
| Settings — Security (Change Password) | ✅ | 📋 Planned |
| Help & Support / Contact Form | ✅ | 📋 Planned |
| About Page | ✅ | 📋 Planned |
| Terms & Privacy | ✅ | 📋 Planned |
| Dark Mode | ✅ | 📋 Planned |

**Total Features: 51 | Mobile: 51 ✅ | Web: 51 📋 Planned**

---

*End of PRD — Connecta Web v1.0*
*Generated from full codebase analysis of mobile app (`connecta-app/`) and server (`server/src/`).*
*Awaiting approval to begin implementation.*
