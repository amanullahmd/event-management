import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import EventEditForm from '../EventEditForm';
import * as apiUtils from '@/lib/utils/api';
import type { EventResponse } from '@/lib/types/event-update';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API utils
jest.mock('@/lib/utils/api', () => ({
  updateEvent: jest.fn(),
}));

describe('EventEditForm', () => {
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
    localStorage.setItem('auth_token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Form Pre-population', () => {
    it('should pre-populate form with event data', () => {
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockEvent.description)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockEvent.location)).toBeInTheDocument();
    });

    it('should display event type in select', () => {
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const eventTypeSelect = screen.getByDisplayValue('Conference');
      expect(eventTypeSelect).toBeInTheDocument();
    });

    it('should display tags', () => {
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      expect(screen.getByText('technology')).toBeInTheDocument();
      expect(screen.getByText('conference')).toBeInTheDocument();
    });
  });

  describe('Real-time Validation', () => {
    it('should validate title length on change', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'AB');

      await waitFor(() => {
        expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
      });
    });

    it('should validate description length on change', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const descriptionInput = screen.getByDisplayValue(mockEvent.description);
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'short');

      await waitFor(() => {
        expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('should validate capacity is positive integer', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const capacityInput = screen.getByDisplayValue(mockEvent.capacity.toString());
      await user.clear(capacityInput);
      await user.type(capacityInput, '-5');

      await waitFor(() => {
        expect(screen.getByText('Capacity must be a positive integer')).toBeInTheDocument();
      });
    });

    it('should validate date range', async () => {
      const user = userEvent.setup();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const startDateInput = screen.getAllByRole('textbox').find(
        input => input.getAttribute('type') === 'datetime-local'
      );

      if (startDateInput) {
        await user.clear(startDateInput);
        await user.type(startDateInput, pastDate.toISOString().slice(0, 16));

        await waitFor(() => {
          expect(screen.getByText('Start date must be in the future or present')).toBeInTheDocument();
        });
      }
    });

    it('should disable submit button when validation fails', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'AB');

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Save Changes/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Change Tracking', () => {
    it('should track changed fields', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      // Check for visual indicator (blue background)
      await waitFor(() => {
        expect(titleInput).toHaveClass('bg-blue-50');
      });
    });

    it('should show unsaved changes indicator', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      await waitFor(() => {
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
      });
    });

    it('should disable submit button when no changes', () => {
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit only changed fields', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockResolvedValue(mockEvent);
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateEvent).toHaveBeenCalledWith(
          mockEvent.id,
          expect.objectContaining({
            title: 'Updated Title',
            updatedAt: mockEvent.updatedAt,
          })
        );
      });
    });

    it('should show success message on successful update', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockResolvedValue(mockEvent);
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Event updated successfully!')).toBeInTheDocument();
      });
    });

    it('should redirect to event details on success', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockResolvedValue(mockEvent);
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(`/organizer/events/${mockEvent.id}`);
      }, { timeout: 2000 });
    });

    it('should call onSuccess callback', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockResolvedValue(mockEvent);
      const mockOnSuccess = jest.fn();
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
          onSuccess={mockOnSuccess}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockEvent);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on update failure', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockRejectedValue(new Error('Update failed'));
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('should handle authorization errors', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockRejectedValue(new Error('403'));
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('You do not have permission to update this event')).toBeInTheDocument();
      });
    });

    it('should call onError callback', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockRejectedValue(new Error('Update failed'));
      const mockOnError = jest.fn();
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
          onError={mockOnError}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Update failed');
      });
    });
  });

  describe('Tag Management', () => {
    it('should add tags', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={{ ...mockEvent, tags: [] }}
        />
      );

      const tagInput = screen.getByPlaceholderText('Add a tag and press Enter');
      await user.type(tagInput, 'newtag');

      const addButton = screen.getByRole('button', { name: /Add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('newtag')).toBeInTheDocument();
      });
    });

    it('should remove tags', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const removeButtons = screen.getAllByText('×');
      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('technology')).not.toBeInTheDocument();
      });
    });
  });

  describe('Unsaved Changes Protection', () => {
    it('should prompt before navigation with unsaved changes', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      
      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      await user.click(cancelButton);

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should not prompt when no unsaved changes', async () => {
      const user = userEvent.setup();
      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockRouter.back).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

  describe('Concurrent Update Conflict Handling', () => {
    it('should display conflict message', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockRejectedValue(new Error('409'));
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Event was modified by another user/i)).toBeInTheDocument();
      });
    });

    it('should provide refresh and retry option', async () => {
      const user = userEvent.setup();
      const mockUpdateEvent = jest.fn().mockRejectedValue(new Error('409'));
      (apiUtils.updateEvent as jest.Mock) = mockUpdateEvent;

      render(
        <EventEditForm
          eventId={mockEvent.id}
          initialEvent={mockEvent}
        />
      );

      const titleInput = screen.getByDisplayValue(mockEvent.title);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /Save Changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Refresh and Retry/i })).toBeInTheDocument();
      });
    });
  });
});
