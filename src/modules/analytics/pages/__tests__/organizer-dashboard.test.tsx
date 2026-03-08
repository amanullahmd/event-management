/**
 * Organizer Dashboard Unit Tests
 *
 * Tests loading state (skeleton visible during fetch),
 * error state (error message + retry button on API failure),
 * and verifies no hardcoded event statistics in rendered output.
 *
 * Validates: Requirements 3.4, 3.5, 3.6
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';

// --- Mocks ---

const mockGetAllEvents = jest.fn();

jest.mock('@/modules/shared-common/services/apiService', () => ({
  getAllEvents: (...args: any[]) => mockGetAllEvents(...args),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/organizer',
}));

jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  );
});

const mockUser = {
  id: 'org-123',
  name: 'Jane Organizer',
  email: 'jane@example.com',
  role: 'ORGANIZER' as const,
  status: 'active' as const,
  createdAt: new Date(),
};

jest.mock('@/modules/authentication/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  }),
}));

// Mock lucide-react icons to simple spans
jest.mock('lucide-react', () => ({
  Calendar: (props: any) => <span data-testid="icon-calendar" {...props} />,
  DollarSign: (props: any) => <span data-testid="icon-dollar" {...props} />,
  Users: (props: any) => <span data-testid="icon-users" {...props} />,
  Plus: (props: any) => <span data-testid="icon-plus" {...props} />,
  Eye: (props: any) => <span data-testid="icon-eye" {...props} />,
  BarChart3: (props: any) => <span data-testid="icon-barchart" {...props} />,
  Clock: (props: any) => <span data-testid="icon-clock" {...props} />,
  MapPin: (props: any) => <span data-testid="icon-mappin" {...props} />,
  Ticket: (props: any) => <span data-testid="icon-ticket" {...props} />,
  AlertCircle: (props: any) => <span data-testid="icon-alert" {...props} />,
  CheckCircle: (props: any) => <span data-testid="icon-check" {...props} />,
  Target: (props: any) => <span data-testid="icon-target" {...props} />,
  RefreshCw: (props: any) => <span data-testid="icon-refresh" {...props} />,
  Settings: (props: any) => <span data-testid="icon-settings" {...props} />,
}));

import ModernOrganizerDashboard from '../organizer-dashboard-modern';

// --- Sample Data ---

const sampleEvents = [
  {
    id: 'evt-1',
    name: 'Tech Conference 2024',
    description: 'A tech conference',
    organizerId: 'org-123',
    date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    location: 'San Francisco',
    category: 'Technology',
    status: 'PUBLISHED',
    ticketTypes: [
      { id: 'tt-1', eventId: 'evt-1', name: 'General', price: 50, quantity: 100, sold: 40, type: 'general' },
      { id: 'tt-2', eventId: 'evt-1', name: 'VIP', price: 150, quantity: 20, sold: 10, type: 'vip' },
    ],
    totalAttendees: 50,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'evt-2',
    name: 'Music Festival',
    description: 'A music festival',
    organizerId: 'org-123',
    date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    location: 'Austin',
    category: 'Music',
    status: 'active',
    ticketTypes: [
      { id: 'tt-3', eventId: 'evt-2', name: 'Standard', price: 75, quantity: 200, sold: 180, type: 'standard' },
    ],
    totalAttendees: 180,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'evt-3',
    name: 'Other Org Event',
    description: 'Not our event',
    organizerId: 'other-org',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: 'New York',
    category: 'Business',
    status: 'active',
    ticketTypes: [],
    totalAttendees: 0,
    createdAt: '2024-03-01T00:00:00Z',
  },
];

// --- Tests ---

describe('ModernOrganizerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows skeleton with animate-pulse while data is being fetched', async () => {
      // Keep the promise pending so loading state persists
      mockGetAllEvents.mockReturnValue(new Promise(() => {}));

      const { container } = render(<ModernOrganizerDashboard />);

      // The loading skeleton should contain animate-pulse elements
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error state', () => {
    it('displays error message when API call fails', async () => {
      mockGetAllEvents.mockRejectedValue(new Error('Network error'));

      render(<ModernOrganizerDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      });
    });

    it('displays a Retry button on error', async () => {
      mockGetAllEvents.mockRejectedValue(new Error('Server error'));

      render(<ModernOrganizerDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('re-fetches data when Retry button is clicked', async () => {
      // First call fails
      mockGetAllEvents.mockRejectedValueOnce(new Error('fail'));

      render(<ModernOrganizerDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Setup success for retry
      mockGetAllEvents.mockResolvedValueOnce(sampleEvents);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      });

      // getAllEvents called twice: initial + retry
      expect(mockGetAllEvents).toHaveBeenCalledTimes(2);
    });
  });

  describe('No hardcoded event statistics', () => {
    it('does not render hardcoded "18%" or "+24%" in the output', async () => {
      mockGetAllEvents.mockResolvedValue(sampleEvents);

      const { container } = render(<ModernOrganizerDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      });

      const textContent = container.textContent || '';

      // These were the old hardcoded growth percentages that must not appear
      expect(textContent).not.toMatch(/\b18%/);
      expect(textContent).not.toMatch(/\+24%/);
    });
  });

  describe('Successful data rendering', () => {
    it('renders metric summary cards with data derived from events', async () => {
      mockGetAllEvents.mockResolvedValue(sampleEvents);

      render(<ModernOrganizerDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Events')).toBeInTheDocument();
      });

      // "Tickets Sold" appears in both the summary card and event rows, so use getAllByText
      expect(screen.getAllByText('Tickets Sold').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    });

    it('filters events by the authenticated organizer ID', async () => {
      mockGetAllEvents.mockResolvedValue(sampleEvents);

      render(<ModernOrganizerDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });

      expect(screen.getByText('Music Festival')).toBeInTheDocument();
      // Event from another organizer should not appear
      expect(screen.queryByText('Other Org Event')).not.toBeInTheDocument();
    });
  });
});
