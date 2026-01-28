'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

interface NavigationLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavigationProps {
  links: NavigationLink[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Navigation component for displaying navigation links
 */
export function Navigation({
  links,
  className = '',
  orientation = 'horizontal',
}: NavigationProps) {
  const { user } = useAuth();

  const containerClass =
    orientation === 'horizontal'
      ? 'flex items-center gap-1'
      : 'flex flex-col gap-1';

  const linkClass =
    orientation === 'horizontal'
      ? 'px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900'
      : 'px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900 flex items-center gap-2';

  return (
    <nav className={`${containerClass} ${className}`}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={linkClass}
          aria-label={link.label}
        >
          {link.icon && <span className="w-5 h-5">{link.icon}</span>}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Get role-based navigation links
 */
export function getRoleBasedNavLinks(role?: string): NavigationLink[] {
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
