# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the VelocityDash admin login system.

## Prerequisites

1. Firebase project created
2. Firebase Authentication enabled
3. Environment variables configured

## Setup Steps

### 1. Firebase Console Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Email/Password** authentication
5. Optionally, configure email verification settings

### 2. Environment Variables

Make sure your `.env.local` file contains the following Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Security Rules

Update your Firestore security rules to include user management:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Vehicles collection - only authenticated users can access
    match /vehicles/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Costs collection - only authenticated users can access
    match /costs/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Activities collection - only authenticated users can access
    match /activities/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Creating the First Admin User

1. Start your development server: `npm run dev`
2. Navigate to `/setup` in your browser
3. Fill out the admin setup form with:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
4. Click "Create Admin Account"
5. Once created, you can sign in at the login page

### 5. Using the Authentication System

#### Login
- Navigate to any protected route (like `/dashboard`)
- You'll be redirected to the login page if not authenticated
- Enter your email and password to sign in

#### Logout
- Click on your user profile in the header
- Select "Sign Out" from the dropdown menu

#### Protected Routes
- All main application routes are protected by default
- Admin-only routes (like `/admin`) require admin role
- Unauthenticated users are redirected to login
- Non-admin users accessing admin routes see an access denied message

## Features

### Authentication Context
- Global authentication state management
- User profile information
- Role-based access control
- Automatic session persistence

### Security Features
- Email/password authentication
- Role-based authorization (admin/standard)
- Protected routes
- Secure logout functionality

### User Management
- Admin user creation
- User profile storage in Firestore
- Role assignment and management
- Session management

## Troubleshooting

### Common Issues

1. **"User profile not found" error**
   - Make sure the user document exists in Firestore
   - Check that the user was created through the setup process

2. **"Invalid email or password" error**
   - Verify the user exists in Firebase Authentication
   - Check that the password is correct
   - Ensure email/password authentication is enabled in Firebase Console

3. **"Access Denied" error**
   - Verify the user has the correct role in Firestore
   - Check that the user document has `role: 'admin'` for admin access

4. **Environment variables not loading**
   - Restart your development server after adding environment variables
   - Ensure variables are prefixed with `NEXT_PUBLIC_`
   - Check that the `.env.local` file is in the project root

### Development Tips

- Use the Firebase Console to manage users during development
- Check the browser console for authentication errors
- Use the Network tab to debug API calls
- Test with different user roles to verify access control

## Production Considerations

1. **Security Rules**: Update Firestore rules for production
2. **Email Verification**: Enable email verification for production
3. **Password Policies**: Configure strong password requirements
4. **Rate Limiting**: Consider implementing rate limiting for login attempts
5. **Audit Logging**: Add comprehensive audit logging for admin actions

## API Reference

### AuthContext Methods

```typescript
const { user, loading, login, logout, isAdmin } = useAuth();

// Login with email and password
await login({ email: 'admin@example.com', password: 'password' });

// Logout current user
await logout();

// Check if current user is admin
const isAdminUser = isAdmin;
```

### AuthService Methods

```typescript
import { authService } from '@/lib/auth';

// Create admin user (setup only)
await authService.createAdminUser(email, password, displayName);

// Sign in with email/password
await authService.signInWithEmail({ email, password });

// Get user profile
const profile = await authService.getUserProfile(uid);
```
