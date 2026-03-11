# Session Timeout Implementation

## Overview

LinkNest now implements a 12-hour automatic session timeout for enhanced security. Users will be automatically logged out after 12 hours of inactivity or when the session expires.

## Features

### 12-Hour Session Duration
- JWT tokens expire after 12 hours
- Session timer starts when user logs in or signs up
- Automatic logout when session expires

### Session Warnings
- Users receive a warning 5 minutes before session expiry
- Warning toast notification: "Your session will expire in 5 minutes"
- Gives users time to save their work

### Activity-Based Session Extension
- User activity (mouse clicks, keyboard input, scrolling, touch) resets the warning timer
- Session duration remains fixed at 12 hours from login
- Activity tracking prevents premature warnings during active use

### Automatic Cleanup
- Session data cleared on logout
- Encryption keys removed on session expiry
- All localStorage data cleaned up

## Implementation Details

### Backend Changes

**File: `backend/utils/helpers/generateTokenAndSetCookie.js`**
- JWT token expiration: `12h`
- Cookie maxAge: `12 * 60 * 60 * 1000` (12 hours in milliseconds)

### Frontend Changes

**File: `frontend/src/hooks/useSessionTimeout.js`**
- Custom React hook for session management
- Tracks session start time in localStorage
- Sets timeout for automatic logout
- Monitors user activity to prevent false warnings
- Shows warning 5 minutes before expiry

**File: `frontend/src/App.jsx`**
- Integrated `useSessionTimeout` hook
- Runs on app initialization

**File: `frontend/src/components/LoginCard.jsx`**
- Sets `session_start_time` in localStorage on successful login

**File: `frontend/src/components/SignupCard.jsx`**
- Sets `session_start_time` in localStorage on successful signup

**File: `frontend/src/hooks/useLogout.js`**
- Clears `session_start_time` on logout
- Removes encryption keys
- Cleans up all session data

## Session Flow

### Login/Signup
1. User logs in or signs up
2. Backend generates JWT token with 12-hour expiration
3. Frontend stores session start time in localStorage
4. Session timeout hook initializes

### During Session
1. Hook calculates remaining time
2. Sets warning timeout (12h - 5min)
3. Sets logout timeout (12h)
4. Monitors user activity
5. Activity resets warning timer (but not session duration)

### Session Expiry
1. Warning shown 5 minutes before expiry
2. At 12 hours, automatic logout triggered
3. User redirected to login page
4. All session data cleared

### Manual Logout
1. User clicks logout
2. Session data cleared immediately
3. Encryption keys removed
4. Redirected to login page

## User Experience

### Notifications
- **5 minutes before expiry**: "Session Expiring Soon - Your session will expire in 5 minutes. Please save your work."
- **On expiry**: "Session Expired - Your session has expired. Please login again."

### Behavior
- Session persists across page refreshes (tracked in localStorage)
- Session expires even if user is actively using the app after 12 hours
- No automatic session extension (security feature)
- User must log in again after 12 hours

## Security Benefits

1. **Limited exposure window**: Compromised tokens expire after 12 hours
2. **Automatic cleanup**: No indefinite sessions
3. **Activity monitoring**: Prevents unnecessary interruptions
4. **Clear warnings**: Users have time to save work
5. **Consistent enforcement**: Both frontend and backend enforce timeout

## Configuration

To change the session duration, update these values:

### Backend
```javascript
// backend/utils/helpers/generateTokenAndSetCookie.js
expiresIn: "12h"  // Change to desired duration
maxAge: 12 * 60 * 60 * 1000  // Change to match expiresIn
```

### Frontend
```javascript
// frontend/src/hooks/useSessionTimeout.js
const SESSION_DURATION = 12 * 60 * 60 * 1000;  // Change to match backend
const WARNING_TIME = 5 * 60 * 1000;  // Adjust warning time if needed
```

## Testing

To test the session timeout:

1. **Quick test (modify constants temporarily)**:
   - Set `SESSION_DURATION = 2 * 60 * 1000` (2 minutes)
   - Set `WARNING_TIME = 30 * 1000` (30 seconds)
   - Login and wait for warning and logout

2. **Production test**:
   - Login to the application
   - Wait 11 hours 55 minutes
   - Verify warning appears
   - Wait 5 more minutes
   - Verify automatic logout

3. **Activity test**:
   - Login to the application
   - Perform various activities (click, type, scroll)
   - Verify no premature warnings
   - Verify session still expires after 12 hours

## Notes

- Session duration is fixed and cannot be extended
- Users must log in again after 12 hours
- Session time is tracked client-side (localStorage)
- JWT token expiration is enforced server-side
- Both mechanisms work together for security
