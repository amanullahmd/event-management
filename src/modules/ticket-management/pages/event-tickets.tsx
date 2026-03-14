'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventById, createTicketType, type Event } from '@/modules/shared-common/services/apiService';
import { TicketTypeForm } from '@/modules/ticket-management/components/TicketTypeForm';

/**
 * Create Ticket Type Page
 * Allows organizers to create new ticket types for an event
 */
export default function CreateTicketTypePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        setEvent(eventData || null);
      } catch (error) {
        console.error('Failed to fetch event:', error);
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Handle form submission
  const handleSubmit = async (data: {
    name: string;
    category: string;
    price: number;
    quantityLimit: number;
    saleStartDate: string;
    saleEndDate: string;
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!event) {
        throw new Error('Event not found');
      }

      // POST ticket type to backend
      await createTicketType(eventId, {
        name: data.name,
        category: data.category,
        price: data.price,
        quantityLimit: data.quantityLimit,
        saleStartDate: data.saleStartDate || undefined,
        saleEndDate: data.saleEndDate || undefined,
      });

      // Redirect to event details
      router.push(`/organizer/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket type');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Add Ticket Type
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Create a new ticket type for <strong>{event.title || event.name}</strong>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-800">
        <TicketTypeForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isSubmitting}
        />
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
          Ticket Type Tips
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Use descriptive names like &quot;VIP Pass&quot; or &quot;General Admission&quot;</li>
          <li>• Set prices that reflect the value of the ticket</li>
          <li>• Limit quantities to control ticket availability</li>
          <li>• Use categories to organize different ticket tiers</li>
          <li>• You can edit or delete ticket types later if needed</li>
        </ul>
      </div>
    </div>
  );
}
