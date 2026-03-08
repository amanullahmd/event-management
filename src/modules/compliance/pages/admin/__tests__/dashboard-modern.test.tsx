/**
 * Admin Dashboard Unit Tests
 *
 * Tests loading state, error state with retry, and verifies
 * no hardcoded growth percentages appear in rendered output.
 *
 * Validates: Requirements 2.5, 2.6, 2.7
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';

// --- Mocks ---

const mockGetDashboardMetrics = jest.fn();
const mockApiRequest = jest.fn();

jest.mock('@/modules/shared-common/services/apiService', () => ({
  getDashboardMetrics: (...args: any[]) => mockGetDashboardMetrics(...args),
}));

jest.mock('@/modules/shared-common/utils/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

// Mock lucide-react icons to simple spans
jest.mock('lucide-react', () => ({
  Users: (props: any) => <span data-testid="icon-users" {...props} />,
  Calendar: (props: any) => <span data-testid="icon-calendar" {...props} />,
  DollarSign: (props: any) => <span data-testid="icon-dollar" {...props} />,
  AlertCircle: (props: any) => <span data-testid="icon-alert" {...props} />,
  UserCheck: (props: any) => <span data-testid="icon-usercheck" {...props} />,
  RefreshCw: (props: any) => <span data-testid="icon-refresh" {...props} />,
}));

import ModernAdminDashboard from '../dashboard-modern';

// --- Helpers ---

const sampleMetrics = {
  totalUsers: 150,
  activeUsers: 120,
  totalOrganizers: 25,
  totalEvents: 40,
  activeEvents: 18,
  totalRevenue: 9500.5,
};

const sampleUsers = [
  {
    id: '1',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '2',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Jones',
    role: 'ORGANIZER',
    status: 'ACTIVE',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
];

// --- Tests ---

describe('ModernAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows skeleton with animate-pulse while data is being fetched', async () => {
      // Keep the promises pending so loading state persists
      mockGetDashboardMetrics.mockReturnValue(new Promise(() => {}));
      mockApiRequest.mockReturnValue(new Promise(() => {}));

      const { container } = render(<ModernAdminDashboard />);

      // The loading skeleton should contain animate-pulse elements
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error state', () => {
    it('displays error message when API call fails', async () => {
      mockGetDashboardMetrics.mockRejectedValue(new Error('Network error'));
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      render(<ModernAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      });
    });

    it('displays a Retry button on error', async () => {
      mockGetDashboardMetrics.mockRejectedValue(new Error('Server error'));
      mockApiRequest.mockRejectedValue(new Error('Server error'));

      render(<ModernAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('re-fetches data when Retry button is clicked', async () => {
      // First call fails
      mockGetDashboardMetrics.mockRejectedValueOnce(new Error('fail'));
      mockApiRequest.mockRejectedValueOnce(new Error('fail'));

      render(<ModernAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Setup success for retry
      mockGetDashboardMetrics.mockResolvedValueOnce(sampleMetrics);
      mockApiRequest.mockResolvedValueOnce(sampleUsers);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // getDashboardMetrics called twice: initial + retry
      expect(mockGetDashboardMetrics).toHaveBeenCalledTimes(2);
    });
  });

  describe('No hardcoded growth percentages', () => {
    it('does not render hardcoded "12%", "8%", "24%", or "18%" in the output', async () => {
      mockGetDashboardMetrics.mockResolvedValue(sampleMetrics);
      mockApiRequest.mockResolvedValue(sampleUsers);

      const { container } = render(<ModernAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      const textContent = container.textContent || '';

      // These were the old hardcoded growth percentages that must not appear
      expect(textContent).not.toMatch(/\b12%/);
      expect(textContent).not.toMatch(/\b8%/);
      expect(textContent).not.toMatch(/\b24%/);
      expect(textContent).not.toMatch(/\b18%/);
    });
  });

  describe('Successful data rendering', () => {
    it('renders metric cards with API data', async () => {
      mockGetDashboardMetrics.mockResolvedValue(sampleMetrics);
      mockApiRequest.mockResolvedValue(sampleUsers);

      render(<ModernAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Organizers')).toBeInTheDocument();
      expect(screen.getByText('Total Events')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('renders user table with API data', async () => {
      mockGetDashboardMetrics.mockResolvedValue(sampleMetrics);
      mockApiRequest.mockResolvedValue(sampleUsers);

      render(<ModernAdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Recent Users')).toBeInTheDocument();
      });

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });
});
