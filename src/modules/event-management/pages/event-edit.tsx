'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import EventEditForm from '@/modules/event-management/components/EventEditForm';
import type { EventResponse } from '@/modules/event-management/types/event-update';
import { apiRequest } from '@/modules/shared-common/utils/api';

export default function EventEditPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventId = params.id as string;

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!eventId || !isAuthenticated) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await apiRequest<EventResponse>(`/events/${eventId}`);
        setEvent(eventData);
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('404')) {
          setError('Event not found');
        } else if (msg.includes('403')) {
          setError('You do not have permission to edit this event');
        } else if (msg.includes('401')) {
          router.push('/login');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load event');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
          <p>Event not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EventEditForm
        eventId={eventId}
        initialEvent={event}
        onSuccess={() => {
          // Event will redirect automatically
        }}
        onError={(error) => {
          console.error('Event update error:', error);
        }}
      />
    </div>
  );
}
