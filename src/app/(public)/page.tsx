'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LocationProvider, useLocation } from '@/lib/context/LocationContext';
import { HeroSection } from '@/components/landing/HeroSection';
import { TabFilter } from '@/components/landing/TabFilter';
import { TrendingSection } from '@/components/landing/TrendingSection';
import { FeaturedCalendars } from '@/components/landing/FeaturedCalendars';
import { PriceSection } from '@/components/landing/PriceSection';
import { ThisWeekSection } from '@/components/landing/ThisWeekSection';
import { CategoryInterests } from '@/components/landing/CategoryInterests';
import { PopularCities } from '@/components/landing/PopularCities';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { CreateEventCTA } from '@/components/landing/CreateEventCTA';
import { useEventFilters } from '@/lib/hooks/useEventFilters';
import {
  mockFeaturedCalendars,
  mockPopularCities,
  mockTestimonials,
  mockTrustMetrics,
} from '@/lib/mock-landing-data';
import { getAllEvents } from '@/lib/services/apiService';
import type { Event } from '@/lib/types/event';
import type { ExtendedEvent } from '@/components/shared/EventCard';

/**
 * Landing page content component
 * Uses location context and event filters to display personalized content
 */
function LandingPageContent() {
  const { selectedLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch real events from backend on mount
  useEffect(() => {
    getAllEvents()
      .then((data) => setEvents((data || []).filter((e) => e.status === 'active') as unknown as Event[]))
      .catch(() => setEvents([]));
  }, []);

  // All filter variants at top level (required by Rules of Hooks)
  const { filteredEvents: allEvents } = useEventFilters(events);
  const { filteredEvents: todayEvents } = useEventFilters(events, { dateRange: 'today' });
  const { filteredEvents: weekendEvents } = useEventFilters(events, { dateRange: 'this-weekend' });
  const { filteredEvents: freeEvents } = useEventFilters(events, { isFree: true });
  const { filteredEvents: onlineEvents } = useEventFilters(events, { isOnline: true });

  // Select correct filtered set based on active tab
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
      {/* Hero Section */}
      <HeroSection />

      {/* Tab Filter */}
      <section className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <TabFilter
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="max-w-7xl mx-auto w-full space-y-16">
          {/* Trending Section */}
          <TrendingSection
            events={tabFilteredEvents}
            location={selectedLocation}
          />

          {/* Featured Calendars */}
          <FeaturedCalendars calendars={mockFeaturedCalendars} />

          {/* Price Sections */}
          <div className="space-y-16">
            <PriceSection
              title="Free Events"
              events={tabFilteredEvents}
              maxPrice={0}
            />

            <PriceSection
              title="Events Under $25"
              events={tabFilteredEvents}
              maxPrice={25}
            />
          </div>

          {/* This Week Section */}
          <ThisWeekSection events={tabFilteredEvents} />

          {/* Category Interests */}
          <CategoryInterests />

          {/* Popular Cities */}
          <PopularCities cities={mockPopularCities} />

          {/* Social Proof Section */}
          <SocialProofSection
            testimonials={mockTestimonials}
            trustMetrics={mockTrustMetrics}
          />

          {/* Create Event CTA */}
          <CreateEventCTA />
        </div>
      </div>
    </div>
  );
}

/**
 * Landing page with location context provider
 */
export default function HomePage() {
  return (
    <LocationProvider>
      <LandingPageContent />
    </LocationProvider>
  );
}
