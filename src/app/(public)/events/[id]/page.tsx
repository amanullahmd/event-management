'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketSelector } from '@/components/public/TicketSelector';
import { getEventById, getOrganizerById } from '@/lib/dummy-data';
import { useCart } from '@/lib/context/CartContext';
import type { Event, TicketType } from '@/lib/types';
import type { OrganizerProfile } from '@/lib/types/user';

/**
 * Event details page
 * Displays comprehensive event information and ticket selection
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */
export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  useEffect(() => {
    if (params.id) {
      const eventData = getEventById(params.id as string);
      if (eventData) {
        setEvent(eventData);
        const organizerData = getOrganizerById(eventData.organizerId);
        if (organizerData) {
          setOrganizer(organizerData);
        }
      }
      setIsLoading(false);
    }
  }, [params.id]);

  const handleAddToCart = (ticketType: TicketType, quantity: number) => {
    if (event) {
      addItem(ticketType, event.id, quantity);
      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getAvailableTickets = (ticketType: TicketType) => {
    return ticketType.quantity - ticketType.sold;
  };

  const getTotalAvailableTickets = () => {
    if (!event) return 0;
    return event.ticketTypes.reduce(
      (total, tt) => total + getAvailableTickets(tt),
      0
    );
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">
          The event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/events">
          <Button>Browse Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Message */}
      {showAddedMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Tickets added to cart!</span>
            <Link href="/checkout">
              <Button variant="secondary" size="sm" className="ml-2">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="w-full h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Badge className="mb-2 bg-white/20 text-white border-white/30">
              {event.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {event.name}
            </h1>
            <p className="text-white/90">
              {formatDate(event.date)} at {formatTime(event.date)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {event.description}
              </p>
            </Card>

            {/* Date & Time */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Date & Time
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(event.date)}
                  </p>
                  <p className="text-gray-600">{formatTime(event.date)}</p>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                  <p className="text-gray-600">View on map</p>
                </div>
              </div>
            </Card>

            {/* Organizer Info */}
            {organizer && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Organizer
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600">
                      {organizer.businessName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {organizer.businessName}
                    </p>
                    <div className="flex items-center gap-2">
                      {organizer.verificationStatus === 'verified' && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified Organizer
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Ticket Selector */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select Tickets
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {getTotalAvailableTickets()} tickets available
                </p>

                <TicketSelector
                  ticketTypes={event.ticketTypes}
                  onAddToCart={handleAddToCart}
                />
              </Card>

              {/* Cart Summary */}
              {cartItemCount > 0 && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">
                      Cart ({cartItemCount} items)
                    </span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </Card>
              )}

              {/* Event Stats */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Event Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attendees</span>
                    <span className="font-medium">{event.totalAttendees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
