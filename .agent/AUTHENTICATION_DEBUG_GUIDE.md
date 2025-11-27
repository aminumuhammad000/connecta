# Authentication Debug Guide

## The Problem

You were experiencing an issue where after logging in successfully, you would get logged out and redirected back to the login page.

## Root Cause Analysis

### Cookie vs localStorage Mismatch

You mentioned this cookie code:
```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: false,     // Because you're using http, not https
  sameSite: "lax",   // NOT "none", unless https
});
```

**However**, this code is **NOT** in your actual `signin` function in `/server/src/controllers/user.controller.ts`.

### Current Implementation

1. **Backend** (`user.controller.ts` line 125):
   ```typescript
   res.status(200).json({ success: true, user, token });
   ```
   - Returns token in JSON response body
   - Does NOT set a cookie

2. **Frontend** (`api.ts` lines 26-28):
   ```typescript
   const token = localStorage.getItem('admin_token')
   if (token) {
     config.headers.Authorization = `Bearer ${token}`
   }
   ```
   - Expects token in localStorage
   - Sends token in Authorization header

3. **Login Page** (`Login.tsx` lines 31-32):
   ```typescript
   localStorage.setItem('admin_token', response.token)
   localStorage.setItem('admin_user', JSON.stringify(response.user || { email }))
   ```
   - Stores token in localStorage

## Issues Fixed

### 1. Duplicate Navigation Code in Login.tsx

**Before:**
```typescript
if (response.token) {
  localStorage.setItem('admin_token', response.token)
  localStorage.setItem('admin_user', JSON.stringify(response.user || { email }))
  toast.success('Welcome back! Redirecting...')
  setTimeout(() => navigate('/dashboard'), 500)
  return
}
  setTimeout(() => navigate('/dashboard'), 500)  // DUPLICATE!
  return                                          // DUPLICATE!
} else {
  throw new Error('No token received from server')
}
```

**After:**
```typescript
if (response?.token) {
  console.log('Token received, storing in localStorage')
  localStorage.setItem('admin_token', response.token)
  localStorage.setItem('admin_user', JSON.stringify(response.user || { email }))
  toast.success('Welcome back! Redirecting...')
  setTimeout(() => navigate('/dashboard'), 500)
  return
} else {
  console.error('No token in response:', response)
  throw new Error('No token received from server')
}
```

### 2. Added Debugging

Added console.log statements to track:
- Login attempts
- Token reception
- Authentication state checks

## How to Debug

1. **Open Browser Console** (F12)
2. **Try to login**
3. **Check console output** for:
   ```
   Attempting login with: { email: "..." }
   Login response: { success: true, user: {...}, token: "..." }
   Token received, storing in localStorage
   ProtectedRoute check: { isAuthenticated: true, hasToken: true, tokenLength: ... }
   ```

## Common Issues & Solutions

### Issue 1: "No token in response"
**Symptom:** Console shows `No token in response: {...}`

**Solution:** Check backend response format. The backend should return:
```json
{
  "success": true,
  "user": {...},
  "token": "eyJhbGc..."
}
```

### Issue 2: Token not persisting
**Symptom:** Token is saved but disappears after page refresh

**Solution:** Check if localStorage is being cleared somewhere. Search for:
```bash
grep -r "localStorage.removeItem" admin/src/
```

### Issue 3: 401 Unauthorized after login
**Symptom:** Login succeeds but immediately get 401 error

**Possible causes:**
1. Token format is incorrect
2. Backend JWT verification is failing
3. Token is not being sent in Authorization header

**Debug steps:**
1. Check Network tab in browser DevTools
2. Look at the Authorization header in requests
3. Verify token format: `Bearer <token>`

## If You Want to Use Cookies Instead

If you prefer cookie-based authentication, you need to:

### 1. Update Backend (`user.controller.ts`)

```typescript
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,     // Set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
```

### 2. Update Frontend API Configuration

```typescript
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies!
});

// Remove the request interceptor that adds Authorization header
// The cookie will be sent automatically
```

### 3. Update Login Page

```typescript
const response = await authAPI.login(email, password) as any
console.log('Login response:', response)

if (response?.success) {
  // No need to store token - it's in the cookie
  localStorage.setItem('admin_user', JSON.stringify(response.user || { email }))
  toast.success('Welcome back! Redirecting...')
  setTimeout(() => navigate('/dashboard'), 500)
  return
}
```

### 4. Update ProtectedRoute

```typescript
const ProtectedRoute = () => {
  const user = localStorage.getItem('admin_user');
  const isAuthenticated = !!user;
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

## Recommendation

**Stick with localStorage for now** because:
1. Your current implementation is working
2. Easier to debug (you can see the token in DevTools)
3. Works well with your current setup
4. No CORS complications

Only switch to cookies if you need:
- HttpOnly security (prevents XSS attacks)
- Automatic token management
- Better security for production

## Next Steps

1. Test the login flow with the fixes applied
2. Check browser console for debug messages
3. If still having issues, share the console output
4. Consider adding proper error boundaries and loading states
