'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { LocationProvider, useLocation } from '@/lib/context/LocationContext';
import { HeroSection } from '@/modules/shared-common/components/landing/HeroSection';
import { TabFilter } from '@/modules/shared-common/components/landing/TabFilter';
import { TrendingSection } from '@/modules/shared-common/components/landing/TrendingSection';
import { CategoryInterests } from '@/modules/shared-common/components/landing/CategoryInterests';
import { CreateEventCTA } from '@/modules/shared-common/components/landing/CreateEventCTA';
import { FeaturedCalendars } from '@/modules/shared-common/components/landing/FeaturedCalendars';
import { PopularCities } from '@/modules/shared-common/components/landing/PopularCities';
import { NewsletterSignup } from '@/modules/shared-common/components/landing/NewsletterSignup';
import { useEventFilters } from '@/lib/hooks/useEventFilters';
import { useInView } from '@/lib/hooks/useInView';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiRequest } from '@/modules/shared-common/utils/api';
import { CategoryFilterBar } from '@/modules/event-management/components/CategoryFilterBar';
import { fetchCategories, type Category } from '@/modules/event-management/components/CategorySelector';
import { PulsarFlowLogo } from '@/modules/shared-common/components/common/PulsarFlowLogo';
import type { FeaturedCalendar } from '@/modules/shared-common/components/shared/FeaturedCalendarCard';
import type { City } from '@/modules/shared-common/components/shared/CityCard';
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
  ArrowUp,
  ChevronRight,
  Sparkles,
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

function deriveStats(events: Event[]): PlatformStats {
  const categories = new Set(events.map((e) => e.category).filter(Boolean));
  const organizers = new Set(events.map((e) => e.organizerId).filter(Boolean));
  return {
    totalEvents: events.length,
    totalCategories: categories.size,
    totalOrganizers: organizers.size,
  };
}

/** US state abbreviations to identify "City, STATE" patterns */
const US_STATES = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']);

/** Extract city name from a location string like "Moscone Center, San Francisco, CA" */
function extractCity(location: string): string | null {
  if (!location || location.toLowerCase() === 'online') return null;
  const parts = location.split(',').map((p) => p.trim());
  if (parts.length >= 3) {
    const last = parts[parts.length - 1].toUpperCase();
    // If last part is a US state abbreviation, city is second-to-last
    if (US_STATES.has(last)) return parts[parts.length - 2];
    // Otherwise last part is likely the city (e.g., "WeWork, 11 Park Place, NYC")
    return parts[parts.length - 1];
  }
  if (parts.length === 2) {
    const last = parts[1].toUpperCase();
    // "San Francisco, CA" → San Francisco
    if (US_STATES.has(last)) return parts[0];
    return parts[0];
  }
  return parts[0];
}

/** Derive popular cities from real event data */
function deriveCities(events: Event[]): City[] {
  const cityMap = new Map<string, { count: number; image: string }>();
  for (const event of events) {
    const city = extractCity(event.location);
    if (!city) continue;
    const existing = cityMap.get(city);
    if (existing) {
      existing.count++;
    } else {
      cityMap.set(city, { count: 1, image: event.image || '' });
    }
  }
  return Array.from(cityMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, data]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      image: data.image || `https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=400&fit=crop`,
      eventCount: data.count,
    }));
}

/** Derive featured calendars from real categories + events */
function deriveCalendars(events: Event[], categories: Category[]): FeaturedCalendar[] {
  const categoryEventMap = new Map<string, { count: number; image: string }>();
  for (const event of events) {
    const cat = event.categoryName || event.category;
    if (!cat) continue;
    const img = event.imageUrl || event.image || '';
    const existing = categoryEventMap.get(cat);
    if (existing) {
      existing.count++;
      if (!existing.image && img) existing.image = img;
    } else {
      categoryEventMap.set(cat, { count: 1, image: img });
    }
  }
  return categories
    .map((cat) => {
      const data = categoryEventMap.get(cat.name);
      if (!data || data.count === 0) return null;
      return {
        id: cat.id || cat.name.toLowerCase().replace(/\s+/g, '-'),
        name: `${cat.name} Events`,
        description: `Discover ${cat.name} events near you`,
        image: data.image || `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop`,
        followerCount: data.count * 100, // derived estimate
        eventCount: data.count,
      } as FeaturedCalendar;
    })
    .filter((c): c is FeaturedCalendar => c !== null);
}

