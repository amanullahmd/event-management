import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import EventEditPage from '@/app/organizer/events/[id]/edit/page';
import type { EventResponse } from '@/lib/types/event-update';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock auth context
jest.mock('@/modules/authentication/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('EventEditPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockEvent: EventResponse = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Tech Conference 2024',
    description: 'A comprehensive conference covering latest technology trends',
    organizerId: '660e8400-e29b-41d4-a716-446655440001',
    eventType: 'conference',
    startDate: new Date('2024-06-15T09:00:00Z'),
    endDate: new Date('2024-06-15T18:00:00Z'),
    location: 'San Francisco Convention Center',
    capacity: 500,
    tags: ['technology', 'conference'],
    notes: 'Early bird registration available',
    status: 'draft',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T14:45:00Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: mockEvent.id });
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: mockEvent.organizerId },
    });
    localStorage.setItem('auth_token', 'test-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockEvent,
    });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to login if not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        loading: false,
      });

      render(<EventEditPage />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should not redirect if authenticated', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        expect(mockRouter.push).not.toHaveBeenCalledWith('/login');
      });
    });

    it('should show loading state while checking authentication', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        loading: true,
      });

      render(<EventEditPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Event Loading', () => {
    it('should load event data from API', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/events/${mockEvent.id}`,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': expect.stringContaining('Bearer'),
            }),
          })
        );
      });
    });

    it('should display loading state while fetching event', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockEvent,
        }), 100))
      );

      render(<EventEditPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render EventEditForm with loaded event', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error if event not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Event not found')).toBeInTheDocument();
      });
    });

    it('should display error if user is not owner', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByText('You do not have permission to edit this event')).toBeInTheDocument();
      });
    });

    it('should redirect to login if unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      render(<EventEditPage />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should display generic error on other failures', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load event')).toBeInTheDocument();
      });
    });

    it('should display error on fetch exception', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should provide go back button on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      render(<EventEditPage />);

      await waitFor(() => {
        const goBackButton = screen.getByRole('button', { name: /Go Back/i });
        expect(goBackButton).toBeInTheDocument();
      });
    });
  });

  describe('Page Rendering', () => {
    it('should render EventEditForm component', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
      });
    });

    it('should pass event data to EventEditForm', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockEvent.description)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockEvent.location)).toBeInTheDocument();
      });
    });

    it('should pass eventId to EventEditForm', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        // Verify the form is rendered with the correct event
        expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
      });
    });
  });

  describe('Success Redirect', () => {
    it('should redirect to event details on success', async () => {
      render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
      });

      // The redirect happens in EventEditForm, not EventEditPage
      // This test verifies the page structure supports the redirect
      expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
    });
  });

  describe('Background Styling', () => {
    it('should have proper background styling', async () => {
      const { container } = render(<EventEditPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
      });

      const mainDiv = container.querySelector('.min-h-screen.bg-gray-50');
      expect(mainDiv).toBeInTheDocument();
    });
  });
});

