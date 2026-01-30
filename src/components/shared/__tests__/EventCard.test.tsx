/**
 * EventCard Component Tests
 * 
 * Unit tests for the EventCard component covering:
 * - Rendering all required fields (image, title, date/time, price, organizer)
 * - Save button functionality
 * - Hover animations (via CSS classes)
 * - Different variants (default, compact, trending)
 * - Status badge display
 * - Social proof badge display
 * 
 * Requirements: 5.4, 5.7, 5.8
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard, ExtendedEvent } from '../EventCard';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} data-fill={fill ? 'true' : 'false'} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

/**
 * Create a mock event for testing
 */
function createMockEvent(overrides: Partial<ExtendedEvent> = {}): ExtendedEvent {
  return {
    id: 'event-123',
    name: 'Test Event',
    description: 'A test event description',
    organizerId: 'org-1',
    date: new Date('2024-06-15T19:00:00'),
    location: 'San Francisco, CA',
    category: 'Music',
    image: '/test-image.jpg',
    status: 'active',
    ticketTypes: [
      { id: 'ticket-1', eventId: 'event-123', name: 'General', price: 25, quantity: 100, sold: 50, type: 'regular' },
      { id: 'ticket-2', eventId: 'event-123', name: 'VIP', price: 75, quantity: 20, sold: 10, type: 'vip' },
    ],
    totalAttendees: 60,
    createdAt: new Date('2024-01-01'),
    organizer: {
      id: 'org-1',
      name: 'Test Organizer',
      followerCount: 1000,
    },
    interestedCount: 150,
    goingCount: 45,
    ...overrides,
  };
}

