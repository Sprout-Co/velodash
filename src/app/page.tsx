'use client';

import { ProtectedRoute } from '@/components/auth';
import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <ProtectedRoute>
      {redirect('/dashboard')}
    </ProtectedRoute>
  );
}
