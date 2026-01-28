'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { createEvent } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

/**
 * Event Creation Form Page
 * Allows organizers to create new events
 */
export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    category: 'Technology',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const eventDate = new Date(formData.date);
      if (eventDate < new Date()) {
        newErrors.date = 'Event date must be in the future';
      }
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      // Create event in dummy data
      const newEvent = createEvent({
        name: formData.name,
        description: formData.description,
        date: new Date(formData.date),
        location: formData.location,
        category: formData.category,
        organizerId: user.id,
        image: '',
        status: 'active' as const,
        ticketTypes: [],
        totalAttendees: 0,
      });

      // Redirect to event details
      router.push(`/organizer/events/${newEvent.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const categories = [
    'Technology',
    'Music',
    'Sports',
    'Business',
    'Education',
    'Entertainment',
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Create New Event
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Fill in the details below to create a new event
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {errors.submit && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400 font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Event Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Event Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter event name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          {errors.description && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Event Date *
            </label>
            <Input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Location *
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
          <Link href="/organizer/events" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
          Event Creation Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Use a clear, descriptive event name</li>
          <li>• Provide detailed information about your event</li>
          <li>• Choose a date in the future</li>
          <li>• Specify the exact location or venue</li>
          <li>• You can add ticket types after creating the event</li>
        </ul>
      </div>
    </div>
  );
}
