'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Card } from '@/modules/shared-common/components/ui/card';
import { TicketSelector } from '@/modules/shared-common/components/public/TicketSelector';
import { getEventById, getEventTicketTypes } from '@/modules/shared-common/services/apiService';
import { useCart } from '@/modules/payment-processing/context/CartContext';
import type { Event, TicketType } from '@/modules/shared-common/services/apiService';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart, 
  CheckCircle,
  Check,
  ArrowLeft,
  Ticket,
  ShoppingCart,
  Star
} from 'lucide-react';

export default function EventDetailsPage() {
  const params = useParams();
  const { addItem, items } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copyLink = async () => {
    const url = window.location.href;
    let copied = false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(url); copied = true; } catch { /* fall through */ }
    }
    if (!copied) {
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand('copy'); copied = true; } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    if (copied) { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }
  };

  const shareToUrl = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    setShareOpen(false);
  };

  const getShareUrls = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(event?.title ?? 'Check out this event on PulsarFlow!');
    return {
      twitter:   `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp:  `https://wa.me/?text=${text}%20${url}`,
      linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
  };

  useEffect(() => {
    const loadEvent = async () => {
      if (params.id) {
        try {
          const eventId = params.id as string;
          const [eventData, ticketTypesData] = await Promise.all([
            getEventById(eventId),
            getEventTicketTypes(eventId).catch(() => []),
          ]);
          if (eventData) {
            // Merge ticket types from separate endpoint into event
            eventData.ticketTypes = ticketTypesData.length > 0
              ? ticketTypesData
              : eventData.ticketTypes || [];
            setEvent(eventData);
          }
        } catch (error) {
          console.error('Error loading event:', error);
        }
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [params.id]);

  const handleAddToCart = (ticketType: TicketType, quantity: number) => {
    if (event) {
      addItem(ticketType, event.id, quantity);
      setShowAddedMessage(true);
      setTimeout(() => setShowAddedMessage(false), 3000);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getAvailableTickets = (ticketType: TicketType) => {
    return ticketType.quantity - ticketType.sold;
  };

  const ticketTypes = event?.ticketTypes || [];

  const getTotalAvailableTickets = () => {
    if (!event) return 0;
    if (ticketTypes.length === 0) return event.capacity || 0;
    return ticketTypes.reduce((total, tt) => total + getAvailableTickets(tt), 0);
  };

  const getLowestPrice = () => {
    if (!event || ticketTypes.length === 0) return 0;
    return Math.min(...ticketTypes.map((t) => t.price));
  };

  // Helper accessors for backend field mapping
  const eventName = event?.title || event?.name || 'Untitled Event';
  const eventDate = event?.startDate || event?.date || '';
  const eventImage = event?.imageUrl || event?.image;
  const eventCategory = event?.categoryName || event?.category || '';

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
          {eventImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eventImage}
              alt={eventName}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Decorative placeholder elements */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
              </div>
            </>
          )}
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
            <div ref={shareRef} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShareOpen(o => !o)}
                title="Share event"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5" />
              </Button>

              {shareOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                    Share this event
                  </div>
                  {/* Copy Link */}
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {shareCopied
                      ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    }
                    {shareCopied ? 'Link copied!' : 'Copy link'}
                  </button>
                  {/* WhatsApp */}
                  <button
                    onClick={() => shareToUrl(getShareUrls().whatsapp)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                  {/* Twitter/X */}
                  <button
                    onClick={() => shareToUrl(getShareUrls().twitter)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.261 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Twitter / X
                  </button>
                  {/* Facebook */}
                  <button
                    onClick={() => shareToUrl(getShareUrls().facebook)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </button>
                  {/* LinkedIn */}
                  <button
                    onClick={() => shareToUrl(getShareUrls().linkedin)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Event info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/60 to-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {eventCategory || event.eventType || 'Event'}
                </span>
                {event.status === 'active' && (
                  <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    On Sale
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                {eventName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(eventDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {formatTime(eventDate)}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{event.totalAttendees || 0}</p>
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
                  <span className="text-xs font-medium uppercase">{new Date(eventDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-bold">{new Date(eventDate).getDate()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(eventDate)}</p>
                  <p className="text-gray-600 dark:text-gray-300">{formatTime(eventDate)}</p>
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

                {ticketTypes.length > 0 ? (
                  <TicketSelector
                    ticketTypes={ticketTypes}
                    onAddToCart={handleAddToCart}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Free event — no tickets required</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Capacity: {event.capacity || 'Unlimited'}</p>
                  </div>
                )}
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
