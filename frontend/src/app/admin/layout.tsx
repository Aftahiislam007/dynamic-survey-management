'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { UserType } from '@/types/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, requireAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = requireAuth();
      if (isAuthenticated && user && !(user.userType === UserType.ADMIN || user.userType === UserType.SUPER_ADMIN)) {
        router.push('/officer/dashboard');
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [user, isLoading, requireAuth, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}