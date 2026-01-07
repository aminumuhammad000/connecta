# Email Broadcast System - Setup & Testing Guide

## Overview
The broadcast email system has been fully implemented and now sends real emails using the SMTP configuration from the admin panel's Email & Notification Settings.

## Changes Made

### 1. Settings Page - Removed Database Management ✅
- Removed the "Database Management" tab from Settings
- Cleaned up all database backup/restore UI elements

### 2. Sidebar - Removed Placeholder Badges ✅
- Removed hardcoded badge numbers from:
  - Gig Applications (was showing 5)
  - Proposals (was showing 12)
  - Notifications (was showing 3)

### 3. Broadcast Email - Real Implementation ✅
- Replaced mock email sending with actual SMTP implementation
- Emails now use the configured settings from the database

## Setup Instructions

### Step 1: Configure Email Settings

1. Log into the Admin Panel
2. Navigate to **Settings → Email & Notification Settings**
3. Configure your Gmail SMTP settings:
   - **Email Provider**: Gmail
   - **Gmail Address**: `connectagigs@gmail.com`
   - **App Password**: `rdgr pwnj jrlu nmxa`
   - **From Email**: `connectagigs@gmail.com`
   - **From Name**: `Connecta`
4. Click **Save Changes**

### Step 2: Test Email Sending

#### Option A: Use the Admin Panel
1. Navigate to **Email Broadcast** in the sidebar
2. Compose your test email:
   - **Subject**: Enter a subject line
   - **Message Body**: Type your message
3. Select recipient type:
   - **All Users**: Sends to all registered users
   - **Selected Users**: Choose specific users from the list
   - **Individual User**: Send to a single email address
4. Click **Send Broadcast**
5. Check the success message showing how many emails were sent

#### Option B: Use the Test Script
Run the test email script from the terminal:
```bash
cd /home/amee/Desktop/connecta/server
npx ts-node src/scripts/test-email.ts
```

This will send a test email to `aminumuhammad00015@gmail.com`.

## How It Works

### Email Flow
1. **Admin configures SMTP** in Settings → Email & Notification Settings
2. **Settings saved to database** (SystemSettings collection in MongoDB)
3. **When sending emails**:
   - System retrieves SMTP settings from database
   - Creates nodemailer transporter with those settings
   - Sends emails to recipients
   - Returns success/failure statistics

### API Endpoint
```
POST /api/broadcast/email
```

**Request Body:**
```json
{
  "recipientType": "all" | "selected" | "individual",
  "subject": "Your Subject",
  "body": "Your message content",
  "selectedUserIds": ["userId1", "userId2"], // For 'selected' type
  "individualEmail": "user@example.com"      // For 'individual' type
}
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast email sent successfully to 5 recipient(s)",
  "data": {
    "sent": 5,
    "failed": 0,
    "total": 5
  }
}
```

## Email Template
Broadcast emails use a professional HTML template with:
- Connecta branding
- Responsive design
- Clean typography
- Footer with copyright information

## Troubleshooting

### Emails Not Sending?
1. **Check SMTP Configuration**:
   - Verify Gmail credentials are correct
   - Ensure App Password (not regular password) is used
   - Confirm "From Email" matches the Gmail address

2. **Check Server Logs**:
   - Look for email service errors in the console
   - Verify database connection is working

3. **Test Email Configuration**:
   ```bash
   cd /home/amee/Desktop/connecta/server
   npx ts-node src/scripts/test-email.ts
   ```

4. **Common Issues**:
   - **"Transporter not available"**: SMTP credentials missing or invalid
   - **Authentication failed**: Wrong password or App Password not enabled
   - **Connection timeout**: SMTP server unreachable (check firewall/network)

### Gmail App Password Setup
If you need to create a new App Password:
1. Go to your Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Use the generated 16-character password in the admin settings

## Files Modified

### Backend
- `/server/src/services/email.service.ts` - Added `sendBroadcastEmail()` function
- `/server/src/routes/broadcast.routes.ts` - New route for broadcast emails
- `/server/src/app.ts` - Registered broadcast routes

### Frontend
- `/admin/src/services/api.ts` - Added `broadcastAPI` methods
- `/admin/src/pages/EmailBroadcast.tsx` - Updated to use real API
- `/admin/src/pages/Settings.tsx` - Removed Database Management tab
- `/admin/src/components/Sidebar.tsx` - Removed placeholder badges

## Support

If you encounter any issues, check:
1. Server is running (`npm run dev` in /server)
2. Database connection is active
3. SMTP settings are correctly configured in admin panel
4. Email credentials are valid and App Password is enabled

---

Last Updated: 2026-01-06
Version: 1.0.0
