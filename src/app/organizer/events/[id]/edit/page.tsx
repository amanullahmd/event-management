'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import EventEditForm from '@/components/organizer/EventEditForm';
import type { EventResponse } from '@/lib/types/event-update';

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
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError('Authentication required');
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Event not found');
          } else if (response.status === 403) {
            setError('You do not have permission to edit this event');
          } else if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            setError('Failed to load event');
          }
          return;
        }

        const eventData = await response.json();
        setEvent(eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
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
