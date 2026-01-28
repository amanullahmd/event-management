'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAllEvents } from '@/lib/dummy-data';
import type { Event } from '@/lib/types';
import { Calendar, MapPin, Users, ArrowRight, Search, Shield, Zap, BarChart3, Star, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allEvents = getAllEvents();
    const featuredEvents = allEvents.filter((e) => e.status === 'active').slice(0, 6);
    setEvents(featuredEvents);
    setIsLoading(false);
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAvailableTickets = (event: Event) => {
    return event.ticketTypes.reduce((total, tt) => total + (tt.quantity - tt.sold), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 mb-6">
                <Star className="w-4 h-4 mr-1.5" /> #1 Event Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Discover & Book <span className="text-violet-600 dark:text-violet-400">Amazing Events</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-200 mb-8 max-w-lg">
                From concerts to conferences, find thousands of events happening near you. Book tickets in seconds with our secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/events">
                  <Button size="lg" className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-8 h-12">
                    <Search className="w-5 h-5 mr-2" /> Explore Events
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white px-8 h-12">
                    Create Account <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-gray-200 dark:border-slate-700">
                <div><p className="text-3xl font-bold text-gray-900 dark:text-white">1K+</p><p className="text-sm text-gray-500 dark:text-gray-300">Events</p></div>
                <div><p className="text-3xl font-bold text-gray-900 dark:text-white">50K+</p><p className="text-sm text-gray-500 dark:text-gray-300">Users</p></div>
                <div><p className="text-3xl font-bold text-gray-900 dark:text-white">500K+</p><p className="text-sm text-gray-500 dark:text-gray-300">Tickets Sold</p></div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="space-y-4">
                {events.slice(0, 3).map((event, i) => (
                  <div key={event.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700 ${i === 1 ? 'ml-8' : i === 2 ? 'ml-4' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">{event.category.charAt(0)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{event.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300 mt-1">
                          <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />{formatDate(event.date)}</span>
                          <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{event.location.split(',')[0]}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">${Math.min(...event.ticketTypes.map((t) => t.price))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose EventHub?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-200">Everything you need to discover and book events</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Smart Discovery', desc: 'Find events with powerful search and filters', color: 'bg-blue-500' },
              { icon: Zap, title: 'Instant Booking', desc: 'Purchase tickets in seconds securely', color: 'bg-amber-500' },
              { icon: Shield, title: 'Secure Payments', desc: 'Industry-leading payment security', color: 'bg-green-500' },
              { icon: BarChart3, title: 'Live Analytics', desc: 'Track performance in real-time', color: 'bg-purple-500' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-200 text-sm">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Events</h2>
              <p className="text-gray-600 dark:text-gray-200">Trending events you don&apos;t want to miss</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-12"><p className="text-gray-500">Loading events...</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="group">
                  <Card className="overflow-hidden bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="h-44 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center relative">
                      <span className="text-white text-lg font-medium">{event.category}</span>
                      <span className="absolute top-3 right-3 px-3 py-1 bg-white text-violet-600 text-sm font-bold rounded-full shadow">From ${Math.min(...event.ticketTypes.map((t) => t.price))}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">{event.name}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-200"><Calendar className="w-4 h-4 mr-2 text-violet-500" />{formatDate(event.date)}</div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-200"><MapPin className="w-4 h-4 mr-2 text-fuchsia-500" />{event.location}</div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                        <span className="flex items-center text-sm text-gray-500 dark:text-gray-300"><Users className="w-4 h-4 mr-1.5" />{getAvailableTickets(event)} left</span>
                        <span className="text-violet-600 dark:text-violet-400 text-sm font-medium group-hover:translate-x-1 transition-transform flex items-center">View <ArrowRight className="w-4 h-4 ml-1" /></span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-200">Get your tickets in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Browse', desc: 'Explore events by category or location' },
              { step: '2', title: 'Select', desc: 'Choose your preferred tickets' },
              { step: '3', title: 'Pay', desc: 'Complete secure checkout' },
              { step: '4', title: 'Enjoy', desc: 'Get instant e-tickets' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">{item.step}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-violet-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Find Your Next Event?</h2>
          <p className="text-lg text-violet-100 mb-8">Join thousands of users discovering amazing events every day</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events"><Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 px-8 h-12">Browse Events</Button></Link>
            <Link href="/register"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-12">Create Account</Button></Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">Trusted by Event Lovers Worldwide</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure & Safe', desc: 'Bank-level encryption for all transactions' },
              { icon: CheckCircle, title: 'Verified Events', desc: 'All events are verified by our team' },
              { icon: Star, title: 'Top Rated', desc: 'Trusted by 50K+ active users' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center p-6">
                  <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-200 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
