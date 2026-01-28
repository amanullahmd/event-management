'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllEvents } from '@/lib/dummy-data';
import type { Event } from '@/lib/types';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * Modern landing page with hero, features, and featured events
 * Showcases platform capabilities and featured events
 */
export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allEvents = getAllEvents();
    const featuredEvents = allEvents
      .filter((e) => e.status === 'active')
      .slice(0, 6);
    setEvents(featuredEvents);
    setIsLoading(false);
  }, []);

  const categories = [
    { name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { name: 'Music', icon: '🎵', color: 'from-purple-500 to-pink-500' },
    { name: 'Sports', icon: '⚽', color: 'from-orange-500 to-red-500' },
    { name: 'Business', icon: '💼', color: 'from-green-500 to-emerald-500' },
    { name: 'Education', icon: '📚', color: 'from-indigo-500 to-blue-500' },
    { name: 'Entertainment', icon: '🎬', color: 'from-pink-500 to-rose-500' },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Easy Event Discovery',
      description: 'Find events with advanced search and filtering options',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Purchase tickets in seconds with secure payment',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track event performance with detailed insights',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your peace of mind',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with thousands of event enthusiasts',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Events',
      description: 'Tools to help organizers reach more attendees',
    },
  ];

  const stats = [
    { label: 'Active Events', value: '1000+' },
    { label: 'Happy Users', value: '50K+' },
    { label: 'Tickets Sold', value: '500K+' },
    { label: 'Revenue Generated', value: '$10M+' },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAvailableTickets = (event: Event) => {
    return event.ticketTypes.reduce(
      (total, tt) => total + (tt.quantity - tt.sold),
      0
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Welcome to EventHub
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover & Book
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of event management. Find, book, and manage events with our modern platform. From concerts to conferences, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/events">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8">
                Explore Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose EventHub?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to discover, book, and manage events in one powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-slate-600">
              Find events that match your interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/events?category=${encodeURIComponent(category.name)}`}
              >
                <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group border-slate-200 hover:border-blue-300">
                  <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                Featured Events
              </h2>
              <p className="text-lg text-slate-600">
                Don't miss these trending events
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="hidden sm:flex">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No featured events available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full group border-slate-200">
                    {/* Event Image */}
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                      <div className="text-white text-center relative z-10">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-semibold">{event.category}</p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-900 flex-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {event.name}
                        </h3>
                        <Badge variant="secondary" className="ml-2 shrink-0 bg-blue-100 text-blue-700">
                          {event.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-slate-700">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-sm text-slate-700">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          {event.location}
                        </div>
                      </div>

                      {/* Ticket Info */}
                      <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="w-4 h-4 mr-1" />
                          {getAvailableTickets(event)} available
                        </div>
                        <p className="text-sm font-bold text-blue-600">
                          From $
                          {Math.min(
                            ...event.ticketTypes.map((t) => t.price)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12 sm:hidden">
            <Link href="/events">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View All Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Browse Events', desc: 'Explore thousands of events' },
              { step: '2', title: 'Select Tickets', desc: 'Choose your preferred tickets' },
              { step: '3', title: 'Checkout', desc: 'Secure payment process' },
              { step: '4', title: 'Enjoy', desc: 'Get your tickets instantly' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-center text-sm">
                    {item.desc}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Next Event?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users discovering and booking amazing events. Start exploring today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" variant="secondary" className="px-8">
                Browse Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900">
              Trusted by Event Enthusiasts Worldwide
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'Industry-leading security' },
              { icon: CheckCircle, title: 'Verified Events', desc: 'All events are verified' },
              { icon: TrendingUp, title: 'Growing Community', desc: '50K+ active users' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
