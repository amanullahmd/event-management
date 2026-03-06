'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DateTimePicker } from './DateTimePicker';
import { TimezoneSelector } from './TimezoneSelector';
import { EventTypeSelector, type EventType } from './EventTypeSelector';

interface CreateEventRequest {
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  timezone: string;
  location?: string;
  onlineLink?: string;
  capacity?: number;
  tags?: string[];
  notes?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface EventCreationFormProps {
  onSuccess?: (eventId: string) => void;
  onError?: (error: string) => void;
}

const EVENT_TYPES = ['conference', 'workshop', 'meetup', 'webinar', 'seminar', 'training'];

export const EventCreationForm: React.FC<EventCreationFormProps> = ({ onSuccess, onError }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    eventType: 'ONLINE',
    startDate: '',
    endDate: '',
    timezone: 'UTC',
    location: '',
    onlineLink: '',
    capacity: undefined,
    tags: [],
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Validation functions
  const validateTitle = (title: string): string | null => {
    if (!title || title.trim().length === 0) {
      return 'Title is required';
    }
    if (title.length < 3) {
      return 'Title must be at least 3 characters';
    }
    if (title.length > 200) {
      return 'Title must not exceed 200 characters';
    }
    return null;
  };

  const validateDescription = (description: string): string | null => {
    if (!description || description.trim().length === 0) {
      return 'Description is required';
    }
    if (description.length < 10) {
      return 'Description must be at least 10 characters';
    }
    if (description.length > 5000) {
      return 'Description must not exceed 5000 characters';
    }
    return null;
  };

  const validateEventType = (eventType: string): string | null => {
    if (!eventType || eventType.trim().length === 0) {
      return 'Event type is required';
    }
    if (!EVENT_TYPES.includes(eventType)) {
      return 'Invalid event type';
    }
    return null;
  };

  const validateOnlineLink = (link: string, eventType: EventType): string | null => {
    if (eventType === 'ONLINE' || eventType === 'HYBRID') {
      if (!link || link.trim().length === 0) {
        return 'Online link is required for online and hybrid events';
      }
      // Basic URL validation
      try {
        new URL(link);
      } catch {
        return 'Online link must be a valid URL';
      }
    }
    return null;
  };

  const validateLocation = (location: string, eventType: EventType): string | null => {
    if (eventType === 'IN_PERSON' || eventType === 'HYBRID') {
      if (!location || location.trim().length === 0) {
        return 'Location is required for in-person and hybrid events';
      }
      if (location.length < 3) {
        return 'Location must be at least 3 characters';
      }
      if (location.length > 500) {
        return 'Location must not exceed 500 characters';
      }
    }
    return null;
  };

  const validateCapacity = (capacity?: number): string | null => {
    if (capacity !== undefined && capacity !== null) {
      if (!Number.isInteger(capacity) || capacity <= 0) {
        return 'Capacity must be a positive integer';
      }
    }
    return null;
  };

  const validateDates = (startDate: string, endDate: string): { start: string | null; end: string | null } => {
    const errors = { start: null as string | null, end: null as string | null };

    if (!startDate) {
      errors.start = 'Start date is required';
    } else {
      const start = new Date(startDate);
      const now = new Date();
      if (start < now) {
        errors.start = 'Start date must be in the future or present';
      }
    }

    if (!endDate) {
      errors.end = 'End date is required';
    } else {
      const end = new Date(endDate);
      const now = new Date();
      if (end < now) {
        errors.end = 'End date must be in the future or present';
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        errors.start = 'Start date must be before end date';
      }
    }

    return errors;
  };

  // Real-time validation
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate field
    let error: string | null = null;
    switch (field) {
      case 'title':
        error = validateTitle(value);
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'eventType':
        error = validateEventType(value);
        break;
      case 'location':
        error = validateLocation(value, formData.eventType);
        break;
      case 'onlineLink':
        error = validateOnlineLink(value, formData.eventType);
        break;
      case 'capacity':
        error = validateCapacity(value);
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formData.eventType]);

