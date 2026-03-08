'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { LocationProvider, useLocation } from '@/lib/context/LocationContext';
import { HeroSection } from '@/modules/shared-common/components/landing/HeroSection';
import { TabFilter } from '@/modules/shared-common/components/landing/TabFilter';
import { TrendingSection } from '@/modules/shared-common/components/landing/TrendingSection';
import { PriceSection } from '@/modules/shared-common/components/landing/PriceSection';
import { ThisWeekSection } from '@/modules/shared-common/components/landing/ThisWeekSection';
import { CategoryInterests } from '@/modules/shared-common/components/landing/CategoryInterests';
import { CreateEventCTA } from '@/modules/shared-common/components/landing/CreateEventCTA';
import { useEventFilters } from '@/lib/hooks/useEventFilters';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiRequest } from '@/modules/shared-common/utils/api';
import { CategoryFilterBar } from '@/modules/event-management/components/CategoryFilterBar';
import { fetchCategories, type Category } from '@/modules/event-management/components/CategorySelector';
import { PulsarFlowLogo } from '@/modules/shared-common/components/common/PulsarFlowLogo';
import type { Event } from '@/lib/types/event';
import type { ExtendedEvent } from '@/modules/shared-common/components/shared/EventCard';
import {
  CalendarCheck,
  Ticket,
  BarChart3,
  Users,
  Zap,
  Shield,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EventResponse {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  categoryName?: string;
  categorySlug?: string;
  status: string;
  organizerId: string;
  imageUrl?: string;
  capacity?: number;
  eventType?: string;
  onlineLink?: string;
}

interface PlatformStats {
  totalEvents: number;
  totalCategories: number;
  totalOrganizers: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mapEventResponse(e: EventResponse): Event {
  return {
    id: e.id,
    name: e.title,
    description: e.description,
    organizerId: e.organizerId,
    date: e.startDate,
    location: e.location,
    category: e.categoryName ?? e.category ?? '',
    image: e.imageUrl,
    eventType: e.eventType,
    onlineLink: e.onlineLink,
    status: (e.status?.toLowerCase() as Event['status']) ?? 'active',
    ticketTypes: [],
    totalAttendees: e.capacity ?? 0,
    createdAt: e.startDate,
  };
}

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  CUSTOMER: '/dashboard',
};

/** Derive live stats from the events we already fetched */
function deriveStats(events: Event[]): PlatformStats {
  const categories = new Set(events.map((e) => e.category).filter(Boolean));
  const organizers = new Set(events.map((e) => e.organizerId).filter(Boolean));
  return {
    totalEvents: events.length,
    totalCategories: categories.size,
    totalOrganizers: organizers.size,
  };
}

/* ------------------------------------------------------------------ */
/*  LandingNav                                                         */
/* ------------------------------------------------------------------ */

function LandingNav() {
  const { user, isAuthenticated } = useAuth();
  const dashboardRoute = user?.role ? (ROLE_ROUTES[user.role] ?? '/dashboard') : '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" aria-label="PulsarFlow home">
          <PulsarFlowLogo size="md" variant="full" />
        </Link>
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href={dashboardRoute} className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-500/20">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Log in
              </Link>
              <Link href="/register" className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-500/20">
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  StatsBar — live numbers from the database                          */
/* ------------------------------------------------------------------ */

function StatsBar({ stats }: { stats: PlatformStats }) {
  const items = [
    { label: 'Live Events', value: stats.totalEvents, icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'Categories', value: stats.totalCategories, icon: <Globe className="w-5 h-5" /> },
    { label: 'Organizers', value: stats.totalOrganizers, icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <section className="bg-gradient-to-r from-violet-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <span className="text-violet-600 dark:text-violet-400">{item.icon}</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {item.value.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HowItWorks                                                         */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    { icon: <Globe className="w-7 h-7" />, title: 'Discover', desc: 'Browse events by category, location, or date.' },
    { icon: <Ticket className="w-7 h-7" />, title: 'Book', desc: 'Secure your tickets in seconds with safe checkout.' },
    { icon: <Zap className="w-7 h-7" />, title: 'Experience', desc: 'Show your QR code at the door and enjoy the event.' },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
        How PulsarFlow Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
              {step.icon}
            </div>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Step {i + 1}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TrustBanner                                                        */
/* ------------------------------------------------------------------ */

function TrustBanner() {
  const badges = [
    { icon: <Shield className="w-5 h-5" />, text: 'Secure Payments' },
    { icon: <BarChart3 className="w-5 h-5" />, text: 'Real-time Analytics' },
    { icon: <Users className="w-5 h-5" />, text: 'Organizer Tools' },
    { icon: <CalendarCheck className="w-5 h-5" />, text: 'QR Check-in' },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-6">
        {badges.map((b) => (
          <span key={b.text} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="text-violet-600 dark:text-violet-400">{b.icon}</span>
            {b.text}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  LandingFooter                                                      */
/* ------------------------------------------------------------------ */

function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <PulsarFlowLogo size="lg" variant="full" className="mb-4" />
            <p className="text-sm leading-relaxed">
              The modern event management platform. Discover, create, and manage events with ease.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
              <li><Link href="/events?filter=today" className="hover:text-white transition-colors">Today&apos;s Events</Link></li>
              <li><Link href="/events?filter=free" className="hover:text-white transition-colors">Free Events</Link></li>
              <li><Link href="/events?filter=online" className="hover:text-white transition-colors">Online Events</Link></li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-white font-semibold mb-4">Organizers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Create an Event</Link></li>
              <li><Link href="/organizer" className="hover:text-white transition-colors">Organizer Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
          &copy; {year} PulsarFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page content                                                  */
/* ------------------------------------------------------------------ */

function LandingPageContent() {
  const { selectedLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Fetch categories on mount
  useEffect(() => {
    if (!isClient) return;
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [isClient]);

  // Fetch events, re-fetch when selectedCategoryId changes
  useEffect(() => {
    if (!isClient) return;
    setIsLoading(true);

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000));
    const queryParam = selectedCategoryId ? `?categoryId=${selectedCategoryId}` : '';

    Promise.race([apiRequest(`/events${queryParam}`), timeout])
      .then((data: unknown) => {
        const raw = data as { content?: EventResponse[] } | EventResponse[];
        const list: EventResponse[] = Array.isArray(raw) ? raw : ((raw as { content?: EventResponse[] })?.content ?? []);
        const mapped = list
          .filter((e) => { const s = e.status?.toLowerCase(); return s === 'active' || s === 'published'; })
          .map(mapEventResponse);
        setEvents(mapped);
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setEvents([]);
      })
      .finally(() => setIsLoading(false));
  }, [isClient, selectedCategoryId]);

  const stats = useMemo(() => deriveStats(events), [events]);

  const { filteredEvents: allEvents } = useEventFilters(events);
  const { filteredEvents: todayEvents } = useEventFilters(events, { dateRange: 'today' });
  const { filteredEvents: weekendEvents } = useEventFilters(events, { dateRange: 'this-weekend' });
  const { filteredEvents: freeEvents } = useEventFilters(events, { isFree: true });
  const { filteredEvents: onlineEvents } = useEventFilters(events, { isOnline: true });

  const tabFilteredEvents = useMemo((): ExtendedEvent[] => {
    let base: Event[];
    switch (activeTab) {
      case 'today':        base = todayEvents; break;
      case 'this-weekend': base = weekendEvents; break;
      case 'free':         base = freeEvents; break;
      case 'online':       base = onlineEvents; break;
      default:             base = allEvents;
    }
    return base as ExtendedEvent[];
  }, [activeTab, allEvents, todayEvents, weekendEvents, freeEvents, onlineEvents]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNav />

      {/* Hero */}
      <HeroSection />

      {/* Live stats bar — real data */}
      {!isLoading && events.length > 0 && <StatsBar stats={stats} />}

      {/* Category filter bar */}
      {categories.length > 0 && (
        <section className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 pt-8">
          <div className="max-w-7xl mx-auto">
            <CategoryFilterBar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>
        </section>
      )}

      {/* Tab filter */}
      <section className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <TabFilter activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </section>

      {/* Event sections */}
      <div className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="max-w-7xl mx-auto w-full space-y-16">
          {!isClient || isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
            </div>
          ) : tabFilteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                📅
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No events available
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {events.length === 0
                  ? "We're having trouble loading events. Please check your connection or try again later."
                  : 'No events match your current filters.'}
              </p>
              {events.length === 0 && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <TrendingSection events={tabFilteredEvents} location={selectedLocation} />
          )}

          <div className="space-y-16">
            <PriceSection title="Free Events" events={tabFilteredEvents} maxPrice={0} />
            <PriceSection title="Events Under $25" events={tabFilteredEvents} maxPrice={25} />
          </div>

          <ThisWeekSection events={tabFilteredEvents} />
        </div>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Category interests */}
      <div className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <CategoryInterests />
        </div>
      </div>

      {/* Trust badges */}
      <TrustBanner />

      {/* Organizer CTA */}
      <div className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <CreateEventCTA />
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <LocationProvider>
      <LandingPageContent />
    </LocationProvider>
  );
}