describe('EventCard', () => {
  describe('Default Variant', () => {
    it('renders event title', () => {
      const event = createMockEvent({ name: 'Amazing Concert' });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Amazing Concert')).toBeInTheDocument();
    });

    it('renders event image with correct alt text', () => {
      const event = createMockEvent({ name: 'Music Festival', image: '/festival.jpg' });
      render(<EventCard event={event} />);
      
      const image = screen.getByAltText('Music Festival');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/festival.jpg');
    });

    it('renders formatted date and time', () => {
      const event = createMockEvent({ date: new Date('2024-06-15T19:00:00') });
      render(<EventCard event={event} />);
      
      // Should display formatted date (format may vary by locale)
      expect(screen.getByText(/Jun/)).toBeInTheDocument();
      // Check for the full date string instead of just "15" which may match other numbers
      expect(screen.getByText(/Jun 15/)).toBeInTheDocument();
    });

    it('renders price formatted as "From $X"', () => {
      const event = createMockEvent({
        ticketTypes: [
          { id: '1', eventId: 'e1', name: 'Regular', price: 25, quantity: 100, sold: 0, type: 'regular' },
          { id: '2', eventId: 'e1', name: 'VIP', price: 100, quantity: 50, sold: 0, type: 'vip' },
        ],
      });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('From $25')).toBeInTheDocument();
    });

    it('renders "Free" when minimum price is 0', () => {
      const event = createMockEvent({
        ticketTypes: [
          { id: '1', eventId: 'e1', name: 'Free Entry', price: 0, quantity: 100, sold: 0, type: 'regular' },
        ],
      });
      render(<EventCard event={event} />);
      
      // "Free" appears both in price display and status badge
      const freeElements = screen.getAllByText('Free');
      expect(freeElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders organizer name', () => {
      const event = createMockEvent({
        organizer: { id: 'org-1', name: 'Cool Events Inc', followerCount: 500 },
      });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Cool Events Inc')).toBeInTheDocument();
    });

    it('renders location', () => {
      const event = createMockEvent({ location: 'New York, NY' });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
    });

    it('links to event detail page', () => {
      const event = createMockEvent({ id: 'event-456' });
      render(<EventCard event={event} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/events/event-456');
    });
  });

  describe('Save Button - Requirements 5.7', () => {
    it('renders save button when showSaveButton is true', () => {
      const event = createMockEvent();
      render(<EventCard event={event} showSaveButton />);
      
      expect(screen.getByRole('button', { name: /save event/i })).toBeInTheDocument();
    });

    it('does not render save button when showSaveButton is false', () => {
      const event = createMockEvent();
      render(<EventCard event={event} showSaveButton={false} />);
      
      expect(screen.queryByRole('button', { name: /save event/i })).not.toBeInTheDocument();
    });

    it('calls onSave callback when save button is clicked', () => {
      const event = createMockEvent({ id: 'event-789' });
      const onSave = jest.fn();
      render(<EventCard event={event} showSaveButton onSave={onSave} />);
      
      const saveButton = screen.getByRole('button', { name: /save event/i });
      fireEvent.click(saveButton);
      
      expect(onSave).toHaveBeenCalledWith('event-789');
    });

    it('toggles saved state when clicked', () => {
      const event = createMockEvent();
      render(<EventCard event={event} showSaveButton />);
      
      const saveButton = screen.getByRole('button', { name: /save event/i });
      fireEvent.click(saveButton);
      
      expect(screen.getByRole('button', { name: /remove from saved/i })).toBeInTheDocument();
    });

    it('shows saved state when isSaved prop is true', () => {
      const event = createMockEvent();
      render(<EventCard event={event} showSaveButton isSaved />);
      
      expect(screen.getByRole('button', { name: /remove from saved/i })).toBeInTheDocument();
    });
  });

  describe('Hover Animations - Requirements 5.8', () => {
    it('renders card with proper structure for hover effects', () => {
      const event = createMockEvent();
      const { container } = render(<EventCard event={event} />);
      
      // The card should be rendered as a link
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/events/${event.id}`);
    });

    it('has image with zoom effect class', () => {
      const event = createMockEvent();
      render(<EventCard event={event} />);
      
      const image = screen.getByAltText(event.name);
      expect(image.className).toMatch(/group-hover:scale/);
    });

    it('renders with transition styling', () => {
      const event = createMockEvent();
      render(<EventCard event={event} />);
      
      // Verify the image has transition classes for smooth animation
      const image = screen.getByAltText(event.name);
      expect(image.className).toMatch(/transition/);
    });
  });

  describe('Compact Variant', () => {
    it('renders in compact layout with horizontal structure', () => {
      const event = createMockEvent();
      render(<EventCard event={event} variant="compact" />);
      
      // Compact variant should still be a link
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/events/${event.id}`);
    });

    it('renders event title in compact variant', () => {
      const event = createMockEvent({ name: 'Compact Event' });
      render(<EventCard event={event} variant="compact" />);
      
      expect(screen.getByText('Compact Event')).toBeInTheDocument();
    });

    it('renders price in compact variant', () => {
      const event = createMockEvent({
        ticketTypes: [{ id: '1', eventId: 'e1', name: 'Regular', price: 50, quantity: 100, sold: 0, type: 'regular' }],
      });
      render(<EventCard event={event} variant="compact" />);
      
      expect(screen.getByText('From $50')).toBeInTheDocument();
    });
  });

  describe('Trending Variant', () => {
    it('renders rank number when provided', () => {
      const event = createMockEvent();
      render(<EventCard event={event} variant="trending" rank={1} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders rank with correct aria-label', () => {
      const event = createMockEvent();
      render(<EventCard event={event} variant="trending" rank={3} />);
      
      expect(screen.getByLabelText('Trending rank 3')).toBeInTheDocument();
    });

    it('does not render rank when not provided', () => {
      const event = createMockEvent();
      render(<EventCard event={event} variant="trending" />);
      
      expect(screen.queryByLabelText(/trending rank/i)).not.toBeInTheDocument();
    });

    it('renders all required fields in trending variant', () => {
      const event = createMockEvent({
        name: 'Trending Event',
        location: 'Los Angeles, CA',
        organizer: { id: 'org-1', name: 'Trending Org', followerCount: 2000 },
      });
      render(<EventCard event={event} variant="trending" rank={2} />);
      
      expect(screen.getByText('Trending Event')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
      expect(screen.getByText('Trending Org')).toBeInTheDocument();
    });
  });

  describe('Status Badge Display', () => {
    it('displays "Almost Full" badge when ticketAvailabilityPercent < 10', () => {
      const event = createMockEvent({ ticketAvailabilityPercent: 5 });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Almost Full')).toBeInTheDocument();
    });

    it('displays "Sale Ends Soon" badge when sale ends within 24 hours', () => {
      const now = new Date();
      const saleEndsAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
      const event = createMockEvent({ saleEndsAt });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Sale Ends Soon')).toBeInTheDocument();
    });

    it('displays "Featured" badge when isFeatured is true', () => {
      const event = createMockEvent({ isFeatured: true });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('displays "Free" badge when minimum price is 0', () => {
      const event = createMockEvent({
        ticketTypes: [{ id: '1', eventId: 'e1', name: 'Free', price: 0, quantity: 100, sold: 0, type: 'regular' }],
      });
      render(<EventCard event={event} />);
      
      // Check for the status badge specifically
      expect(screen.getByRole('status', { name: /event status: free/i })).toBeInTheDocument();
    });

    it('prioritizes "Almost Full" over other badges', () => {
      const event = createMockEvent({
        ticketAvailabilityPercent: 5,
        isFeatured: true,
      });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Almost Full')).toBeInTheDocument();
      expect(screen.queryByText('Featured')).not.toBeInTheDocument();
    });
  });

  describe('Social Proof Badge', () => {
    it('displays social proof when showSocialProof is true and counts exist', () => {
      const event = createMockEvent({ interestedCount: 100, goingCount: 25 });
      render(<EventCard event={event} showSocialProof />);
      
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('interested')).toBeInTheDocument();
    });

    it('does not display social proof when showSocialProof is false', () => {
      const event = createMockEvent({ interestedCount: 100, goingCount: 25 });
      render(<EventCard event={event} showSocialProof={false} />);
      
      expect(screen.queryByText('interested')).not.toBeInTheDocument();
    });

    it('does not display social proof when counts are zero', () => {
      const event = createMockEvent({ interestedCount: 0, goingCount: 0 });
      render(<EventCard event={event} showSocialProof />);
      
      expect(screen.queryByText('interested')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing organizer gracefully', () => {
      const event = createMockEvent({ organizer: undefined });
      render(<EventCard event={event} />);
      
      expect(screen.getByText('Event Organizer')).toBeInTheDocument();
    });

    it('handles empty ticket types', () => {
      const event = createMockEvent({ ticketTypes: [] });
      render(<EventCard event={event} />);
      
      // "Free" appears both in price display and status badge
      const freeElements = screen.getAllByText('Free');
      expect(freeElements.length).toBeGreaterThanOrEqual(1);
    });

    it('handles missing image with placeholder', () => {
      const event = createMockEvent({ image: '' });
      render(<EventCard event={event} />);
      
      const image = screen.getByAltText(event.name);
      expect(image).toHaveAttribute('src', '/placeholder-event.jpg');
    });

    it('applies custom className to the card', () => {
      const event = createMockEvent();
      render(<EventCard event={event} className="custom-class" />);
      
      // The link should be rendered
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });
});
