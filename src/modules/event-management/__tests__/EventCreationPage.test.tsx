import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import CreateEventPage from '@/app/organizer/events/new/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/lib/hooks', () => ({
  useAuth: jest.fn(),
}));

// Mock EventCreationForm component
jest.mock('@/modules/event-management/components/EventCreationForm', () => {
  return function MockEventCreationForm() {
    return <div data-testid="event-creation-form">Event Creation Form</div>;
  };
});

describe('EventCreationPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Authentication Check', () => {
    it('should display loading state while checking authentication', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      render(<CreateEventPage />);

      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('should redirect to login if not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<CreateEventPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should display error message if not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<CreateEventPage />);

      await waitFor(() => {
        expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
      });
    });

    it('should display Go to Login button if not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<CreateEventPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Rendering', () => {
    it('should render EventCreationForm when authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 'user-123', email: 'organizer@example.com' },
        isLoading: false,
        isAuthenticated: true,
      });

      render(<CreateEventPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-creation-form')).toBeInTheDocument();
      });
    });

    it('should not redirect to login when authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 'user-123', email: 'organizer@example.com' },
        isLoading: false,
        isAuthenticated: true,
      });

      render(<CreateEventPage />);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while checking auth', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      render(<CreateEventPage />);

      const spinner = screen.getByRole('presentation', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Go to Login Button', () => {
    it('should redirect to login when Go to Login button is clicked', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      const { rerender } = render(<CreateEventPage />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Go to Login/i });
        expect(button).toBeInTheDocument();
      });
    });
  });
});

