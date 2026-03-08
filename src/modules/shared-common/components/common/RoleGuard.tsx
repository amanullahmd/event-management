'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import type { UserRole } from '@/modules/authentication/types/user';

const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  CUSTOMER: '/dashboard',
};

const AUTH_STORAGE_KEYS = [
  'auth_token',
  'auth_refresh_token',
  'auth_token_expires_at',
  'auth_user_id',
  'auth_user_role',
];

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * RoleGuard wraps dashboard layouts to enforce role-based access.
 * - Shows a loading spinner while auth state is loading
 * - Redirects to /login (clearing tokens) if unauthenticated
 * - Redirects to the correct role dashboard if role doesn't match
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      // Clear all auth localStorage keys
      AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const correctRoute = ROLE_DASHBOARD_ROUTES[user.role];
      if (correctRoute) {
        router.push(correctRoute);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
