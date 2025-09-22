// Firebase Authentication
// Admin authentication with email/password

import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthUser, LoginCredentials } from '@/types';

export const authService = {
  // Sign in with email and password
  async signInWithEmail(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: userData.role || 'standard'
      };
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      throw new Error('Failed to sign in');
    }
  },

  // Create admin user (for initial setup)
  async createAdminUser(email: string, password: string, displayName: string): Promise<AuthUser> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName,
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: new Date()
      });

      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: 'admin'
      };
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }
      throw new Error('Failed to create admin user');
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<AuthUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const firebaseUser = auth.currentUser;
      
      return {
        uid,
        email: firebaseUser?.email || null,
        displayName: firebaseUser?.displayName || null,
        role: userData.role || 'standard'
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
};
