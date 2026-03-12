'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { PulsarFlowLogo } from './PulsarFlowLogo';

interface SidebarLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  description?: string;
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/admin' || href === '/organizer' || href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 z-40 md:relative md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'} w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <PulsarFlowLogo size="md" variant="full" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'ORGANIZER' ? 'Organizer' : 'Account'}
                  </p>
                </div>
              )}
              {isCollapsed && (
                <div className="mx-auto">
                  <PulsarFlowLogo size="md" variant="icon" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden md:flex p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {links.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? link.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {link.icon && (
                      <span className={`w-5 h-5 flex-shrink-0 transition-transform ${!isActive ? 'group-hover:scale-110' : ''}`}>
                        {link.icon}
                      </span>
                    )}
                    {!isCollapsed && (
                      <div className="min-w-0">
                        <span className="block truncate">{link.label}</span>
                        {link.description && !isActive && (
                          <span className="block text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {link.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isCollapsed && link.badge && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>
    </>
  );
}

export { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

