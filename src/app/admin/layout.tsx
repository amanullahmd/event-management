import React from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

/**
 * Admin dashboard layout with sidebar navigation
 * Provides role-based access control and navigation for admin users
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminLinks = getRoleSidebarLinks('admin');

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <Header />

        {/* Main content with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar links={adminLinks} title="Admin Menu" />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto md:ml-0">
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
