'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import type { UserRole } from '@/lib/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

/**
 * ProtectedRoute component that checks authentication and role-based access
 * Redirects unauthorized users to login page
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user has required role
    if (requiredRole && user) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        const dashboardMap: Record<UserRole, string> = {
          admin: '/admin',
          organizer: '/organizer',
          customer: '/dashboard',
        };
        router.push(dashboardMap[user.role]);
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or doesn't have required role
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
