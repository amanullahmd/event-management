'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

interface SidebarLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface SidebarProps {
  links: SidebarLink[];
  title?: string;
}

/**
 * Sidebar component for dashboard navigation
 * Collapsible on mobile, always visible on desktop
 */
export function Sidebar({ links, title = 'Menu' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg transition-transform duration-300 z-40 md:relative md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  {link.icon && <span className="w-5 h-5">{link.icon}</span>}
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Logged in as
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                {user?.name}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize mt-1">
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/**
 * Get role-specific sidebar links
 */
export function getRoleSidebarLinks(role?: string): SidebarLink[] {
  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Organizers', href: '/admin/organizers' },
        { label: 'Events', href: '/admin/events' },
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Settings', href: '/admin/settings' },
      ];
    case 'organizer':
      return [
        { label: 'Dashboard', href: '/organizer' },
        { label: 'Events', href: '/organizer/events' },
        { label: 'Analytics', href: '/organizer/analytics' },
        { label: 'Check-in', href: '/organizer/checkin' },
      ];
    case 'customer':
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tickets', href: '/dashboard/tickets' },
        { label: 'Orders', href: '/dashboard/orders' },
        { label: 'Profile', href: '/dashboard/profile' },
      ];
    default:
      return [];
  }
}
