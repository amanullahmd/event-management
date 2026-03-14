'use client';

import React, { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/modules/shared-common/components/ui/theme-toggle';
import { Bell, Search, LogOut, User, ChevronDown, Check, ShoppingCart, AlertCircle, Megaphone, Gift } from 'lucide-react';
import { cn } from '@/modules/shared-common/utils/cn';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiRequest } from '@/modules/shared-common/utils/api';
import { useCart } from '@/modules/payment-processing/context/CartContext';

interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface DashboardLayoutProps {
  sidebarLinks: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string | number;
    description?: string;
  }>;
  children: ReactNode;
  pageTitle?: string;
  className?: string;
}

function getProfileLink(role?: string): string {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return '/admin/profile';
    case 'ORGANIZER': return '/organizer/profile';
    default: return '/dashboard/profile';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'ORDER_CONFIRMED': return <ShoppingCart className="w-4 h-4 text-green-500" />;
    case 'PAYMENT_FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'EVENT_PUBLISHED': return <Megaphone className="w-4 h-4 text-violet-500" />;
    case 'NEW_ORDER': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
    case 'TICKET_PURCHASED': return <Gift className="w-4 h-4 text-emerald-500" />;
    default: return <Bell className="w-4 h-4 text-slate-500" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardLayout({
  sidebarLinks,
  children,
  pageTitle,
  className,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { items: cartItems } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiRequest<{ count: number }>('/notifications/unread-count');
      if (data) setUnreadCount(data.count);
    } catch {
      // silently ignore
    }
  }, []);

  // Poll unread count every 30s (async fetch — setState is called in the async callback, not synchronously)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiRequest<{ content: UserNotification[] }>('/notifications?page=0&size=10');
      if (data?.content) setNotifications(data.content);
      else if (Array.isArray(data)) setNotifications(data as unknown as UserNotification[]);
    } catch {
      // silently ignore
    }
  }, []);

  const handleBellClick = () => {
    const opening = !isNotifOpen;
    setIsNotifOpen(opening);
    setIsProfileOpen(false);
    if (opening) fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await apiRequest('/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = async (notif: UserNotification) => {
    if (!notif.read) await handleMarkAsRead(notif.id);
    setIsNotifOpen(false);
    if (notif.actionUrl) router.push(notif.actionUrl);
  };

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={cn('flex h-screen bg-white dark:bg-slate-950', className)}>
      <Sidebar links={sidebarLinks} />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4">
          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={cn(
                            'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0',
                            !notif.read && 'bg-violet-50/50 dark:bg-violet-900/10'
                          )}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm truncate', !notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300')}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart icon — CUSTOMER only */}
            {user?.role?.toUpperCase() === 'CUSTOMER' && (
              <Link
                href="/checkout"
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            <ThemeToggle />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2 px-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {avatarInitial}
                </div>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform hidden sm:block', isProfileOpen && 'rotate-180')} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || ''}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full">
                      {user?.role || 'USER'}
                    </span>
                  </div>

                  {/* Profile link */}
                  <div className="py-1">
                    <Link
                      href={getProfileLink(user?.role)}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
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
