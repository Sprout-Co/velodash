// Authentication Provider
// Handles Firebase authentication for the app

'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/lib/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // If no user is authenticated, sign in anonymously
    if (!user && !loading) {
      authService.signInAnonymously()
        .then((user) => {
          console.log('Signed in anonymously:', user.uid);
        })
        .catch((error) => {
          console.error('Failed to sign in anonymously:', error);
        });
    }

    return () => unsubscribe();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
