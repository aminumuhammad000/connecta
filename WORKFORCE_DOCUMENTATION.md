# 🚀 Connecta Workforce - Comprehensive System Documentation

> **Version:** 1.0.0  
> **Target Region:** Nigeria (100% NGN / ₦ Currency Standardized)  
> **Design Philosophy:** Minimalist Light UI (0 Emojis, Lucide Vector Icons Only)  
> **Monorepo Root:** `/Users/user/Documents/Projectstation/connecta`

---

## 📋 Table of Contents
1. [Executive Summary & Core Vision](#-executive-summary--core-vision)
2. [Architecture & System Tech Stack](#-architecture--system-tech-stack)
3. [Design System & Compliance Rules](#-design-system--compliance-rules)
4. [Employer Portal Modules (`/employer/*`)](#-employer-portal-modules-employer)
5. [Worker Portal Modules (`/workforce/me/*`)](#-worker-portal-modules-workforceme)
6. [Super Admin Governance & Platform Management](#-super-admin-governance--platform-management)
7. [Backend API REST Endpoints Reference](#-backend-api-rest-endpoints-reference)
8. [Deployment, Environment & Local Run Commands](#-deployment-environment--local-run-commands)

---

## 🎯 1. Executive Summary & Core Vision

**Connecta Workforce** is a fintech-grade, end-to-end workforce management and automated payroll platform designed specifically for Nigerian employers, blue-collar workers, site contractors, and contract personnel.

### Key Problems Solved:
* **Attendance Fraud & Ghost Workers:** Replaces manual paper sign-in sheets with real-time GPS location check-ins and 1-tap daily attendance tracking.
* **Payroll Delays & Manual Cash Wages:** Integrates **Flutterwave Checkout** for instant employer wallet top-ups, 1-click batch monthly payroll disbursements, and direct bank cashout to Nigerian bank accounts (GTBank, Access, Zenith, Kuda, OPay, etc.).
* **Lost Contracts & Legal Disputes:** Issues legally binding digital work agreements with salary rates, terms, and digital acceptance tracking.
* **Fragmented Recruitment:** Streamlines hiring with position headcount targets (**Workers Needed**), applicant review pages, and instant 1-tap hiring that automatically syncs candidates onto company rosters.

---

## 🏗️ 2. Architecture & System Tech Stack

Connecta Workforce is built on a high-performance modern web stack:

```
connecta/
├── server/                    # Node.js + Express REST API Backend (Port 5001)
├── connect-workforce/         # Employer & Worker Frontend Portal (Port 5176)
└── admin/                     # Super Admin Portal (Port 5174)
```

### Core Technologies:
* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Lucide-React Icons.
* **Backend:** Node.js, Express.js (ESM Module Architecture), Mongoose ODM.
* **Database:** MongoDB (`mongodb://localhost:27017/connecta`).
* **Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing.
* **Payments & Fintech:** Flutterwave Inline Payment Gateway Integration, Automated Payroll Disbursement Engine.

---

## 🎨 3. Design System & Compliance Rules

Every view across Connecta Workforce strictly enforces the following design and quantitative compliance guidelines:

1. **Zero Emojis Directive:**  
   No emojis are permitted anywhere in the UI or codebase. All visual indicators use official **Lucide Vector Icons** or minimalist text badges.
2. **100% Naira Currency Standardization (`₦ / NGN`):**  
   All financial rates, job budgets, payroll balances, and transaction logs are formatted in Nigerian Naira (`₦`). No USD (`$`) symbols are permitted.
3. **Dedicated Full-Page Workspaces:**  
   Key workflows (such as Applicant Reviews and Worker Bank Accounts) are mounted on dedicated full-screen routes (`/employer/jobs/:jobId/applicants` and `/workforce/me/wallet`), replacing modal popups for superior UX.
4. **Minimalist Light Design Aesthetic:**  
   Clean white cards (`bg-white rounded-3xl p-6 shadow-xs border border-gray-100`), crisp typography, subtle gray backgrounds (`bg-[#f3f4f8]`), and emerald/orange status pills.

---

## 🏢 4. Employer Portal Modules (`/employer/*`)

The Employer Portal allows company executives and HR managers to oversee site workers, job roles, attendance compliance, and payroll disburse.

### 4.1 Employer Dashboard (`/employer/dashboard`)
* **Available Payroll Balance Card:** Displays real-time funded balance in Naira (`₦ 2,500,000`).
* **Pending Actions Alert Banner:** Prominently highlights pending worker proposals awaiting employer review with a direct **`Review Proposals →`** link.
* **KPI Stat Cards:** Tracks Total Roster Count, Active Workers, Monthly Payroll Budget (`₦`), and Active Job Postings.
* **Company Roster Overview & Daily Attendance Ledger:** Real-time table showing workers present vs. absent today.

### 4.2 Employees Roster (`/employer/workforce`)
* Roster management table with search bar, active/inactive filters, and worker contact details.
* **Direct Employee Profile Link:** Clicking any worker's name or avatar navigates directly to `/employer/workforce/:workerId`.
* **Action Buttons:** 💳 **`Pay Worker`**, 📄 **`Issue Contract`**, 🗑️ **`Remove Worker`**.

### 4.3 Worker Detail Profile (`/employer/workforce/:workerId`)
* Tabbed profile header matching elite HR platforms:
  * **Overview:** Worker contact, employment status, monthly rate in `₦`.
  * **Attendance:** Daily check-in timestamps and GPS locations.
  * **Payments:** Historical payout disbursements.
  * **Contracts:** Active legal agreements and terms.

### 4.4 Jobs & Roles (`/employer/jobs`)
* **Workers Needed (Headcount Target):** Tracks required openings (e.g. `5 Needed`) alongside active applications.
* Search bar & active/closed posting toggle.
* ✏️ **`Edit Job Modal`** and 🗑️ **`Delete Job`** controls.
* **`Applicants →`** link navigating to dedicated applicants page.

### 4.5 Dedicated Job Applicants Page (`/employer/jobs/:jobId/applicants`)
* Full-page applicant review workspace.
* Position summary card with monthly budget in `₦`.
* Applicant roster table with 🟢 **`Hire`** (auto-syncs hired worker onto Employees roster) and 🔴 **`Reject`**.

### 4.6 Payroll & Compensation (`/employer/payments`)
* **Payroll Balance Card** with **`+ Fund`** button opening the **Flutterwave 256-bit SSL Checkout Modal** (`FundWalletModal.tsx`).
* **Stat Summaries:** Total Settled (`₦`), Monthly Commitment (`₦`), On-Hold Payouts count.
* 🛑 **`Freeze Payouts`** & 🟢 **`Resume Payouts`** controls per worker.
* ⚡ **`1-Click Batch Monthly Payroll`** & 📥 **`Export CSV Audit Report`**.

### 4.7 Employer Settings & Profile (`/employer/settings`)
* **Personal Profile:** First Name, Last Name, Email (Verified), Phone Number.
* **Corporate Details:** Company Name, CAC RC Number, Office Location, Industry Sector.
* **Settlement Bank Account:** Bank Name, Account Number, Account Holder Name.
* **Site Attendance Rules:** GPS Location Check-In requirement & 1-Tap Daily Check-In toggles.
* 🔴 **`Log Out`** button in top header and left sidebar.

---

## 👷 5. Worker Portal Modules (`/workforce/me/*`)

The Worker Portal empowers blue-collar and contract personnel to manage their daily work, view salary disbursements, and apply for new job openings.

### 5.1 Worker Home Dashboard (`/workforce/me`)
* **1-Tap Daily Attendance Check-In Card:** Allows workers to log daily presence with location verification.
* **Monthly Salary Tracker:** Live view of earnings in **Naira (`₦`)**.
* **Current Employer Assignment Card:** Shows employer name, role title, and active status.

### 5.2 Marketplace & Job Openings (`/workforce/me/jobs`)
* Search bar for filtering contract openings by title or location.
* Monthly salary rates displayed strictly in **`₦`**.
* 📩 **`Apply Now`** button that opens `ApplyJobModal` for entering proposed monthly rates (`₦`) and qualification pitch notes.
* Status badges: **Hired for Role**, **Proposal Submitted**, **Declined**.

### 5.3 Salary & Payout History (`/workforce/me/payments`)
* Stat cards: **Monthly Salary Commitment (`₦`)** & **Total Disbursed Earnings (`₦`)**.
* Disbursement transaction table with Date, Description, Reference Code, Amount (`₦`), and Status badges.
* Direct link to **`Edit Bank Cashout Details →`**.

### 5.4 Dedicated Bank Cashout Account (`/workforce/me/wallet`)
* Standalone dedicated page for adding and editing bank details.
* Bank Name (GTBank, Access, Zenith, Kuda, OPay, etc.), 10-Digit Account Number, Account Holder Name.
* Auto Direct Deposit status badge.

### 5.5 Digital Contracts & Agreements (`/workforce/me/contracts`)
* Review digital work contracts issued by employers.
* Contract terms, responsibilities, monthly rate in **`₦`**, and status tracking (**Active**, **Sent**, **Terminated**).

---

## 👑 6. Super Admin Governance & Platform Management

The **Connecta Super Admin Portal** (`admin/` mounted at `http://localhost:5174`) provides overarching governance across all workforce employers and registered workers.

### Super Admin Capabilities:
1. **Global Workforce Employer Management:**
   * View all registered corporate employers and company profiles.
   * Verify corporate identity and CAC RC Registration numbers.
   * Suspend or reactivate employer accounts.
2. **Worker Verification & Tier Governance:**
   * Audit worker identities and set verification tiers (**Community**, **Vetted Pro**, **Top 1%**).
   * Review worker attendance compliance and site performance metrics.
3. **Platform-Wide Financial & Payroll Auditing:**
   * Monitor total gross payroll processed across Nigeria in **Naira (`₦`)**.
   * Audit Flutterwave wallet funding transactions and bank payout references.
4. **Job Posting & Category Moderation:**
   * Review all public job postings across logistics, construction, security, and healthcare.
   * Remove non-compliant or fraudulent job listings.

---

## 📡 7. Backend API REST Endpoints Reference

### Auth & User Endpoints (`/api/users`)
* `POST /api/users/signin` - Authenticate employer or worker (returns JWT token).
* `POST /api/users/signup` - Register new worker or employer account.
* `GET /api/users/me` - Get current authenticated user profile.

### Workforce Management Endpoints (`/api/workforce`)
* `GET /api/workforce/dashboard` - Get employer dashboard stats & payroll balance.
* `GET /api/workforce/workers` - Get company employees roster (with search & status filter).
* `POST /api/workforce/workers` - Add new worker to roster.
* `DELETE /api/workforce/workers/:id` - Remove worker from roster.
* `POST /api/workforce/wallet/fund` - Fund employer payroll wallet via Flutterwave.
* `GET /api/workforce/payments` - Fetch company payout logs.
* `POST /api/workforce/payments` - Disburse salary payout to worker.
* `PUT /api/workforce/workers/:workerId/payout-status` - Freeze or resume worker payouts.
* `GET /api/workforce/settings` - Get company workforce settings.
* `PUT /api/workforce/settings` - Update company settings & bank details.
* `GET /api/workforce/me/data` - Fetch worker portal dashboard data.

### Job & Applicant Endpoints (`/api/jobs`)
* `GET /api/jobs` - Get active job postings.
* `POST /api/jobs` - Create new job posting with headcount target (`openings`).
* `PUT /api/jobs/:id` - Update job details.
* `DELETE /api/jobs/:id` - Delete job posting.

---

## 🚀 8. Deployment, Environment & Local Run Commands

### Environment Setup (`server/.env`)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/connecta
JWT_SECRET=connecta_super_secret_jwt_key_2026
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxx-X
```

### Local Development Commands

#### 1. Start Backend Server (Port 5001)
```bash
cd /Users/user/Documents/Projectstation/connecta/server
npm run dev
```

#### 2. Start Workforce Employer & Worker Portal (Port 5176)
```bash
cd /Users/user/Documents/Projectstation/connecta/connect-workforce
npm run dev
```

#### 3. Start Super Admin Portal (Port 5174)
```bash
cd /Users/user/Documents/Projectstation/connecta/admin
npm run dev
```

#### 4. Run Production Build Verification
```bash
cd /Users/user/Documents/Projectstation/connecta/connect-workforce
npm run build
```

---
*Documentation compiled and verified with 0 build errors.*
