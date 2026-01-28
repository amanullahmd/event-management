import React from 'react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

/**
 * Customer Dashboard Layout
 * Provides layout with sidebar navigation for customer-specific features
 * Includes Dashboard, Tickets, Orders, and Profile menu items
 */
export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customerLinks = getRoleSidebarLinks('customer');

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="flex flex-1">
          <Sidebar links={customerLinks} title="My Account" />
          <main className="flex-1 overflow-auto">
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
