import React from 'react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';

/**
 * Organizer Dashboard Layout
 * Provides layout with sidebar navigation for organizer-specific features
 */
export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    {
      label: 'Dashboard',
      href: '/organizer',
      icon: '📊',
    },
    {
      label: 'Events',
      href: '/organizer/events',
      icon: '📅',
    },
    {
      label: 'Tickets',
      href: '/organizer/tickets',
      icon: '🎫',
    },
    {
      label: 'Analytics',
      href: '/organizer/analytics',
      icon: '📈',
    },
    {
      label: 'Check-in',
      href: '/organizer/checkin',
      icon: '✓',
    },
    {
      label: 'Refunds',
      href: '/organizer/refunds',
      icon: '💰',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex flex-1">
        <Sidebar links={menuItems} title="Organizer Menu" />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
