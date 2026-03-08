import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventDetailsPage from '../event-detail';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: 'event-1' })),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockGetEventById = jest.fn();
jest.mock('@/modules/shared-common/services/apiService', () => ({
  getEventById: (...args: unknown[]) => mockGetEventById(...args),
}));

const mockAddItem = jest.fn();
jest.mock('@/modules/payment-processing/context/CartContext', () => ({
  useCart: () => ({ addItem: mockAddItem, items: [] }),
}));

jest.mock('@/modules/shared-common/components/public/TicketSelector', () => ({
  TicketSelector: ({ ticketTypes }: { ticketTypes: unknown[] }) => (
    <div data-testid="ticket-selector">TicketSelector ({ticketTypes.length} types)</div>
  ),
}));

const mockEvent = {
  id: 'event-1',
  name: 'Test Concert',
  description: 'A great concert event',
  organizerId: 'org-1',
  date: '2026-06-15T19:00:00Z',
  location: 'Madison Square Garden',
  category: 'Music',
  image: 'https://example.com/image.jpg',
  status: 'active' as const,
  totalAttendees: 500,
  createdAt: '2026-01-01T00:00:00Z',
  ticketTypes: [
    { id: 'tt-1', eventId: 'event-1', name: 'General', price: 50, quantity: 1000, sold: 200, type: 'general' },
    { id: 'tt-2', eventId: 'event-1', name: 'VIP', price: 150, quantity: 100, sold: 30, type: 'vip' },
  ],
};

describe('EventDetailsPage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('shows loading state initially', () => {
    mockGetEventById.mockReturnValue(new Promise(() => {}));
    render(<EventDetailsPage />);
    expect(screen.getByText('Loading event details...')).toBeInTheDocument();
  });

  it('shows event not found when event is null', async () => {
    mockGetEventById.mockResolvedValue(null);
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByText('Event Not Found')).toBeInTheDocument(); });
  });

  it('renders event details after loading', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByText('Test Concert')).toBeInTheDocument(); });
    expect(screen.getByText('A great concert event')).toBeInTheDocument();
    expect(screen.getByText('Madison Square Garden')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('displays event image when URL is present', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByText('Test Concert')).toBeInTheDocument(); });
    const img = screen.getByAltText('Test Concert');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows gradient placeholder when no image', async () => {
    mockGetEventById.mockResolvedValue({ ...mockEvent, image: undefined });
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByText('Test Concert')).toBeInTheDocument(); });
    expect(screen.queryByAltText('Test Concert')).not.toBeInTheDocument();
  });

  it('renders ticket stats correctly', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByText('Test Concert')).toBeInTheDocument(); });
    expect(screen.getByText('870')).toBeInTheDocument();
    expect(screen.getByText('Tickets Left')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Attendees')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('Starting From')).toBeInTheDocument();
  });

  it('renders ticket selector', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByTestId('ticket-selector')).toBeInTheDocument(); });
  });

  it('shows On Sale badge for active events', async () => {
    mockGetEventById.mockResolvedValue(mockEvent);
    render(<EventDetailsPage />);
    await waitFor(() => { expect(screen.getByText('On Sale')).toBeInTheDocument(); });
  });
});
