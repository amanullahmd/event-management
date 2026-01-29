'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TicketSelector } from '@/components/public/TicketSelector';
import { getEventById, getOrganizerById } from '@/lib/dummy-data';
import { useCart } from '@/lib/context/CartContext';
import type { Event, TicketType } from '@/lib/types';
import type { OrganizerProfile } from '@/lib/types/user';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart, 
  CheckCircle, 
  ArrowLeft,
  Ticket,
  ShoppingCart,
  Building2,
  Star
} from 'lucide-react';

export default function EventDetailsPage() {
  const params = useParams();
  const { addItem, items } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
    return event.ticketTypes.reduce((total, tt) => total + getAvailableTickets(tt), 0);
  };

  const getLowestPrice = () => {
    if (!event) return 0;
    return Math.min(...event.ticketTypes.map((t) => t.price));
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          The event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/events">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Success Message */}
      {showAddedMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Tickets added to cart!</span>
            <Link href="/checkout">
              <Button size="sm" className="ml-2 bg-white/20 hover:bg-white/30 text-white">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-72 md:h-96 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Back button */}
          <div className="absolute top-6 left-6 z-10">
            <Link href="/events">
              <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
              </Button>
            </Link>
          </div>

          {/* Action buttons */}
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={`bg-white/10 hover:bg-white/20 backdrop-blur-sm ${isLiked ? 'text-red-400' : 'text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Event info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/60 to-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {event.category}
                </span>
                {event.status === 'active' && (
                  <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    On Sale
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(event.date)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {formatTime(event.date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-center">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Ticket className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalAvailableTickets()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tickets Left</p>
              </Card>
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-center">
                <div className="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{event.totalAttendees}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendees</p>
              </Card>
              <Card className="p-4 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${getLowestPrice()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Starting From</p>
              </Card>
            </div>

            {/* About Section */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                About This Event
              </h2>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </Card>

            {/* Date & Time */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Date & Time
              </h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-medium uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-bold">{new Date(event.date).getDate()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(event.date)}</p>
                  <p className="text-gray-600 dark:text-gray-300">{formatTime(event.date)}</p>
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                Location
              </h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{event.location}</p>
                  <button className="text-violet-600 dark:text-violet-400 text-sm font-medium hover:underline mt-1">
                    View on map →
                  </button>
                </div>
              </div>
            </Card>

            {/* Organizer Info */}
            {organizer && (
              <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Organizer
                </h2>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {organizer.businessName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{organizer.businessName}</p>
                    {organizer.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-1">
                        <CheckCircle className="w-4 h-4" /> Verified Organizer
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Ticket Selector */}
              <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-violet-600" />
                  Select Tickets
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {getTotalAvailableTickets()} tickets available
                </p>

                <TicketSelector
                  ticketTypes={event.ticketTypes}
                  onAddToCart={handleAddToCart}
                />
              </Card>

              {/* Cart Summary */}
              {cartItemCount > 0 && (
                <Card className="p-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 border-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Cart ({cartItemCount} items)
                    </span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full bg-white text-violet-600 hover:bg-gray-100 font-semibold">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </Card>
              )}

              {/* Event Highlights */}
              <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Event Highlights</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-200">Instant e-ticket delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-200">Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-200">Mobile ticket support</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-200">24/7 customer support</span>
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
