/**
 * EventCard Property-Based Tests
 *
 * Feature: event-category, Property 13: Event card displays category name
 *
 * For any event with an assigned category, the event card on the landing page
 * SHALL display the category name.
 *
 * **Validates: Requirements 6.5**
 */

import fc from 'fast-check';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { EventCard, type ExtendedEvent } from '@/modules/shared-common/components/shared/EventCard';

// --- Arbitraries ---

const categoryNameArb = fc.constantFrom(
  'Music', 'Technology', 'Sports', 'Art', 'Food & Drink', 'Conference',
  'Workshop', 'Networking', 'Health & Wellness', 'Education',
  'Entertainment', 'Charity', 'Business', 'Science', 'Travel'
);

const eventWithCategoryArb: fc.Arbitrary<ExtendedEvent> = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[A-Z][a-zA-Z0-9 ]{2,30}$/),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  organizerId: fc.uuid(),
  date: fc.constant('2025-06-15T10:00:00.000Z'),
  location: fc.stringMatching(/^[A-Z][a-zA-Z ]{2,20}$/),
  category: categoryNameArb,
  status: fc.constant('published' as const),
  ticketTypes: fc.constant([]),
  totalAttendees: fc.integer({ min: 0, max: 1000 }),
  createdAt: fc.constant('2025-01-01T00:00:00.000Z'),
});

const eventWithoutCategoryArb: fc.Arbitrary<ExtendedEvent> = eventWithCategoryArb.map((e) => ({
  ...e,
  category: '',
}));

// Mock next/link and next/image
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children);
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) =>
    React.createElement('img', { src, alt });
});

// --- Tests ---

describe('Feature: event-category, Property 13: Event card displays category name', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property: For any event with an assigned category, the event card
   * SHALL display the category name.
   *
   * **Validates: Requirements 6.5**
   */
  it('displays category name when event has a category', () => {
    fc.assert(
      fc.property(eventWithCategoryArb, (event) => {
        cleanup();

        render(
          React.createElement(EventCard, {
            event,
            showSaveButton: false,
            showSocialProof: false,
          })
        );

        const categoryBadges = screen.getAllByTestId('event-card-category');
        expect(categoryBadges.length).toBeGreaterThan(0);
        expect(categoryBadges[0]).toHaveTextContent(event.category);

        cleanup();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any event without a category, the event card
   * SHALL NOT display a category badge.
   *
   * **Validates: Requirements 6.5**
   */
  it('does not display category badge when event has no category', () => {
    fc.assert(
      fc.property(eventWithoutCategoryArb, (event) => {
        cleanup();

        render(
          React.createElement(EventCard, {
            event,
            showSaveButton: false,
            showSocialProof: false,
          })
        );

        const categoryBadges = screen.queryAllByTestId('event-card-category');
        expect(categoryBadges.length).toBe(0);

        cleanup();
      }),
      { numRuns: 20 }
    );
  });
});
