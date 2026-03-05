/**
 * Static content for landing page sections
 *
 * Featured calendars, cities, testimonials, and trust metrics are
 * intentional static/editorial configurations. Event data is fetched
 * from the real backend API in the landing page component.
 */

import { FeaturedCalendar } from '@/components/shared/FeaturedCalendarCard';
import { City } from '@/components/shared/CityCard';
import { Testimonial } from '@/components/shared/TestimonialCard';

/**
 * Featured calendars for the FeaturedCalendars section
 */
export const mockFeaturedCalendars: FeaturedCalendar[] = [
  {
    id: 'cal1',
    name: 'NYC Tech Events',
    description: 'All the best tech events happening in New York City',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    followerCount: 12500,
    eventCount: 245,
  },
  {
    id: 'cal2',
    name: 'Music Lovers',
    description: 'Curated music events from concerts to festivals',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop',
    followerCount: 18900,
    eventCount: 567,
  },
  {
    id: 'cal3',
    name: 'Foodie Adventures',
    description: 'Food festivals, tastings, and culinary experiences',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop',
    followerCount: 9800,
    eventCount: 342,
  },
  {
    id: 'cal4',
    name: 'Wellness & Fitness',
    description: 'Yoga, fitness classes, and wellness workshops',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop',
    followerCount: 15600,
    eventCount: 423,
  },
  {
    id: 'cal5',
    name: 'Comedy Central',
    description: 'Stand-up comedy shows and comedy festivals',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=300&fit=crop',
    followerCount: 22300,
    eventCount: 189,
  },
  {
    id: 'cal6',
    name: 'Art & Culture',
    description: 'Art exhibitions, theater, and cultural events',
    image: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=500&h=300&fit=crop',
    followerCount: 11200,
    eventCount: 298,
  },
];

/**
 * Popular cities for the PopularCities section
 */
export const mockPopularCities: City[] = [
  {
    id: 'ny',
    name: 'New York',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=400&fit=crop',
    eventCount: 1250,
  },
  {
    id: 'la',
    name: 'Los Angeles',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
    eventCount: 980,
  },
  {
    id: 'sf',
    name: 'San Francisco',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop',
    eventCount: 750,
  },
  {
    id: 'chicago',
    name: 'Chicago',
    image: 'https://images.unsplash.com/photo-1494522510464-1a2f3a52f203?w=500&h=400&fit=crop',
    eventCount: 720,
  },
  {
    id: 'miami',
    name: 'Miami',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop',
    eventCount: 680,
  },
  {
    id: 'boston',
    name: 'Boston',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=400&fit=crop',
    eventCount: 560,
  },
  {
    id: 'seattle',
    name: 'Seattle',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=400&fit=crop',
    eventCount: 490,
  },
  {
    id: 'denver',
    name: 'Denver',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=400&fit=crop',
    eventCount: 410,
  },
];

/**
 * Testimonials for the SocialProofSection
 */
export const mockTestimonials: Testimonial[] = [
  {
    id: 'test1',
    quote: 'Found the most amazing jazz concert through this platform. The event discovery experience is unmatched!',
    author: 'Sarah Johnson',
    source: 'App Store Review',
    rating: 5,
  },
  {
    id: 'test2',
    quote: 'As an organizer, this platform made it so easy to set up my first event. Highly recommended!',
    author: 'Michael Chen',
    source: 'Google Play Review',
    rating: 5,
  },
  {
    id: 'test3',
    quote: 'Love how I can discover events based on my interests. The personalization is spot on.',
    author: 'Emma Rodriguez',
    source: 'Twitter',
    rating: 5,
  },
  {
    id: 'test4',
    quote: 'Best event discovery app I\'ve used. The interface is intuitive and the events are always fresh.',
    author: 'David Park',
    source: 'App Store Review',
    rating: 5,
  },
  {
    id: 'test5',
    quote: 'Organized 3 events on this platform and the support team was incredibly helpful throughout.',
    author: 'Jessica Williams',
    source: 'LinkedIn',
    rating: 5,
  },
  {
    id: 'test6',
    quote: 'The location-based event discovery helped me find events I never would have known about!',
    author: 'Alex Thompson',
    source: 'Facebook',
    rating: 5,
  },
];

/**
 * Trust metrics for the SocialProofSection
 */
export const mockTrustMetrics = {
  organizers: 5000,
  eventsHosted: 50000,
};

