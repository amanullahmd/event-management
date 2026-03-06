'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/shared/EventCard';
import { Loader2, AlertCircle } from 'lucide-react';

interface RecommendedEvent {
  eventId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  recommendationScore: number;
  attendeeCount: number;
  imageUrl?: string;
}

interface PersonalizedFeedComponentProps {
  onEventClick?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
}

export const PersonalizedFeedComponent: React.FC<PersonalizedFeedComponentProps> = ({
  onEventClick,
  onRegister,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<RecommendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const lastRefreshTime = useRef<number>(Date.now());

  const BATCH_SIZE = 10;
  const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  const fetchRecommendations = useCallback(
    async (pageOffset: number = 0) => {
      if (!user?.id) return;

      try {
        const isInitialLoad = pageOffset === 0;
        if (isInitialLoad) setLoading(true);
        else setIsLoadingMore(true);

        const response = await fetch(
          `/api/recommendations?limit=${BATCH_SIZE}&offset=${pageOffset}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        const newEvents = data.events || [];

        if (isInitialLoad) {
          setEvents(newEvents);
        } else {
          setEvents((prev) => [...prev, ...newEvents]);
        }

        setHasMore(newEvents.length === BATCH_SIZE);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (pageOffset === 0) setLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [user?.id]
  );

  // Initial load
  useEffect(() => {
    fetchRecommendations(0);
    lastRefreshTime.current = Date.now();
  }, [fetchRecommendations]);

  // Auto-refresh every 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRefreshTime.current >= REFRESH_INTERVAL) {
        fetchRecommendations(0);
        lastRefreshTime.current = now;
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [fetchRecommendations]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          setOffset((prev) => prev + BATCH_SIZE);
          fetchRecommendations(offset + BATCH_SIZE);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading, offset, fetchRecommendations]);

  const handleEventClick = (eventId: string) => {
    // Track view interaction
    trackInteraction(eventId, 'VIEW');
    onEventClick?.(eventId);
  };

  const handleRegister = (eventId: string) => {
    // Track register interaction
    trackInteraction(eventId, 'REGISTER');
    onRegister?.(eventId);
  };

  const handleDismiss = (eventId: string) => {
    // Track dismiss interaction
    trackInteraction(eventId, 'DISMISS');
    setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
  };

  const trackInteraction = async (eventId: string, type: 'VIEW' | 'CLICK' | 'REGISTER' | 'DISMISS') => {
    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          eventId,
          interactionType: type,
        }),
      });
    } catch (err) {
      console.error('Failed to track interaction:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading recommendations</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <Button onClick={() => fetchRecommendations(0)} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600 mb-4">No recommendations available yet.</p>
        <p className="text-sm text-gray-500">
          Set your interests and location preferences to get personalized recommendations.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.eventId} className="relative group">
            <div onClick={() => handleEventClick(event.eventId)} className="cursor-pointer">
              <EventCard
                event={{
                  id: event.eventId,
                  name: event.title,
                  description: event.description,
                  date: new Date(event.startDate),
                  location: event.location,
                  category: event.category,
                  image: event.imageUrl || '',
                  organizerId: '',
                  status: 'published',
                  ticketTypes: [],
                  totalAttendees: event.attendeeCount,
                  createdAt: new Date(),
                }}
                showSaveButton
                onSave={() => handleRegister(event.eventId)}
              />
            </div>
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
              {event.recommendationScore.toFixed(1)}/100
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(event.eventId)}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Dismiss recommendation"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      <div ref={observerTarget} className="h-4" />
    </div>
  );
};

export default PersonalizedFeedComponent;

