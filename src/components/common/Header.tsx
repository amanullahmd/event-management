'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Header component with responsive navigation and user menu
 */
export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'organizer':
        return '/organizer';
      case 'customer':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const getRoleBasedNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
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
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950" role="banner">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            aria-label="Event Management System Home"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold" aria-hidden="true">
              E
            </div>
            <span className="hidden sm:inline">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {isAuthenticated && getRoleBasedNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                >
                  Browse Events
                </Link>
              </>
            )}
          </nav>

          {/* Right side - User menu and mobile menu button */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize font-medium mt-1">{user?.role}</p>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user?.role === 'customer' && (
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-50 rounded-md dark:text-slate-300 dark:hover:bg-slate-900"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1" aria-label="Mobile navigation">
            {isAuthenticated && getRoleBasedNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse Events
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
