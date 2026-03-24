'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DateTimePicker } from './DateTimePicker';
import { TimezoneSelector } from './TimezoneSelector';
import { EventTypeSelector, type EventType } from './EventTypeSelector';
import { CategorySelector } from './CategorySelector';
import { ImageUploadArea } from './ImageUploadArea';
import { useImageUpload } from '../hooks/useImageUpload';
import { useToast } from '@/modules/shared-common/components/shared/ToastContainer';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  categoryId?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface EventSetupWizardProps {
  onSuccess?: (eventId: string) => void;
  onError?: (error: string) => void;
}

const EVENT_TYPES = ['ONLINE', 'IN_PERSON', 'HYBRID'];

const STEPS = [
  { id: 'basics', title: 'Basic Info', description: 'Name and describe your event' },
  { id: 'details', title: 'Event Details', description: 'Type, category, and image' },
  { id: 'schedule', title: 'Date & Location', description: 'When and where it happens' },
  { id: 'extras', title: 'Additional Info', description: 'Capacity, tags, and notes' },
  { id: 'review', title: 'Review & Create', description: 'Check everything and publish' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const EventSetupWizard: React.FC<EventSetupWizardProps> = ({ onSuccess, onError }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
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
    categoryId: undefined,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { uploadImage, isUploading, error: imageUploadError } = useImageUpload();

  // ─── Validation ──────────────────────────────────────────────────────────

  const validateTitle = (title: string): string | null => {
    if (!title || title.trim().length === 0) return 'Title is required';
    if (title.length < 3) return 'Title must be at least 3 characters';
    if (title.length > 200) return 'Title must not exceed 200 characters';
    return null;
  };

  const validateDescription = (description: string): string | null => {
    if (!description || description.trim().length === 0) return 'Description is required';
    if (description.length < 10) return 'Description must be at least 10 characters';
    if (description.length > 5000) return 'Description must not exceed 5000 characters';
    return null;
  };

  const validateEventType = (eventType: string): string | null => {
    if (!eventType || !EVENT_TYPES.includes(eventType)) return 'Event type is required';
    return null;
  };

  const validateOnlineLink = (link: string, eventType: EventType): string | null => {
    if (eventType === 'ONLINE' || eventType === 'HYBRID') {
      if (!link || link.trim().length === 0) return 'Online link is required for online/hybrid events';
      try { new URL(link); } catch { return 'Must be a valid URL'; }
    }
    return null;
  };

  const validateLocation = (location: string, eventType: EventType): string | null => {
    if (eventType === 'IN_PERSON' || eventType === 'HYBRID') {
      if (!location || location.trim().length === 0) return 'Location is required for in-person/hybrid events';
      if (location.length < 3) return 'Location must be at least 3 characters';
      if (location.length > 500) return 'Location must not exceed 500 characters';
    }
    return null;
  };

  const validateCapacity = (capacity?: number): string | null => {
    if (capacity !== undefined && capacity !== null) {
      if (!Number.isInteger(capacity) || capacity <= 0) return 'Capacity must be a positive integer';
    }
    return null;
  };

  const validateDates = (startDate: string, endDate: string): { start: string | null; end: string | null } => {
    const errors = { start: null as string | null, end: null as string | null };
    if (!startDate) { errors.start = 'Start date is required'; }
    else { const s = new Date(startDate); if (s < new Date()) errors.start = 'Start date must be in the future'; }
    if (!endDate) { errors.end = 'End date is required'; }
    else { const e = new Date(endDate); if (e < new Date()) errors.end = 'End date must be in the future'; }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.start = 'Start date must be before end date';
    }
    return errors;
  };

  // ─── Step Validation ──────────────────────────────────────────────────────

  const validateStep = useCallback((step: number): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    switch (step) {
      case 0: { // Basics
        const t = validateTitle(formData.title);
        if (t) newErrors.title = t;
        const d = validateDescription(formData.description);
        if (d) newErrors.description = d;
        break;
      }
      case 1: { // Details
        const et = validateEventType(formData.eventType);
        if (et) newErrors.eventType = et;
        break;
      }
      case 2: { // Schedule
        const ol = validateOnlineLink(formData.onlineLink || '', formData.eventType);
        if (ol) newErrors.onlineLink = ol;
        const loc = validateLocation(formData.location || '', formData.eventType);
        if (loc) newErrors.location = loc;
        const dates = validateDates(formData.startDate, formData.endDate);
        if (dates.start) newErrors.startDate = dates.start;
        if (dates.end) newErrors.endDate = dates.end;
        break;
      }
      case 3: { // Extras
        const cap = validateCapacity(formData.capacity);
        if (cap) newErrors.capacity = cap;
        break;
      }
    }
    return newErrors;
  }, [formData]);

  const isStepValid = useCallback((step: number): boolean => {
    return Object.keys(validateStep(step)).length === 0;
  }, [validateStep]);

  // ─── Readiness Checklist ──────────────────────────────────────────────────

  const readinessChecklist = useMemo(() => {
    const items = [
      { label: 'Event title', done: !validateTitle(formData.title), required: true },
      { label: 'Event description', done: !validateDescription(formData.description), required: true },
      { label: 'Event type selected', done: !validateEventType(formData.eventType), required: true },
      { label: 'Start & end date set', done: !validateDates(formData.startDate, formData.endDate).start && !validateDates(formData.startDate, formData.endDate).end, required: true },
      { label: 'Category selected', done: !!formData.categoryId, required: false },
      { label: 'Event image uploaded', done: !!selectedImage, required: false },
      { label: 'Capacity set', done: formData.capacity !== undefined && formData.capacity > 0, required: false },
      { label: 'Tags added', done: (formData.tags?.length || 0) > 0, required: false },
    ];

    // Conditional items
    if (formData.eventType === 'ONLINE' || formData.eventType === 'HYBRID') {
      items.splice(4, 0, { label: 'Online link provided', done: !validateOnlineLink(formData.onlineLink || '', formData.eventType), required: true });
    }
    if (formData.eventType === 'IN_PERSON' || formData.eventType === 'HYBRID') {
      items.splice(formData.eventType === 'HYBRID' ? 5 : 4, 0, { label: 'Location provided', done: !validateLocation(formData.location || '', formData.eventType), required: true });
    }

    return items;
  }, [formData, selectedImage]);

  const allRequiredDone = readinessChecklist.filter(i => i.required).every(i => i.done);
  const completionPercentage = Math.round((readinessChecklist.filter(i => i.done).length / readinessChecklist.length) * 100);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleDateTimeChange = useCallback((startDate: Date, endDate: Date, timezone: string) => {
    setFormData(prev => ({
      ...prev,
      startDate: startDate.toISOString().slice(0, 16),
      endDate: endDate.toISOString().slice(0, 16),
      timezone,
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.startDate;
      delete newErrors.endDate;
      return newErrors;
    });
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  }, [tagInput]);

  const handleRemoveTag = useCallback((index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== index) || [] }));
  }, []);

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleGoToStep = (step: number) => {
    // Allow going to any step that's at or below the current step, or if all previous steps are valid
    if (step <= currentStep) {
      setErrors({});
      setCurrentStep(step);
      return;
    }
    // Check all steps before the target
    for (let i = 0; i < step; i++) {
      if (!isStepValid(i)) {
        addToast(`Please complete Step ${i + 1} first`, 'error', 3000);
        return;
      }
    }
    setErrors({});
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (!allRequiredDone) {
      addToast('Please complete all required fields before creating the event', 'error', 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/events`, {
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

      // Upload image if selected
      if (selectedImage) {
        try {
          await uploadImage(data.id, selectedImage);
        } catch {
          addToast('Event created but image upload failed. You can upload it from the edit page.', 'warning', 5000);
        }
      }

      addToast('Event created successfully as draft!', 'success', 4000);
      onSuccess?.(data.id);

      setTimeout(() => {
        router.push(`/organizer/events/${data.id}`);
      }, 1500);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create event';
      addToast(msg, 'error', 5000);
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step Renderers ──────────────────────────────────────────────────────

  const renderBasicsStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Give your event a catchy, descriptive title"
          className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
            errors.title ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {errors.title && <p className="mt-1.5 text-sm text-red-500">{errors.title}</p>}
        <p className="mt-1 text-xs text-slate-400">{formData.title.length}/200 characters</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Tell attendees what to expect from your event. Include key highlights, speakers, topics, etc."
          rows={6}
          className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
            errors.description ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {errors.description && <p className="mt-1.5 text-sm text-red-500">{errors.description}</p>}
        <p className="mt-1 text-xs text-slate-400">{formData.description.length}/5000 characters</p>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <EventTypeSelector
          value={formData.eventType}
          onChange={(type) => handleFieldChange('eventType', type)}
        />
        {errors.eventType && <p className="mt-2 text-sm text-red-500">{errors.eventType}</p>}
      </div>

      <CategorySelector
        value={formData.categoryId}
        onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId: categoryId || undefined }))}
      />

      <ImageUploadArea
        onImageSelected={(file) => setSelectedImage(file)}
        onImageRemoved={() => setSelectedImage(null)}
        isUploading={isUploading}
        error={errors.imageUpload || imageUploadError || undefined}
      />
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      {/* Online Link */}
      {(formData.eventType === 'ONLINE' || formData.eventType === 'HYBRID') && (
        <div>
          <label htmlFor="onlineLink" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Online Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="onlineLink"
            value={formData.onlineLink || ''}
            onChange={(e) => handleFieldChange('onlineLink', e.target.value)}
            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
              errors.onlineLink ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          {errors.onlineLink && <p className="mt-1.5 text-sm text-red-500">{errors.onlineLink}</p>}
        </div>
      )}

      {/* Date & Time */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Event Date & Time <span className="text-red-500">*</span>
        </label>
        <DateTimePicker
          startDate={formData.startDate ? new Date(formData.startDate) : undefined}
          endDate={formData.endDate ? new Date(formData.endDate) : undefined}
          timezone={formData.timezone}
          onDateTimeChange={handleDateTimeChange}
          onError={(error) => setErrors(prev => ({ ...prev, dateTime: error }))}
          timeInterval={15}
        />
        {errors.startDate && <p className="mt-1.5 text-sm text-red-500">{errors.startDate}</p>}
        {errors.endDate && <p className="mt-1.5 text-sm text-red-500">{errors.endDate}</p>}
      </div>

      {/* Location */}
      {(formData.eventType === 'IN_PERSON' || formData.eventType === 'HYBRID') && (
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Venue / Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            value={formData.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="Enter venue name and address"
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
              errors.location ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          {errors.location && <p className="mt-1.5 text-sm text-red-500">{errors.location}</p>}
        </div>
      )}
    </div>
  );

  const renderExtrasStep = () => (
    <div className="space-y-6">
      {/* Capacity */}
      <div>
        <label htmlFor="capacity" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Capacity <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="number"
          id="capacity"
          value={formData.capacity || ''}
          onChange={(e) => handleFieldChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Maximum number of attendees"
          min="1"
          className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${
            errors.capacity ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {errors.capacity && <p className="mt-1.5 text-sm text-red-500">{errors.capacity}</p>}
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tagInput" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Tags <span className="text-xs font-normal text-slate-400">(optional - helps with discoverability)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            placeholder="Add a tag and press Enter"
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Add
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(index)} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 font-bold text-base leading-none">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Additional Notes <span className="text-xs font-normal text-slate-400">(optional - internal notes)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Any internal notes or reminders for this event..."
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
        />
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const eventTypeLabel = { ONLINE: 'Online', IN_PERSON: 'In-Person', HYBRID: 'Hybrid' }[formData.eventType];
    return (
      <div className="space-y-6">
        {/* Readiness Checklist */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish Readiness</h3>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completionPercentage === 100 ? 'bg-green-500' : completionPercentage >= 60 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className={`text-sm font-semibold ${completionPercentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                {completionPercentage}%
              </span>
            </div>
          </div>
          <ul className="space-y-2.5">
            {readinessChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.done
                    ? 'bg-green-500 text-white'
                    : item.required
                    ? 'bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700'
                    : 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600'
                }`}>
                  {item.done && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${item.done ? 'text-slate-700 dark:text-slate-300' : item.required ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.label}
                  {item.required && !item.done && <span className="ml-1 text-xs">(required)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Event Summary */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Event Summary</h3>
          <dl className="space-y-3">
            <SummaryRow label="Title" value={formData.title || '—'} />
            <SummaryRow label="Description" value={formData.description ? (formData.description.length > 120 ? formData.description.slice(0, 120) + '...' : formData.description) : '—'} />
            <SummaryRow label="Event Type" value={eventTypeLabel} />
            {formData.startDate && <SummaryRow label="Start" value={new Date(formData.startDate).toLocaleString()} />}
            {formData.endDate && <SummaryRow label="End" value={new Date(formData.endDate).toLocaleString()} />}
            {formData.location && <SummaryRow label="Location" value={formData.location} />}
            {formData.onlineLink && <SummaryRow label="Online Link" value={formData.onlineLink} />}
            {formData.capacity && <SummaryRow label="Capacity" value={String(formData.capacity)} />}
            {formData.tags && formData.tags.length > 0 && <SummaryRow label="Tags" value={formData.tags.join(', ')} />}
            <SummaryRow label="Image" value={selectedImage ? selectedImage.name : 'None'} />
          </dl>
        </div>

        {/* Status Notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Saved as Draft</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              Your event will be saved as a draft and won't be visible to the public until you publish it from the event management page.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const stepRenderers = [renderBasicsStep, renderDetailsStep, renderScheduleStep, renderExtrasStep, renderReviewStep];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New Event</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Follow the steps below to set up your event</p>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep && isStepValid(index);
            const isPast = index < currentStep;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => handleGoToStep(index)}
                  className={`flex flex-col items-center group relative ${isPast || isActive ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : isPast
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium hidden sm:block ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${
                    index < currentStep ? 'bg-green-400 dark:bg-green-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {STEPS[currentStep].description}
          </p>
        </div>

        {stepRenderers[currentStep]()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={currentStep === 0 ? () => router.back() : handleBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>

        <div className="flex gap-3">
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !allRequiredDone}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create Event as Draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <dt className="w-28 flex-shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-900 dark:text-slate-200 break-words">{value}</dd>
    </div>
  );
}

export default EventSetupWizard;
