'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateEvent } from '@/modules/shared-common/utils/api';
import type { UpdateEventRequest, EventResponse, ApiErrorResponse } from '@/modules/event-management/types/event-update';
import { isConflictError, isValidationError, isAuthorizationError, isNotFoundError } from '@/modules/event-management/types/event-update';
import { EventTypeSelector, type EventType } from './EventTypeSelector';

interface ValidationErrors {
  [key: string]: string;
}

interface EventEditFormProps {
  eventId: string;
  initialEvent: EventResponse;
  onSuccess?: (event: EventResponse) => void;
  onError?: (error: string) => void;
}

const EVENT_TYPES = ['conference', 'workshop', 'meetup', 'webinar', 'seminar', 'training'];

export const EventEditForm: React.FC<EventEditFormProps> = ({ 
  eventId, 
  initialEvent, 
  onSuccess, 
  onError 
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<UpdateEventRequest>({
    title: initialEvent.title,
    description: initialEvent.description,
    eventType: initialEvent.eventType,
    startDate: initialEvent.startDate,
    endDate: initialEvent.endDate,
    location: initialEvent.location,
    onlineLink: initialEvent.onlineLink,
    capacity: initialEvent.capacity,
    tags: initialEvent.tags || [],
    notes: initialEvent.notes,
    updatedAt: initialEvent.updatedAt,
  });

  const [originalEvent] = useState<EventResponse>(initialEvent);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [conflictError, setConflictError] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Validation functions
  const validateTitle = (title: string): string | null => {
    if (title && title.trim().length > 0) {
      if (title.length < 3) {
        return 'Title must be at least 3 characters';
      }
      if (title.length > 200) {
        return 'Title must not exceed 200 characters';
      }
    }
    return null;
  };

  const validateDescription = (description: string): string | null => {
    if (description && description.trim().length > 0) {
      if (description.length < 10) {
        return 'Description must be at least 10 characters';
      }
      if (description.length > 5000) {
        return 'Description must not exceed 5000 characters';
      }
    }
    return null;
  };

  const validateEventType = (eventType: string): string | null => {
    if (eventType && eventType.trim().length > 0) {
      if (!EVENT_TYPES.includes(eventType)) {
        return 'Invalid event type';
      }
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

  const validateLocationField = (location: string, eventType: EventType): string | null => {
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

  const validateLocation = (location: string): string | null => {
    if (location && location.trim().length > 0) {
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

  const validateDates = (startDate: string | Date, endDate: string | Date): { start: string | null; end: string | null } => {
    const errors = { start: null as string | null, end: null as string | null };

    if (startDate) {
      const start = new Date(startDate);
      const now = new Date();
      if (start < now) {
        errors.start = 'Start date must be in the future or present';
      }
    }

    if (endDate) {
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
    
    // Track changed fields
    const newChangedFields = new Set(changedFields);
    if (value !== (originalEvent as any)[field]) {
      newChangedFields.add(field);
    } else {
      newChangedFields.delete(field);
    }
    setChangedFields(newChangedFields);
    setIsDirty(newChangedFields.size > 0);

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
        error = validateLocationField(value, formData.eventType as EventType);
        break;
      case 'onlineLink':
        error = validateOnlineLink(value, formData.eventType as EventType);
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
  }, [changedFields, originalEvent, formData.eventType]);

  const handleDateChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track changed fields
    const newChangedFields = new Set(changedFields);
    if (value !== (originalEvent as any)[field]) {
      newChangedFields.add(field);
    } else {
      newChangedFields.delete(field);
    }
    setChangedFields(newChangedFields);
    setIsDirty(newChangedFields.size > 0);

    // Validate dates
    const dateErrors = validateDates(
      field === 'startDate' ? value : (formData.startDate || ''),
      field === 'endDate' ? value : (formData.endDate || '')
    );

    if (dateErrors.start) {
      setErrors(prev => ({ ...prev, startDate: dateErrors.start! }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        return newErrors;
      });
    }

    if (dateErrors.end) {
      setErrors(prev => ({ ...prev, endDate: dateErrors.end! }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.endDate;
        return newErrors;
      });
    }
  }, [formData.startDate, formData.endDate, changedFields, originalEvent]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      const newTags = [...(formData.tags || []), tagInput.trim()];
      setFormData(prev => ({
        ...prev,
        tags: newTags,
      }));
      
      // Track changed fields
      const newChangedFields = new Set(changedFields);
      newChangedFields.add('tags');
      setChangedFields(newChangedFields);
      setIsDirty(true);
      
      setTagInput('');
    }
  }, [tagInput, formData.tags, changedFields]);

  const handleRemoveTag = useCallback((index: number) => {
    const newTags = formData.tags?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({
      ...prev,
      tags: newTags,
    }));
    
    // Track changed fields
    const newChangedFields = new Set(changedFields);
    newChangedFields.add('tags');
    setChangedFields(newChangedFields);
    setIsDirty(true);
  }, [formData.tags, changedFields]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (formData.title !== undefined && formData.title !== null) {
      const titleError = validateTitle(formData.title);
      if (titleError) newErrors.title = titleError;
    }

    if (formData.description !== undefined && formData.description !== null) {
      const descriptionError = validateDescription(formData.description);
      if (descriptionError) newErrors.description = descriptionError;
    }

    if (formData.eventType !== undefined && formData.eventType !== null) {
      const eventTypeError = validateEventType(formData.eventType);
      if (eventTypeError) newErrors.eventType = eventTypeError;
    }

    if (formData.onlineLink !== undefined && formData.onlineLink !== null) {
      const onlineLinkError = validateOnlineLink(formData.onlineLink, formData.eventType as EventType);
      if (onlineLinkError) newErrors.onlineLink = onlineLinkError;
    }

    if (formData.location !== undefined && formData.location !== null) {
      const locationError = validateLocationField(formData.location, formData.eventType as EventType);
      if (locationError) newErrors.location = locationError;
    }

    if (formData.capacity !== undefined && formData.capacity !== null) {
      const capacityError = validateCapacity(formData.capacity);
      if (capacityError) newErrors.capacity = capacityError;
    }

    if (formData.startDate || formData.endDate) {
      const dateErrors = validateDates(formData.startDate || '', formData.endDate || '');
      if (dateErrors.start) newErrors.startDate = dateErrors.start;
      if (dateErrors.end) newErrors.endDate = dateErrors.end;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (changedFields.size === 0) {
      setErrors({ submit: 'No changes to save' });
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setConflictError(null);

    try {
      // Build update request with only changed fields
      const updateData: UpdateEventRequest = {};
      changedFields.forEach(field => {
        (updateData as any)[field] = (formData as any)[field];
      });
      updateData.updatedAt = formData.updatedAt;

      const updatedEvent = await updateEvent(eventId, updateData);
      
      setSuccessMessage('Event updated successfully!');
      setFormData(updatedEvent);
      setChangedFields(new Set());
      setIsDirty(false);
      
      if (onSuccess) {
        onSuccess(updatedEvent);
      }

      // Redirect to event details page after a short delay
      setTimeout(() => {
        router.push(`/organizer/events/${eventId}`);
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes('409')) {
        setConflictError({
          message: 'Event was modified by another user. Please refresh and try again.',
          action: 'refresh'
        });
      } else if (error instanceof Error && error.message.includes('403')) {
        setErrors({ submit: 'You do not have permission to update this event' });
      } else if (error instanceof Error && error.message.includes('401')) {
        setErrors({ submit: 'Authentication required. Please log in again.' });
      } else if (error instanceof Error && error.message.includes('404')) {
        setErrors({ submit: 'Event not found' });
      } else {
        setErrors({ submit: errorMessage });
      }
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshAndRetry = async () => {
    try {
      // Reload event data from API
      const response = await fetch(`/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const refreshedEvent = await response.json();
        setFormData(refreshedEvent);
        setChangedFields(new Set());
        setIsDirty(false);
        setConflictError(null);
        setSuccessMessage('Event refreshed. You can now retry your changes.');
      }
    } catch (error) {
      setErrors({ submit: 'Failed to refresh event data' });
    }
  };

  // Warn before navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-2">
          Update your event details. Only changed fields will be saved.
        </p>
        {isDirty && (
          <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
            Unsaved Changes
          </div>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      {conflictError && (
        <div className="mb-4 p-4 bg-orange-100 text-orange-800 rounded-lg">
          <p className="font-semibold">{conflictError.message}</p>
          <button
            type="button"
            onClick={handleRefreshAndRetry}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Refresh and Retry
          </button>
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
            Event Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Enter event title"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } ${changedFields.has('title') ? 'bg-blue-50' : ''}`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          <p className="mt-1 text-xs text-gray-500">{(formData.title || '').length}/200 characters</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter event description"
            rows={5}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } ${changedFields.has('description') ? 'bg-blue-50' : ''}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          <p className="mt-1 text-xs text-gray-500">{(formData.description || '').length}/5000 characters</p>
        </div>

        {/* Event Type */}
        <div>
          <EventTypeSelector
            value={formData.eventType as EventType}
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
              } ${changedFields.has('onlineLink') ? 'bg-blue-50' : ''}`}
            />
            {errors.onlineLink && <p className="mt-1 text-sm text-red-600">{errors.onlineLink}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter the URL for joining the online event</p>
          </div>
        )}

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={formatDateForInput(formData.startDate)}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            } ${changedFields.has('startDate') ? 'bg-blue-50' : ''}`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={formatDateForInput(formData.endDate)}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            } ${changedFields.has('endDate') ? 'bg-blue-50' : ''}`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>

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
              } ${changedFields.has('location') ? 'bg-blue-50' : ''}`}
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
            } ${changedFields.has('capacity') ? 'bg-blue-50' : ''}`}
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
            <div className={`mt-2 flex flex-wrap gap-2 ${changedFields.has('tags') ? 'bg-blue-50 p-2 rounded' : ''}`}>
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
            value={formData.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Add any additional notes"
            rows={3}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              changedFields.has('notes') ? 'bg-blue-50' : ''
            }`}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0 || changedFields.size === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                  router.back();
                }
              } else {
                router.back();
              }
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventEditForm;

