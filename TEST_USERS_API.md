# Test Users API

## API Endpoints Created

### 1. Get All Users
```
GET http://localhost:5000/api/users
```

### 2. Get Users by Type (Freelancers only)
```
GET http://localhost:5000/api/users?userType=freelancer
```

### 3. Get Users by Skills
```
GET http://localhost:5000/api/users?skills=React
```

### 4. Get Users with Limit
```
GET http://localhost:5000/api/users?limit=10
```

### 5. Get User by ID
```
GET http://localhost:5000/api/users/YOUR_USER_ID
```

### 6. Combined Query
```
GET http://localhost:5000/api/users?userType=freelancer&skills=React&limit=20
```

---

## How to Test

### Option 1: Using Browser
Just paste any URL above in your browser address bar

### Option 2: Using cURL
```bash
# Get all users
curl http://localhost:5000/api/users

# Get freelancers only
curl "http://localhost:5000/api/users?userType=freelancer"

# Get users with React skill
curl "http://localhost:5000/api/users?skills=React"
```

### Option 3: Using Postman/Thunder Client
1. Open Postman or Thunder Client
2. Create GET request
3. Enter URL: `http://localhost:5000/api/users`
4. Add query parameters if needed
5. Send request

---

## Expected Response Format

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "67890abc...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "userType": "freelancer",
      "skills": ["React", "Node.js"],
      "bio": "Full stack developer",
      "hourlyRate": 50,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    // ... more users
  ]
}
```

---

## How AI Will Use This

When you ask Connecta AI:
- "Show me all freelancers"
- "Find React developers"
- "List all users"

The AI will call:
```
GET /api/users?userType=freelancer
```

And return profile cards in the UI!

---

## Test Steps

1. **Restart your backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Test the API directly**
   ```
   Open: http://localhost:5000/api/users
   ```

3. **Test with AI**
   ```
   Go to: http://localhost:5173/freelancer/ai
   Ask: "Show me all freelancers"
   ```

4. **Check Console**
   - Should see profiles in response
   - Should show profile cards in UI