  const handleDateTimeChange = useCallback((startDate: Date, endDate: Date, timezone: string) => {
    // Convert dates to ISO string format for API
    const startDateStr = startDate.toISOString().slice(0, 16);
    const endDateStr = endDate.toISOString().slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      startDate: startDateStr,
      endDate: endDateStr,
      timezone: timezone,
    }));

    // Clear date errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.startDate;
      delete newErrors.endDate;
      return newErrors;
    });
  }, []);

  const handleTimezoneChange = useCallback((timezone: string) => {
    setFormData(prev => ({ ...prev, timezone }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  }, [tagInput]);

  const handleRemoveTag = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const titleError = validateTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    const eventTypeError = validateEventType(formData.eventType);
    if (eventTypeError) newErrors.eventType = eventTypeError;

    const onlineLinkError = validateOnlineLink(formData.onlineLink || '', formData.eventType);
    if (onlineLinkError) newErrors.onlineLink = onlineLinkError;

    const locationError = validateLocation(formData.location || '', formData.eventType);
    if (locationError) newErrors.location = locationError;

    const capacityError = validateCapacity(formData.capacity);
    if (capacityError) newErrors.capacity = capacityError;

    const dateErrors = validateDates(formData.startDate, formData.endDate);
    if (dateErrors.start) newErrors.startDate = dateErrors.start;
    if (dateErrors.end) newErrors.endDate = dateErrors.end;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const data = await response.json();
      setSuccessMessage('Event created successfully as draft!');
      
      if (onSuccess) {
        onSuccess(data.id);
      }

      // Redirect to event details page after a short delay
      setTimeout(() => {
        router.push(`/organizer/events/${data.id}`);
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      setErrors({ submit: errorMessage });
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
          Draft Status
        </div>
        <p className="text-gray-600 mt-2">
          Your event will be saved as a draft and won't be visible to the public until you publish it.
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Enter event title"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          <p className="mt-1 text-xs text-gray-500">{formData.title.length}/200 characters</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter event description"
            rows={5}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          <p className="mt-1 text-xs text-gray-500">{formData.description.length}/5000 characters</p>
        </div>

        {/* Event Type */}
        <div>
          <EventTypeSelector
            value={formData.eventType}
            onChange={(type) => handleFieldChange('eventType', type)}
          />
          {errors.eventType && <p className="mt-2 text-sm text-red-600">{errors.eventType}</p>}
        </div>

        {/* Online Link - Show for ONLINE and HYBRID */}
        {(formData.eventType === 'ONLINE' || formData.eventType === 'HYBRID') && (
          <div>
            <label htmlFor="onlineLink" className="block text-sm font-medium text-gray-700">
              Online Link {(formData.eventType === 'ONLINE' || formData.eventType === 'HYBRID') ? '*' : ''}
            </label>
            <input
              type="url"
              id="onlineLink"
              value={formData.onlineLink || ''}
              onChange={(e) => handleFieldChange('onlineLink', e.target.value)}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.onlineLink ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.onlineLink && <p className="mt-1 text-sm text-red-600">{errors.onlineLink}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter the URL for joining the online event</p>
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date & Time *
          </label>
          <DateTimePicker
            startDate={formData.startDate ? new Date(formData.startDate) : undefined}
            endDate={formData.endDate ? new Date(formData.endDate) : undefined}
            timezone={formData.timezone}
            onDateTimeChange={handleDateTimeChange}
            onError={(error) => setErrors(prev => ({ ...prev, dateTime: error }))}
            timeInterval={15}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>

        {/* End Date */}

        {/* Location - Show for IN_PERSON and HYBRID */}
        {(formData.eventType === 'IN_PERSON' || formData.eventType === 'HYBRID') && (
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location {(formData.eventType === 'IN_PERSON' || formData.eventType === 'HYBRID') ? '*' : ''}
            </label>
            <input
              type="text"
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="Enter event location or venue address"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            <p className="mt-1 text-xs text-gray-500">Minimum 3 characters required</p>
          </div>
        )}

        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity (Optional)
          </label>
          <input
            type="number"
            id="capacity"
            value={formData.capacity || ''}
            onChange={(e) => handleFieldChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Enter maximum number of attendees"
            min="1"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.capacity ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700">
            Tags (Optional)
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Add any additional notes"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Creating Event...' : 'Create Event as Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreationForm;

