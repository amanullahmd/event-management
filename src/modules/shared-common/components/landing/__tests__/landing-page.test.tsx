/**
 * Landing Page Unit Tests
 *
 * Tests hero section, tab filters, footer, event cards with real data,
 * and auth-based navigation (Login/Register vs Go to Dashboard).
 *
 * Validates: Requirements 8.2, 8.3, 8.4, 8.7
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// --- Mocks ---

const mockApiRequest = jest.fn();

jest.mock('@/modules/shared-common/utils/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  );
});

// Mock useAuth - default unauthenticated
const mockUseAuth = jest.fn();
jest.mock('@/modules/authentication/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useLocation
jest.mock('@/lib/context/LocationContext', () => ({
  LocationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocation: () => ({ selectedLocation: null, setSelectedLocation: jest.fn(), availableLocations: [] }),
}));

// Mock useEventFilters to pass events through
jest.mock('@/lib/hooks/useEventFilters', () => ({
  useEventFilters: (events: any[]) => ({ filteredEvents: events }),
}));

// Mock landing sub-components that have complex dependencies
jest.mock('@/modules/shared-common/components/landing/HeroSection', () => ({
  HeroSection: () => (
    <section data-testid="hero-section">
      <h1>Delightful Events Start Here</h1>
      <input aria-label="Search events" placeholder="Search events, categories, or locations..." />
      <button type="submit">Search</button>
    </section>
  ),
}));

jest.mock('@/modules/shared-common/components/landing/TabFilter', () => ({
  TabFilter: ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (id: string) => void }) => (
    <div data-testid="tab-filter" role="tablist" aria-label="Event filters">
      {['all', 'today', 'this-weekend', 'free', 'online'].map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onTabChange(tab)}
        >
          {tab === 'all' ? 'All' : tab === 'today' ? 'Today' : tab === 'this-weekend' ? 'This Weekend' : tab === 'free' ? 'Free' : 'Online'}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/modules/shared-common/components/landing/TrendingSection', () => ({
  TrendingSection: ({ events }: { events: any[] }) => (
    <section data-testid="trending-section">
      {events.map((e: any) => (
        <div key={e.id} data-testid="event-card">
          <span>{e.name}</span>
          <span>{e.location}</span>
        </div>
      ))}
    </section>
  ),
}));

jest.mock('@/modules/shared-common/components/landing/PriceSection', () => ({
  PriceSection: () => <section data-testid="price-section" />,
}));

jest.mock('@/modules/shared-common/components/landing/ThisWeekSection', () => ({
  ThisWeekSection: () => <section data-testid="this-week-section" />,
}));

jest.mock('@/modules/shared-common/components/landing/CategoryInterests', () => ({
  CategoryInterests: () => <section data-testid="category-interests" />,
}));

jest.mock('@/modules/shared-common/components/landing/CreateEventCTA', () => ({
  CreateEventCTA: () => <section data-testid="create-event-cta" />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: (props: any) => <span data-testid="icon-search" {...props} />,
  Calendar: (props: any) => <span data-testid="icon-calendar" {...props} />,
  Users: (props: any) => <span data-testid="icon-users" {...props} />,
  Music: (props: any) => <span data-testid="icon-music" {...props} />,
  UtensilsCrossed: (props: any) => <span data-testid="icon-utensils" {...props} />,
  Zap: (props: any) => <span data-testid="icon-zap" {...props} />,
  Flame: (props: any) => <span data-testid="icon-flame" {...props} />,
  CalendarCheck: (props: any) => <span data-testid="icon-calendar-check" {...props} />,
  Ticket: (props: any) => <span data-testid="icon-ticket" {...props} />,
  BarChart3: (props: any) => <span data-testid="icon-bar-chart" {...props} />,
  Shield: (props: any) => <span data-testid="icon-shield" {...props} />,
  Globe: (props: any) => <span data-testid="icon-globe" {...props} />,
  Twitter: (props: any) => <span data-testid="icon-twitter" {...props} />,
  Instagram: (props: any) => <span data-testid="icon-instagram" {...props} />,
  Linkedin: (props: any) => <span data-testid="icon-linkedin" {...props} />,
}));

// Mock PulsarFlowLogo
jest.mock('@/modules/shared-common/components/common/PulsarFlowLogo', () => ({
  PulsarFlowLogo: ({ variant }: { variant?: string }) => (
    <span data-testid="pulsarflow-logo">{variant === 'full' ? 'PulsarFlow' : 'PF'}</span>
  ),
}));

import HomePage from '@/modules/event-management/pages/landing';

// --- Sample Data ---

const sampleEvents = [
  {
    id: 'evt-1',
    title: 'Tech Conference 2024',
    description: 'A great tech conference',
    startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 11).toISOString(),
    location: 'San Francisco',
    category: 'Technology',
    status: 'published',
    organizerId: 'org-1',
  },
  {
    id: 'evt-2',
    title: 'Music Festival',
    description: 'Live music all day',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
    location: 'Austin',
    category: 'Music',
    status: 'active',
    organizerId: 'org-2',
  },
];

// --- Tests ---

describe('Landing Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: unauthenticated
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe('Hero section (Requirement 8.2)', () => {
    it('renders the hero section', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      });
    });

    it('renders a search input in the hero section', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /search events/i })).toBeInTheDocument();
      });
    });

    it('renders headline text in the hero section', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Delightful Events Start Here')).toBeInTheDocument();
      });
    });
  });

  describe('Tab filter section (Requirement 8.3)', () => {
    it('renders the tab filter', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-filter')).toBeInTheDocument();
      });
    });

    it('renders All tab', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
      });
    });

    it('renders Today tab', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Today' })).toBeInTheDocument();
      });
    });

    it('renders This Weekend tab', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'This Weekend' })).toBeInTheDocument();
      });
    });

    it('renders Free tab', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Free' })).toBeInTheDocument();
      });
    });

    it('renders Online tab', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Online' })).toBeInTheDocument();
      });
    });
  });

  describe('Footer section (Requirement 8.7)', () => {
    it('renders the footer', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      });
    });

    it('renders Twitter / X social media link in footer', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
      });
    });

    it('renders Instagram social media link in footer', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      });
    });

    it('renders LinkedIn social media link in footer', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
      });
    });

    it('renders navigation links in footer', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /browse events/i })).toBeInTheDocument();
      });
    });

    it('renders Privacy Policy link in footer', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
      });
    });
  });

  describe('Event cards with real data (Requirement 8.4)', () => {
    it('renders event cards when API returns events (array response)', async () => {
      mockApiRequest.mockResolvedValue(sampleEvents);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getAllByTestId('event-card').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders event cards when API returns paginated response', async () => {
      mockApiRequest.mockResolvedValue({ content: sampleEvents });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getAllByTestId('event-card').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders event name in event cards', async () => {
      mockApiRequest.mockResolvedValue(sampleEvents);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });
    });

    it('renders event location in event cards', async () => {
      mockApiRequest.mockResolvedValue(sampleEvents);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('San Francisco')).toBeInTheDocument();
      });
    });

    it('renders no event cards when API returns empty list', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        // Trending section renders null when no events
        expect(screen.queryByTestId('event-card')).not.toBeInTheDocument();
      });
    });

    it('renders no event cards when API call fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByTestId('event-card')).not.toBeInTheDocument();
      });
    });

    it('filters out non-published/non-active events', async () => {
      const eventsWithDraft = [
        ...sampleEvents,
        {
          id: 'evt-draft',
          title: 'Draft Event',
          description: 'Not published',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          location: 'Nowhere',
          category: 'Other',
          status: 'draft',
          organizerId: 'org-3',
        },
      ];
      mockApiRequest.mockResolvedValue(eventsWithDraft);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });

      expect(screen.queryByText('Draft Event')).not.toBeInTheDocument();
    });
  });

  describe('Navigation - unauthenticated state (Requirement 8.6)', () => {
    it('shows Login link when user is not authenticated', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
      });
    });

    it('shows Register link when user is not authenticated', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /sign up free/i })).toBeInTheDocument();
      });
    });

    it('does not show Go to Dashboard link when unauthenticated', async () => {
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /go to dashboard/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation - authenticated state (Requirement 8.6)', () => {
    it('shows Go to Dashboard link when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'CUSTOMER' },
        isAuthenticated: true,
        isLoading: false,
      });
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
      });
    });

    it('does not show Login link when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'CUSTOMER' },
        isAuthenticated: true,
        isLoading: false,
      });
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /^log in$/i })).not.toBeInTheDocument();
      });
    });

    it('links to /admin for ADMIN role', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
        isAuthenticated: true,
        isLoading: false,
      });
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
        expect(dashboardLink).toHaveAttribute('href', '/admin');
      });
    });

    it('links to /organizer for ORGANIZER role', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', name: 'Org User', email: 'org@example.com', role: 'ORGANIZER' },
        isAuthenticated: true,
        isLoading: false,
      });
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
        expect(dashboardLink).toHaveAttribute('href', '/organizer');
      });
    });

    it('links to /dashboard for CUSTOMER role', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u1', name: 'Customer User', email: 'customer@example.com', role: 'CUSTOMER' },
        isAuthenticated: true,
        isLoading: false,
      });
      mockApiRequest.mockResolvedValue([]);

      render(<HomePage />);

      await waitFor(() => {
        const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
        expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      });
    });
  });

  describe('Loading state', () => {
    it('shows a loading spinner while events are being fetched', () => {
      mockApiRequest.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<HomePage />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});
