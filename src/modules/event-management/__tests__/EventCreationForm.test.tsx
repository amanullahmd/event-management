import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import EventCreationForm from '../EventCreationForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('EventCreationForm', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Form Rendering', () => {
    it('should render all required form fields', () => {
      render(<EventCreationForm />);

      expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Capacity/i)).toBeInTheDocument();
    });

    it('should display Draft indicator prominently', () => {
      render(<EventCreationForm />);

      const draftBadge = screen.getByText(/Draft Status/i);
      expect(draftBadge).toBeInTheDocument();
      expect(draftBadge).toHaveClass('bg-yellow-100');
    });

    it('should display draft status message', () => {
      render(<EventCreationForm />);

      expect(screen.getByText(/won't be visible to the public until you publish it/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<EventCreationForm />);

      expect(screen.getByRole('button', { name: /Create Event as Draft/i })).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<EventCreationForm />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  describe('Real-time Validation', () => {
    it('should validate title in real-time', async () => {
      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);

      // Empty title
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '');
      fireEvent.blur(titleInput);

      // Too short
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'ab');
      fireEvent.blur(titleInput);

      // Valid
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Valid Title');
      fireEvent.blur(titleInput);
    });

    it('should validate description in real-time', async () => {
      render(<EventCreationForm />);

      const descriptionInput = screen.getByLabelText(/Description/i);

      // Too short
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'short');
      fireEvent.blur(descriptionInput);

      // Valid
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'This is a valid description with enough characters');
      fireEvent.blur(descriptionInput);
    });

    it('should validate dates in real-time', async () => {
      render(<EventCreationForm />);

      const startDateInput = screen.getByLabelText(/Start Date/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/End Date/i) as HTMLInputElement;

      // Set future dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.clear(startDateInput);
      await userEvent.type(startDateInput, tomorrowStr);
      fireEvent.blur(startDateInput);

      await userEvent.clear(endDateInput);
      await userEvent.type(endDateInput, dayAfterStr);
      fireEvent.blur(endDateInput);
    });

    it('should validate capacity as positive integer', async () => {
      render(<EventCreationForm />);

      const capacityInput = screen.getByLabelText(/Capacity/i);

      // Negative number
      await userEvent.clear(capacityInput);
      await userEvent.type(capacityInput, '-5');
      fireEvent.blur(capacityInput);

      // Valid
      await userEvent.clear(capacityInput);
      await userEvent.type(capacityInput, '100');
      fireEvent.blur(capacityInput);
    });
  });

  describe('Error Message Display', () => {
    it('should display error message below field when validation fails', async () => {
      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);

      // Trigger validation error
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'ab');
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should clear error message when field becomes valid', async () => {
      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);

      // Trigger error
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'ab');
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument();
      });

      // Fix error
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Valid Title');
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.queryByText(/must be at least 3 characters/i)).not.toBeInTheDocument();
      });
    });

    it('should display character count for title', async () => {
      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      await userEvent.type(titleInput, 'Test Event');

      expect(screen.getByText(/10\/200 characters/i)).toBeInTheDocument();
    });

    it('should display character count for description', async () => {
      render(<EventCreationForm />);

      const descriptionInput = screen.getByLabelText(/Description/i);
      await userEvent.type(descriptionInput, 'Test description');

      expect(screen.getByText(/16\/5000 characters/i)).toBeInTheDocument();
    });
  });

  describe('Tag Management', () => {
    it('should add tags when user enters and clicks Add', async () => {
      render(<EventCreationForm />);

      const tagInput = screen.getByPlaceholderText(/Add a tag/i);
      const addButton = screen.getByRole('button', { name: /Add/i });

      await userEvent.type(tagInput, 'technology');
      await userEvent.click(addButton);

      expect(screen.getByText('technology')).toBeInTheDocument();
    });

    it('should add tags when user presses Enter', async () => {
      render(<EventCreationForm />);

      const tagInput = screen.getByPlaceholderText(/Add a tag/i);

      await userEvent.type(tagInput, 'conference');
      await userEvent.keyboard('{Enter}');

      expect(screen.getByText('conference')).toBeInTheDocument();
    });

    it('should remove tags when user clicks remove button', async () => {
      render(<EventCreationForm />);

      const tagInput = screen.getByPlaceholderText(/Add a tag/i);
      const addButton = screen.getByRole('button', { name: /Add/i });

      await userEvent.type(tagInput, 'test-tag');
      await userEvent.click(addButton);

      expect(screen.getByText('test-tag')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: '×' });
      await userEvent.click(removeButton);

      expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button when form has errors', async () => {
      render(<EventCreationForm />);

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      // Initially disabled because form is empty
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const locationInput = screen.getByLabelText(/Location/i);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.type(titleInput, 'Test Event');
      await userEvent.type(descriptionInput, 'This is a test event description');
      await userEvent.type(startDateInput, tomorrowStr);
      await userEvent.type(endDateInput, dayAfterStr);
      await userEvent.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show loading state while submitting', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({ id: '123' }) }), 100))
      );

      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const locationInput = screen.getByLabelText(/Location/i);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.type(titleInput, 'Test Event');
      await userEvent.type(descriptionInput, 'This is a test event description');
      await userEvent.type(startDateInput, tomorrowStr);
      await userEvent.type(endDateInput, dayAfterStr);
      await userEvent.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Creating Event/i })).toBeInTheDocument();
      });
    });

    it('should display success message on successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123' }),
      });

      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const locationInput = screen.getByLabelText(/Location/i);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.type(titleInput, 'Test Event');
      await userEvent.type(descriptionInput, 'This is a test event description');
      await userEvent.type(startDateInput, tomorrowStr);
      await userEvent.type(endDateInput, dayAfterStr);
      await userEvent.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Event created successfully as draft/i)).toBeInTheDocument();
      });
    });

    it('should display error message on failed submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      render(<EventCreationForm />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const locationInput = screen.getByLabelText(/Location/i);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.type(titleInput, 'Test Event');
      await userEvent.type(descriptionInput, 'This is a test event description');
      await userEvent.type(startDateInput, tomorrowStr);
      await userEvent.type(endDateInput, dayAfterStr);
      await userEvent.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Server error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call router.back when cancel button is clicked', async () => {
      render(<EventCreationForm />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await userEvent.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback with event ID on successful submission', async () => {
      const onSuccess = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'event-123' }),
      });

      render(<EventCreationForm onSuccess={onSuccess} />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const locationInput = screen.getByLabelText(/Location/i);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.type(titleInput, 'Test Event');
      await userEvent.type(descriptionInput, 'This is a test event description');
      await userEvent.type(startDateInput, tomorrowStr);
      await userEvent.type(endDateInput, dayAfterStr);
      await userEvent.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('event-123');
      });
    });

    it('should call onError callback on failed submission', async () => {
      const onError = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      render(<EventCreationForm onError={onError} />);

      const titleInput = screen.getByLabelText(/Event Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const locationInput = screen.getByLabelText(/Location/i);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 16);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().slice(0, 16);

      await userEvent.type(titleInput, 'Test Event');
      await userEvent.type(descriptionInput, 'This is a test event description');
      await userEvent.type(startDateInput, tomorrowStr);
      await userEvent.type(endDateInput, dayAfterStr);
      await userEvent.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /Create Event as Draft/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Server error');
      });
    });
  });
});

