'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/modules/shared-common/components/ui/theme-toggle';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/modules/shared-common/utils/cn';

export interface DashboardLayoutProps {
  /** Sidebar navigation links */
  sidebarLinks: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string | number;
    description?: string;
  }>;
  /** Main content */
  children: ReactNode;
  /** Page title for breadcrumb */
  pageTitle?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DashboardLayout component
 * Provides a consistent layout for dashboard pages with sidebar and top bar
 */
export function DashboardLayout({
  sidebarLinks,
  children,
  pageTitle,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn('flex h-screen bg-white dark:bg-slate-950', className)}>
      {/* Sidebar */}
      <Sidebar links={sidebarLinks} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4">
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications */}
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* User menu - placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              U
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {pageTitle && (
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                {pageTitle}
              </h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
