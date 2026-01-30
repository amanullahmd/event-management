'use client';

import React, { useState, useEffect } from 'react';
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
  mockLandingEvents,
  mockFeaturedCalendars,
  mockPopularCities,
  mockTestimonials,
  mockTrustMetrics,
} from '@/lib/mock-landing-data';
import { cn } from '@/lib/utils/cn';

/**
 * Landing page content component
 * Uses location context and event filters to display personalized content
 */
function LandingPageContent() {
  const { selectedLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const { filteredEvents } = useEventFilters(mockLandingEvents);

  // Filter events by active tab
  const getTabFilteredEvents = () => {
    switch (activeTab) {
      case 'today':
        return useEventFilters(mockLandingEvents, { dateRange: 'today' }).filteredEvents;
      case 'this-weekend':
        return useEventFilters(mockLandingEvents, { dateRange: 'this-weekend' }).filteredEvents;
      case 'free':
        return useEventFilters(mockLandingEvents, { isFree: true }).filteredEvents;
      case 'online':
        return useEventFilters(mockLandingEvents, { isOnline: true }).filteredEvents;
      default:
        return filteredEvents;
    }
  };

  const tabFilteredEvents = getTabFilteredEvents();

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
