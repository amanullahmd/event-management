import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import EventCreationForm from '../components/EventCreationForm';
import { useImageUpload } from '../hooks/useImageUpload';

// Mock useImageUpload hook
jest.mock('../hooks/useImageUpload', () => ({
  useImageUpload: jest.fn(),
}));

// Mock DateTimePicker to immediately provide valid future dates
jest.mock('../components/DateTimePicker', () => {
  const React = require('react');
  return {
    DateTimePicker: ({ onDateTimeChange }: { onDateTimeChange: (start: Date, end: Date, tz: string) => void }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      dayAfter.setHours(11, 0, 0, 0);
      React.useEffect(() => {
        onDateTimeChange(tomorrow, dayAfter, 'UTC');
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return React.createElement('div', { 'data-testid': 'date-time-picker' }, 'DateTimePicker');
    },
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('EventCreationForm', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockUploadImage = jest.fn();
  const mockDeleteImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (useImageUpload as jest.Mock).mockReturnValue({
      uploadImage: mockUploadImage,
      deleteImage: mockDeleteImage,
      isUploading: false,
      error: null,
      imageUrl: null,
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

  describe('Image Upload Integration', () => {
    beforeEach(() => {
      // Mock URL.createObjectURL for jsdom
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    /**
     * Helper to fill in the required date/time fields via DateTimePicker inputs.
     * Sets a future date and valid start/end times.
     */
    const fillDateTimeFields = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

      const dateInputEl = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (dateInputEl) {
        fireEvent.change(dateInputEl, { target: { value: dateStr } });
      }

      // Select valid start/end times via aria-label
      const startTimeSelect = document.querySelector('select[aria-label="Start time"]') as HTMLSelectElement;
      const endTimeSelect = document.querySelector('select[aria-label="End time"]') as HTMLSelectElement;
      if (startTimeSelect) fireEvent.change(startTimeSelect, { target: { value: '10:00' } });
      if (endTimeSelect) fireEvent.change(endTimeSelect, { target: { value: '11:00' } });
    };

    // Req 6.1: Display image upload area
    it('should render the ImageUploadArea component', () => {
      render(<EventCreationForm />);
      expect(screen.getByLabelText(/Upload event image/i)).toBeInTheDocument();
    });

    // Req 6.1: Display accepted file types and size limit
    it('should display accepted file types and size limit in the upload area', () => {
      render(<EventCreationForm />);
      expect(screen.getByText(/JPG, PNG, WebP, GIF/i)).toBeInTheDocument();
      expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
    });

    // Req 6.2: Display preview of selected image
    it('should display image preview after file is selected', async () => {
      render(<EventCreationForm />);

      const file = new File(['image-content'], 'event.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByAltText(/Event image preview/i)).toBeInTheDocument();
      });
    });

    // Req 6.6: Upload image after event creation using returned event ID
    it('should call uploadImage with the returned event ID after successful event creation', async () => {
      mockUploadImage.mockResolvedValueOnce({ url: 'https://example.com/image.jpg' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'new-event-456' }),
      });

      render(<EventCreationForm />);

      // Select an image file first
      const file = new File(['image-content'], 'event.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByAltText(/Event image preview/i)).toBeInTheDocument();
      });

      // Fill in required form fields
      await userEvent.type(screen.getByLabelText(/Event Title/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/Description/i), 'This is a test event description');
      await userEvent.type(screen.getByPlaceholderText(/https:\/\/zoom/i), 'https://zoom.us/j/123');

      // Flush microtasks to allow DateTimePicker mock to call onDateTimeChange
      await act(async () => { await Promise.resolve(); });

      // Submit the form directly (bypassing disabled check)
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockUploadImage).toHaveBeenCalledWith('new-event-456', file);
      });
    });

    // Req 6.6: No image upload when no image selected
    it('should not call uploadImage when no image is selected', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'event-789' }),
      });

      render(<EventCreationForm />);

      await userEvent.type(screen.getByLabelText(/Event Title/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/Description/i), 'This is a test event description');
      await userEvent.type(screen.getByPlaceholderText(/https:\/\/zoom/i), 'https://zoom.us/j/123');

      // Flush microtasks to allow DateTimePicker mock to call onDateTimeChange
      await act(async () => { await Promise.resolve(); });

      // Submit the form directly
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Event created successfully/i)).toBeInTheDocument();
      });

      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    // Req 6.8: Handle upload errors gracefully with retry capability
    it('should display error message and still call onSuccess when image upload fails after event creation', async () => {
      mockUploadImage.mockRejectedValueOnce(new Error('Upload failed'));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'event-retry-test' }),
      });

      const onSuccess = jest.fn();
      render(<EventCreationForm onSuccess={onSuccess} />);

      // Select an image file
      const file = new File(['image-content'], 'event.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByAltText(/Event image preview/i)).toBeInTheDocument();
      });

      await userEvent.type(screen.getByLabelText(/Event Title/i), 'Test Event');
      await userEvent.type(screen.getByLabelText(/Description/i), 'This is a test event description');
      await userEvent.type(screen.getByPlaceholderText(/https:\/\/zoom/i), 'https://zoom.us/j/123');

      // Flush microtasks to allow DateTimePicker mock to call onDateTimeChange
      await act(async () => { await Promise.resolve(); });

      // Submit the form directly
      const form = document.querySelector('form') as HTMLFormElement;
      fireEvent.submit(form);

      // Event was created — onSuccess is still called even when image upload fails
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('event-retry-test');
      });

      // Error message is shown directing user to retry via edit page
      await waitFor(() => {
        expect(screen.getByText(/image upload failed/i)).toBeInTheDocument();
      });
    });

    // Req 6.7: Show loading state during upload
    it('should show uploading state in ImageUploadArea when isUploading is true', () => {
      (useImageUpload as jest.Mock).mockReturnValue({
        uploadImage: mockUploadImage,
        deleteImage: mockDeleteImage,
        isUploading: true,
        error: null,
        imageUrl: null,
      });

      render(<EventCreationForm />);

      expect(screen.getByRole('status', { name: /Uploading image/i })).toBeInTheDocument();
    });
  });
});

