'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import EventCreationForm from '@/modules/event-management/components/EventCreationForm';

/**
 * Event Creation Page
 * Allows authenticated organizers to create new events
 * Redirects to login if not authenticated
 */
export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication status
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push('/login');
      }
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication required</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EventCreationForm
        onSuccess={(eventId) => {
          // Event creation was successful, redirect is handled in the form
        }}
        onError={(error) => {
          console.error('Event creation error:', error);
        }}
      />
    </div>
  );
}


