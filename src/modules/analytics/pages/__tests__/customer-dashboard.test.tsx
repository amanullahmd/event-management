/**
 * Customer Dashboard Unit Tests
 *
 * Tests loading state (skeleton visible during fetch),
 * error state (error message + retry button on API failure),
 * retry button re-invokes the API, no hardcoded growth indicators,
 * stat cards with real data, Recent Orders table, and empty state.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ModernCustomerDashboard from '../customer-dashboard-modern';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock useAuth
jest.mock('@/modules/authentication/context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User', email: 'test@example.com' } }),
}));

// Mock apiRequest
jest.mock('@/modules/shared-common/utils/api', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '@/modules/shared-common/utils/api';
const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Sample data
const sampleOrders = [
  {
    id: 'order-1',
    eventId: 'event-1',
    userId: 'user-1',
    totalAmount: 50.00,
    status: 'COMPLETED',
    createdAt: '2024-01-01',
    items: [{ id: 'item-1', ticketTypeId: 'tt-1', quantity: 2, unitPrice: 25.00 }],
  },
];

const sampleTickets = [
  {
    id: 'ticket-1',
    eventId: 'event-1',
    orderId: 'order-1',
    ticketTypeId: 'tt-1',
    qrCode: 'qr123',
    checkedIn: false,
    status: 'ACTIVE',
  },
];

describe('ModernCustomerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows skeleton with animate-pulse elements while data is being fetched', () => {
      mockApiRequest.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<ModernCustomerDashboard />);

      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error state', () => {
    it('displays "Dashboard Error" heading when API fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      });
    });

    it('displays a Retry button when API fails', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('calls apiRequest again when Retry button is clicked', async () => {
      // First two calls (orders + tickets) fail
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Reset and set up success for retry
      mockApiRequest.mockResolvedValueOnce(sampleOrders);
      mockApiRequest.mockResolvedValueOnce(sampleTickets);

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(screen.getAllByText('Total Orders').length).toBeGreaterThanOrEqual(1);
      });

      // Called at least twice (initial attempt + retry), 2 calls each
      expect(mockApiRequest).toHaveBeenCalledTimes(4);
    });
  });

  describe('No hardcoded growth indicators', () => {
    it('does not render hardcoded "12%", "8%", or "24%" growth values', async () => {
      mockApiRequest.mockResolvedValueOnce(sampleOrders);
      mockApiRequest.mockResolvedValueOnce(sampleTickets);

      const { container } = render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getAllByText('Total Orders').length).toBeGreaterThanOrEqual(1);
      });

      const textContent = container.textContent || '';
      expect(textContent).not.toMatch(/\b12%/);
      expect(textContent).not.toMatch(/\b8%/);
      expect(textContent).not.toMatch(/\b24%/);
    });
  });

  describe('Successful data rendering', () => {
    it('renders all four stat cards with real data', async () => {
      mockApiRequest.mockResolvedValueOnce(sampleOrders);
      mockApiRequest.mockResolvedValueOnce(sampleTickets);

      render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getAllByText('Total Orders').length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getAllByText('Total Tickets').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
      expect(screen.getAllByText('Total Spent').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the Recent Orders table with correct columns when orders exist', async () => {
      mockApiRequest.mockResolvedValueOnce(sampleOrders);
      mockApiRequest.mockResolvedValueOnce(sampleTickets);

      render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Recent Orders')).toBeInTheDocument();
      });

      expect(screen.getByText('Order ID')).toBeInTheDocument();
      expect(screen.getByText('Event')).toBeInTheDocument();
      expect(screen.getByText('Tickets')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders empty state "No orders yet" when orders array is empty', async () => {
      mockApiRequest.mockResolvedValueOnce([]);
      mockApiRequest.mockResolvedValueOnce([]);

      render(<ModernCustomerDashboard />);

      await waitFor(() => {
        expect(screen.getByText('No orders yet')).toBeInTheDocument();
      });
    });
  });
});
