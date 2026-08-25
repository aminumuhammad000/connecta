# Connecta Workforce Web Application (`connect-workforce`)

Connecta Workforce is a streamlined workforce management platform built directly on top of the Connecta ecosystem. It allows companies to manage existing employees, contractors, temporary workers, and site personnel while seamlessly recruiting additional talent from the main Connecta Marketplace.

## 🚀 Key Features

* **Simple 4-Step Onboarding**: Designed for non-technical business owners.
* **Minimalist Workforce Dashboard**: Real-time stats for active workers, daily attendance, active jobs, and monthly payroll.
* **Workforce Roster (`/workforce`)**: View, filter, and search workers. Add individual workers manually or invite via email/phone.
* **CSV Bulk Worker Import**: Downloadable sample template, PapaParse browser-side parsing, error checking, and bulk creation.
* **Attendance & Shift Tracker (`/attendance`)**: Record check-ins and check-outs with optional job-site location GPS verification and manual status overrides.
* **Flexible Payroll & Payments (`/payments`)**: Support for Monthly salaries, Weekly retainers, Daily wages, Hourly rates, and Milestone payouts powered by Connecta Wallet and Flutterwave integration.
* **Digital Contracts (`/contracts`)**: Create digital contracts with terms, compensation, start/end dates, and digital acceptance.
* **Marketplace Integration (`/jobs`)**: Create jobs for internal workforce assignment or publish to Connecta Marketplace to recruit top talent.
* **Settings & Governance (`/settings`)**: Company preferences, location verification toggles, self check-in rules, and default currency configuration.

---

## 🛠️ Architecture & Tech Stack

* **Frontend Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS with Plus Jakarta Sans typography
* **Icons**: Lucide React
* **State Management & Querying**: React Context API + Axios
* **CSV Import Engine**: PapaParse
* **Backend API**: Shared Node.js/Express Connecta Backend (`/server`)
* **Authentication**: Shared Connecta JWT Bearer authentication (`/api/users/signin`, `/api/users/me`)

---

## 💻 Environment Variables & Setup

Create a `.env` file in the root of `connect-workforce`:

```env
VITE_API_URL=https://api.myconnecta.ng
```

### Safe Placeholder Example (`.env.example`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 📦 Installation & Commands

```bash
# Install dependencies
npm install

# Start local development server (runs on port 5175)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🔌 API & Backend Extensions Summary

Connecta Workforce reuses existing Connecta database tables, users, identity, wallets, and jobs. The following new endpoints were cleanly added to `server/src/routes/workforce.routes.ts`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workforce/dashboard` | Returns active workers, working today, active jobs, and monthly payroll totals |
| `GET` / `PUT` | `/api/workforce/settings` | Get and update company onboarding and workforce attendance settings |
| `GET` / `POST` | `/api/workforce/workers` | Fetch filtered worker roster or add a new worker |
| `POST` | `/api/workforce/workers/import` | Bulk import worker records from parsed CSV file |
| `GET` / `PUT` / `DELETE` | `/api/workforce/workers/:id` | Fetch detailed worker profile, update, or remove worker |
| `GET` / `POST` | `/api/workforce/attendance` | Fetch attendance log, record check-in/check-out, or manual status override |
| `GET` / `POST` | `/api/workforce/contracts` | Fetch or issue digital contracts |
| `PUT` | `/api/workforce/contracts/:id/accept` | Accept digital contract |
| `GET` / `POST` | `/api/workforce/payments` | Fetch payroll history or disburse worker payment |

---

## 📱 Mobile App Integration Notes (Connecta Mobile)

Connecta Mobile (`connecta-app`) can consume these exact `/api/workforce` endpoints for worker actions:
1. **Attendance Check-In**: `POST /api/workforce/attendance/check-in` with location coords (`lat`, `lng`).
2. **View Contract & Accept**: `GET /api/workforce/contracts` and `PUT /api/workforce/contracts/:id/accept`.
3. **Earnings & Payment History**: `GET /api/workforce/payments`.

---

## 🌐 Production Domain & Deployment

* **Target Subdomain**: `workforce.myconnecta.ng`
* **Vite Output**: `dist/`
* **Deployment**: Deploy `dist/` directory to Vercel, Netlify, or Nginx with SPA routing redirect (`try_files $uri /index.html;`).
