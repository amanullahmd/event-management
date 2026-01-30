'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, LayoutDashboard, Ticket, Calendar, ChevronDown, Search, Menu, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'organizer': return '/organizer';
      case 'customer': return '/dashboard';
      default: return '/';
    }
  };

  const getRoleLabel = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin': return 'Administrator';
      case 'organizer': return 'Event Organizer';
      case 'customer': return 'Customer';
      default: return '';
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-slate-800/50' 
          : 'bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="text-gray-900 dark:text-white">EventHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                href="/events" 
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Find Events
              </Link>
              {isAuthenticated && user?.role === 'organizer' && (
                <Link 
                  href="/organizer/events" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  My Events
                </Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search Button - Desktop */}
            <Link href="/events" className="hidden md:flex">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {/* Create Event Button - For Organizers */}
                {user?.role === 'organizer' && (
                  <Link href="/organizer/events/new" className="hidden sm:flex">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Event
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-50 overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full">
                          {getRoleLabel()}
                        </span>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link 
                          href={getDashboardLink()} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" 
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        {user?.role === 'customer' && (
                          <Link 
                            href="/dashboard/tickets" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" 
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Ticket className="w-4 h-4 text-gray-400" />
                            My Tickets
                          </Link>
                        )}
                        {user?.role === 'organizer' && (
                          <Link 
                            href="/organizer/events" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" 
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Calendar className="w-4 h-4 text-gray-400" />
                            My Events
                          </Link>
                        )}
                        <Link 
                          href={`${getDashboardLink()}/profile`} 
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" 
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Profile
                        </Link>
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-gray-100 dark:border-slate-700 py-1">
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-4 pt-2 space-y-1 border-t border-gray-100 dark:border-slate-800">
            <Link 
              href="/events" 
              className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors" 
              onClick={() => setIsMenuOpen(false)}
            >
              Find Events
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  href={getDashboardLink()} 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user?.role === 'customer' && (
                  <Link 
                    href="/dashboard/tickets" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Ticket className="w-4 h-4" />
                    My Tickets
                  </Link>
                )}
                {user?.role === 'organizer' && (
                  <>
                    <Link 
                      href="/organizer/events" 
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar className="w-4 h-4" />
                      My Events
                    </Link>
                    <Link 
                      href="/organizer/events/new" 
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Link>
                  </>
                )}
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