/* ------------------------------------------------------------------ */
/*  AnimatedSection — fade-up on scroll wrapper                        */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isInView } = useInView({ threshold: 0.08 });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LandingNav                                                         */
/* ------------------------------------------------------------------ */

function LandingNav() {
  const { user, isAuthenticated } = useAuth();
  const dashboardRoute = user?.role ? (ROLE_ROUTES[user.role] ?? '/dashboard') : '/dashboard';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg shadow-sm border-b border-slate-200/50 dark:border-slate-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" aria-label="PulsarFlow home">
          <PulsarFlowLogo size="md" variant="full" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/events"
            className={`hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              scrolled
                ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Browse Events
          </Link>

          {isAuthenticated ? (
            <Link
              href={dashboardRoute}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-500/20"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-lg bg-white text-violet-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-md"
              >
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
/*  TrustBar — animated count-up stats + trust badges                  */
/* ------------------------------------------------------------------ */

function TrustBar({ stats, realOrganizers }: { stats: PlatformStats; realOrganizers: number }) {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  const eventsCount = useCountUp(stats.totalEvents > 0 ? stats.totalEvents : 0, {
    startWhen: isInView,
    duration: 2000,
  });
  const organizersCount = useCountUp(realOrganizers > 0 ? realOrganizers : stats.totalOrganizers, {
    startWhen: isInView,
    duration: 2200,
  });
  const categoriesCount = useCountUp(stats.totalCategories > 0 ? stats.totalCategories : 0, {
    startWhen: isInView,
    duration: 1800,
  });

  const metrics = [
    { label: 'Events Hosted', value: eventsCount, suffix: '+', icon: CalendarCheck },
    { label: 'Organizers', value: organizersCount, suffix: '+', icon: Users },
    { label: 'Categories', value: categoriesCount, suffix: '', icon: Globe },
  ];

  const badges = [
    { icon: Shield, text: 'Secure Payments' },
    { icon: BarChart3, text: 'Real-time Analytics' },
    { icon: Zap, text: 'Instant Check-in' },
  ];

  return (
    <section ref={ref} className="relative bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 mb-3">
                <m.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums">
                {m.value.toLocaleString()}{m.suffix}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {badges.map((b) => (
            <span
              key={b.text}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <b.icon className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              {b.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HowItWorks — enhanced with connecting line + stagger               */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      icon: Globe,
      title: 'Discover',
      desc: 'Browse events by category, location, or date. Find exactly what excites you.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Ticket,
      title: 'Book',
      desc: 'Secure your tickets in seconds with our safe and seamless checkout.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Zap,
      title: 'Experience',
      desc: 'Show your QR code at the door and enjoy an unforgettable event.',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-4 py-20 sm:py-24">
        <AnimatedSection className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Simple as 1-2-3
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            How PulsarFlow Works
          </h2>
        </AnimatedSection>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden sm:block absolute top-[52px] left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-pink-200 dark:from-blue-800 dark:via-violet-800 dark:to-pink-800" />

          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 150}>
              <div className="flex flex-col items-center text-center relative">
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 sm:top-auto sm:-top-3 sm:right-auto sm:left-[calc(50%+20px)] w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center z-10 shadow-sm">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg mb-5 relative z-0`}>
                  <step.icon className="w-9 h-9" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  LandingFooter — enhanced with back-to-top + richer content         */
/* ------------------------------------------------------------------ */

function LandingFooter() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <PulsarFlowLogo size="lg" variant="full" className="mb-4" />
            <p className="text-sm leading-relaxed mb-5">
              The modern event management platform. Discover, create, and manage unforgettable experiences with ease.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', hoverColor: 'hover:text-sky-400' },
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', hoverColor: 'hover:text-pink-400' },
                { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', hoverColor: 'hover:text-blue-400' },
              ].map(({ icon: Icon, href, label, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ${hoverColor} hover:bg-slate-700 transition-all`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/events', label: 'Browse Events' },
                { href: '/events?filter=today', label: "Today's Events" },
                { href: '/events?filter=free', label: 'Free Events' },
                { href: '/events?filter=online', label: 'Online Events' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                    {link.label}
                    <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Organizers</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/register', label: 'Create an Event' },
                { href: '/organizer', label: 'Organizer Dashboard' },
                { href: '/login', label: 'Sign In' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                    {link.label}
                    <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors inline-flex items-center gap-1 group">
                    {link.label}
                    <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            &copy; {year} PulsarFlow. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
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
  const [platformOrganizers, setPlatformOrganizers] = useState(0);

  useEffect(() => { setIsClient(true); }, []);

  // Fetch categories on mount
  useEffect(() => {
    if (!isClient) return;
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [isClient]);

  // Fetch platform stats (public endpoint — no auth token needed)
  useEffect(() => {
    if (!isClient) return;
    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    fetch(`${API_BASE}/api/platform/stats`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.totalOrganizers) setPlatformOrganizers(data.totalOrganizers);
      })
      .catch(() => {});
  }, [isClient]);

  // Fetch events
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
  const popularCities = useMemo(() => deriveCities(events), [events]);
  const featuredCalendars = useMemo(() => deriveCalendars(events, categories), [events, categories]);

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
      {/* 1. Nav */}
      <LandingNav />

      {/* 2. Hero */}
      <HeroSection />

      {/* 3. TrustBar — animated count-up stats + trust badges */}
      <TrustBar stats={stats} realOrganizers={platformOrganizers} />

      {/* 4. Event Discovery — consolidated category filter + tabs + events */}
      <section className="bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Discover Events
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Browse upcoming events near you or explore by category and interest.
            </p>
          </AnimatedSection>

          {/* Category filter bar */}
          {categories.length > 0 && (
            <div className="mb-6">
              <CategoryFilterBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            </div>
          )}

          {/* Tab filter */}
          <div className="mb-8">
            <TabFilter activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Events display */}
          <div>
            {!isClient || isLoading ? (
              /* Skeleton loading grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl overflow-hidden">
                    <div className="h-48 bg-slate-200 dark:bg-slate-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tabFilteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
                  <CalendarCheck className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No events found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  {events.length === 0
                    ? "We're having trouble loading events. Please check your connection or try again later."
                    : 'No events match your current filters. Try broadening your search.'}
                </p>
                {events.length === 0 && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-500/20"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : (
              <TrendingSection events={tabFilteredEvents} location={selectedLocation} />
            )}
          </div>

          {/* Browse all link */}
          {tabFilteredEvents.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Browse All Events
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. Featured Calendars (from real categories) */}
      {featuredCalendars.length > 0 && (
        <section className="bg-slate-50/50 dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <AnimatedSection>
              <FeaturedCalendars calendars={featuredCalendars} />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* 6. Popular Cities (derived from real event locations) */}
      {popularCities.length >= 2 && (
        <section className="bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <AnimatedSection>
              <PopularCities cities={popularCities} />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* 7. How It Works */}
      <HowItWorks />

      {/* 8. Category Interests */}
      <section className="bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Explore Your Interests
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Find events that match your passions
              </p>
            </div>
            <CategoryInterests />
          </AnimatedSection>
        </div>
      </section>

      {/* 10. Create Event CTA */}
      <section className="bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <CreateEventCTA />
          </AnimatedSection>
        </div>
      </section>

      {/* 11. Newsletter Signup */}
      <AnimatedSection>
        <NewsletterSignup />
      </AnimatedSection>

      {/* 12. Footer */}
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
