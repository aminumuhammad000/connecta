# 🧪 Quick Testing Guide - Connecta AI Agent

## ✅ What Was Implemented

### 1. Related Tasks System
Every AI response now includes **contextual suggestions** for what to do next!

**Example:**
```
User: "Show my profile"
AI: [Returns profile data]
    
    **You can also:**
    ✏️ Update your profile
    📊 Check profile analytics  
    💪 Analyze profile strength
```

### 2. Enhanced All Tools
All tools now provide helpful next-step guidance automatically.

---

## 🚀 Quick Test Commands

### Test 1: Greeting (Shows Capabilities)
```bash
# Test via curl
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hi"}'

# Expected: Shows capabilities list
```

### Test 2: Profile (With Related Tasks)
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Show my profile"}'

# Expected: Returns profile + suggests "Update profile", "Check analytics"
```

### Test 3: Find Gigs (With Related Tasks)
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Find gigs for me"}'

# Expected: Shows gigs + suggests "Save gig", "Create cover letter"
```

### Test 4: Support Contact
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Contact support"}'

# Expected: Shows email/phone/WhatsApp + related tasks
```

---

## 📋 Manual Testing Checklist

Test these in your Connecta app AI chat:

### Greetings
- [ ] "Hi" → Shows capabilities list ✅
- [ ] "Hello" → Welcomes with options ✅
- [ ] "What can you do" → Lists all features ✅
- [ ] "Help" → Shows capabilities ✅

### Profile Functions
- [ ] "Show my profile" → Returns profile + suggests updates
- [ ] "View my profile" → Works correctly
- [ ] "Update my bio to [text]" → Updates + suggests view

### Gig Discovery
- [ ] "Find gigs" → Shows gigs + suggests save/cover letter
- [ ] "Search React jobs" → Finds React gigs
- [ ] "Show saved gigs" → Lists saved + suggests apply

### Cover Letters
- [ ] "Write a cover letter for [gig]" → Creates + suggests save/apply
- [ ] "Create cover letter" → Works

### Applications
- [ ] "Track my applications" → Lists apps + suggests find more gigs
- [ ] "My applications" → Shows status

### Support
- [ ] "Contact support" → Shows email/phone/WhatsApp
- [ ] "I need help" → Provides support info
- [ ] "Support contact" → Works

### Related Tasks Verification
- [ ] **Every response** includes "You can also:" section
- [ ] Suggestions are **contextual** and relevant
- [ ] At least **2-3 suggestions** per response

---

##  📊 Comprehensive Test Suite

Run the full automated test:

```bash
cd /home/amee/Desktop/connecta/server

# Set environment variables
export TEST_AUTH_TOKEN="your_token_here"
export TEST_USER_ID="your_user_id_here"
export API_BASE_URL="http://localhost:5000"

# Run test script
npx ts-node test-ai-agent.ts
```

**Expected Output:**
- Test results for all tools
- API endpoint verification
- Related tasks coverage report
- JSON results file generated

---

## 🔍 What to Look For

### In Every AI Response:

1. ✅ **Main Content** - The actual answer
2. ✅ **Related Tasks** - "You can also:" section
3. ✅ **2-3 Suggestions** - Contextual next steps
4. ✅ **Actionable** - Each suggestion is clickable/copyable

### Example Response Structure:
```json
{
  "success": true,
  "message": "Here's your profile...\n\n**You can also:**\n✏️ Update your profile\n📊 Check profile analytics",
  "data": {...},
  "relatedTasks": [
    "✏️ Update your profile",
    "📊 Check profile analytics",
    "💪 Analyze profile strength"
  ],
  "toolUsed": "get_profile_details_tool"
}
```

---

## 🛠️ Build & Deploy

### 1. Build Server
```bash
cd /home/amee/Desktop/connecta/server
npm run build
```

### 2. Start Server
```bash
# Development
npm run dev

# Production with PM2
pm2 restart connecta-server
pm2 logs connecta-server
```

### 3. Verify
```bash
# Check server is running
curl http://localhost:5000/health

# Test AI endpoint
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi"}'
```

---

## 📝 Test Results

After running tests, check:
- `ai-agent-test-results.json` - Detailed results
- Console output - Real-time status
- Related tasks coverage - Should be > 80%

---

## ✅ Success Criteria

- [ ] All essential tools working (profile, gigs, cover letters, support)
- [ ] Every response includes related tasks
- [ ] Greet shows full capabilities list
- [ ] Support contact info correct
- [ ] Gemini connection working
- [ ] Build successful with no errors

---

## 🐛 Troubleshooting

### Related Tasks Not Showing
**Check:**
1. Server rebuilt with latest changes?
2. Related tasks imported in agent?
3. Response includes `relatedTasks` field?

### Tool Not Working
**Check:**
1. API endpoint exists and accessible?
2. Authentication token valid?
3. Tool registered in tools/index.ts?

### Gemini Errors
**Check:**
1. GEMINI_API_KEY set in environment?
2. API key valid and active?
3. Check server logs for details

---

## 📞 Support

If you encounter issues:
1. Check server logs: `pm2 logs connecta-server`
2. Review test results JSON file
3. Test endpoints individually with curl
4. Verify authentication tokens

---

**Happy Testing! 🚀**

All tools should now provide helpful guidance to users automatically!
