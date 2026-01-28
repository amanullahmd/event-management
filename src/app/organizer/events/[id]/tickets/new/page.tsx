'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventById } from '@/lib/dummy-data';
import { TicketTypeForm } from '@/components/organizer/TicketTypeForm';

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

  // Get event details
  const event = useMemo(() => {
    return getEventById(eventId);
  }, [eventId]);

  // Handle form submission
  const handleSubmit = async (data: {
    name: string;
    price: number;
    quantity: number;
    type: 'vip' | 'regular' | 'early-bird';
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!event) {
        throw new Error('Event not found');
      }

      // Add ticket type to event
      const newTicketType = {
        id: `ticket-type-${event.id}-${Date.now()}`,
        eventId: event.id,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        sold: 0,
        type: data.type,
      };

      event.ticketTypes.push(newTicketType);

      // Redirect to event details
      router.push(`/organizer/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket type');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Create a new ticket type for <strong>{event.name}</strong>
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
          <li>• Use descriptive names like "VIP Pass" or "General Admission"</li>
          <li>• Set prices that reflect the value of the ticket</li>
          <li>• Limit quantities to control ticket availability</li>
          <li>• Use categories to organize different ticket tiers</li>
          <li>• You can edit or delete ticket types later if needed</li>
        </ul>
      </div>
    </div>
  );
}
