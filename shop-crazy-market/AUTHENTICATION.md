# 🔐 Authentication System

## Overview

A complete authentication system has been implemented for Shop Crazy Market, including sign up, login, session management, and protected routes.

## Features

### ✅ User Registration
- Email and password signup
- Optional username
- Password validation (minimum 6 characters)
- Email uniqueness check
- Password hashing with bcrypt

### ✅ User Login
- Email/password authentication
- Session management via localStorage
- Error handling for invalid credentials

### ✅ Session Management
- AuthContext for global state management
- Persistent sessions via localStorage
- Automatic session restoration on page load

### ✅ Protected Routes
- Profile page requires authentication
- Messages require authentication
- Seller dashboard requires authentication
- Platform integrations require authentication
- Cart checkout requires authentication

## Implementation Details

### Database Schema

The `User` model has been updated to include:
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  username      String?
  passwordHash  String   // Hashed password
  role          Role     @default(USER)
  // ... other fields
}
```

### API Routes

#### POST `/api/auth/signup`
- Creates a new user account
- Validates email and password
- Hashes password before storing
- Returns user object (without password)

**Request:**
```json
{
  "email": "user@example.com",
  "username": "cooluser", // optional
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cooluser",
    "role": "USER"
  }
}
```

#### POST `/api/auth/login`
- Authenticates user credentials
- Verifies password hash
- Returns user object (without password)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cooluser",
    "role": "USER"
  }
}
```

### Client-Side Components

#### AuthContext (`contexts/AuthContext.tsx`)
- Provides `user`, `loading`, `login`, `signup`, `logout` functions
- Manages authentication state globally
- Persists session in localStorage

**Usage:**
```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return <div>Welcome, {user.email}!</div>;
}
```

#### Login Page (`/login`)
- Email and password form
- Error handling
- Link to signup page
- Redirects to home after successful login

#### Signup Page (`/signup`)
- Email, username (optional), password form
- Password confirmation
- Validation feedback
- Link to login page
- Redirects to home after successful signup

#### Profile Page (`/profile`)
- Displays user information
- Protected route (requires authentication)
- Logout button
- Quick links to seller dashboard and messages

### Updated Components

#### Bottom Navigation
- Shows login icon (🔐) when not authenticated
- Shows profile icon (👤) when authenticated

#### Home Page
- Shows welcome message for logged-in users
- Shows signup/login buttons for guests

#### Cart Page
- Redirects to login if user is not authenticated
- Sends user ID in checkout request headers

#### Messages Pages
- Require authentication
- Use authenticated user ID for message operations

#### Seller Dashboard
- Requires authentication
- TODO: Link to user's shop (currently uses placeholder shopId)

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **Password Validation**: Minimum 6 characters required
3. **Email Uniqueness**: Prevents duplicate accounts
4. **Secure Storage**: User sessions stored in localStorage (consider upgrading to httpOnly cookies for production)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install bcryptjs next-auth @types/bcryptjs
```

### 2. Update Database Schema
```bash
npm run db:push
```

### 3. Test Authentication

**Sign Up:**
1. Navigate to `/signup`
2. Enter email, username (optional), and password
3. Submit form

**Login:**
1. Navigate to `/login`
2. Enter email and password
3. Submit form

**Profile:**
1. After logging in, navigate to `/profile`
2. View your account information
3. Access seller dashboard and other features

## Next Steps

### Recommended Improvements

1. **Server-Side Sessions**
   - Replace localStorage with httpOnly cookies
   - Implement JWT tokens or session cookies
   - Add session expiration

2. **Email Verification**
   - Send verification emails
   - Require email verification before account activation

3. **Password Reset**
   - Forgot password flow
   - Email-based password reset

4. **Social Login**
   - Google OAuth
   - Facebook OAuth
   - Apple Sign In

5. **Two-Factor Authentication**
   - Optional 2FA for enhanced security
   - SMS or authenticator app support

6. **Rate Limiting**
   - Prevent brute force attacks
   - Limit login attempts

7. **User Profile Enhancement**
   - Profile picture upload
   - Bio/description
   - Shipping addresses
   - Payment methods

## Testing

### Manual Testing Checklist

- [ ] Sign up with new email
- [ ] Sign up with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should fail)
- [ ] Access protected routes when logged out (should redirect)
- [ ] Access protected routes when logged in (should work)
- [ ] Logout functionality
- [ ] Session persistence (refresh page, should stay logged in)
- [ ] Password validation (minimum 6 characters)

### API Testing

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Notes

- Current implementation uses localStorage for session management
- For production, consider implementing server-side sessions with httpOnly cookies
- Password hashing uses bcrypt with 10 rounds
- User IDs are UUIDs generated by Prisma
- All authentication errors return user-friendly messages

