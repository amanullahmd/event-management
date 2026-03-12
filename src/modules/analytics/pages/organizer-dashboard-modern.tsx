'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getMyEvents, type Event } from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import Link from 'next/link';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  Eye, 
  BarChart3,
  Clock,
  MapPin,
  Ticket,
  AlertCircle,
  CheckCircle,
  Target,
  RefreshCw,
  Settings
} from 'lucide-react';

interface EventMetrics {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

interface RecentEvent extends Event {
  revenue: number;
  ticketsSold: number;
  derivedStatus: 'upcoming' | 'active' | 'completed';
}

/**
 * Modern Organizer Dashboard with real API data
 * Fetches events from GET /events and filters by organizerId from AuthContext
 * Derives ticket sales and revenue from event ticketTypes
 */
export default function ModernOrganizerDashboard() {
  const { user } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (!user) {
      setOrganizerEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const events = await getMyEvents();
      setOrganizerEvents(events);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch organizer data:', err);
      setError('Failed to load dashboard data');
      setOrganizerEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive metrics from events and their ticketTypes
  const metrics = useMemo((): EventMetrics => {
    const now = new Date();
    const totalEvents = organizerEvents.length;
    const activeEvents = organizerEvents.filter((e) => ['active', 'published'].includes((e.status || '').toLowerCase())).length;
    const upcomingEvents = organizerEvents.filter((e) => {
      const eventDate = new Date(e.startDate || e.date);
      return eventDate > now;
    }).length;
    const pastEvents = organizerEvents.filter((e) => {
      const eventDate = new Date(e.startDate || e.date);
      return eventDate <= now;
    }).length;
    
    // Derive ticket sales and revenue from ticketTypes
    const totalTicketsSold = organizerEvents.reduce((sum, e) => {
      if (e.ticketTypes && Array.isArray(e.ticketTypes)) {
        return sum + e.ticketTypes.reduce((tSum, tt) => tSum + (tt.sold || 0), 0);
      }
      return sum + (e.totalAttendees || 0);
    }, 0);
    
    const totalRevenue = organizerEvents.reduce((sum, e) => {
      if (e.ticketTypes && Array.isArray(e.ticketTypes)) {
        return sum + e.ticketTypes.reduce((tSum, tt) => tSum + (tt.sold || 0) * (tt.price || 0), 0);
      }
      return sum;
    }, 0);
    
    return {
      totalEvents,
      activeEvents,
      upcomingEvents,
      pastEvents,
      totalTicketsSold,
      totalRevenue,
    };
  }, [organizerEvents]);

  const recentEvents: RecentEvent[] = useMemo(() => {
    const now = new Date();
    return organizerEvents
      .map(event => {
        // Derive ticket sales and revenue from ticketTypes
        const ticketsSold = event.ticketTypes && Array.isArray(event.ticketTypes)
          ? event.ticketTypes.reduce((sum, tt) => sum + (tt.sold || 0), 0)
          : (event.totalAttendees || 0);
        
        const revenue = event.ticketTypes && Array.isArray(event.ticketTypes)
          ? event.ticketTypes.reduce((sum, tt) => sum + (tt.sold || 0) * (tt.price || 0), 0)
          : 0;
        
        let derivedStatus: 'upcoming' | 'active' | 'completed' = 'upcoming';
        const normalizedStatus = (event.status || '').toLowerCase();
        if (normalizedStatus === 'active' || normalizedStatus === 'published') derivedStatus = 'active';
        else if (normalizedStatus === 'draft') derivedStatus = 'upcoming';
        else if (new Date(event.startDate || event.date) <= now) derivedStatus = 'completed';

        return {
          ...event,
          revenue,
          ticketsSold,
          derivedStatus,
        };
      })
      .sort((a, b) => new Date(b.startDate || b.date).getTime() - new Date(a.startDate || a.date).getTime())
      .slice(0, 5);
  }, [organizerEvents]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <Target className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Loading skeleton matching the dashboard layout (Task 7.2)
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>

        {/* Metric card grid skeleton — matches 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 shadow-xl bg-slate-200 dark:bg-slate-700 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="h-3 w-20 bg-slate-300 dark:bg-slate-600 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Event list skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry button (Task 7.2)
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-red-600 dark:text-red-400 text-xl font-bold mb-2">Dashboard Error</h2>
          <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
          <button 
            onClick={fetchData} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage your events and track your performance
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link href="/organizer/events/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Grid — Summary cards from real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatNumber(metrics.totalEvents)}</p>
            <p className="text-purple-100">Total Events</p>
            <p className="text-sm text-purple-200">{metrics.activeEvents} active</p>
          </div>
        </div>

        {/* Tickets Sold Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatNumber(metrics.totalTicketsSold)}</p>
            <p className="text-blue-100">Tickets Sold</p>
            <p className="text-sm text-blue-200">Across all events</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-green-100">Total Revenue</p>
            <p className="text-sm text-green-200">All time earnings</p>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatNumber(metrics.upcomingEvents)}</p>
            <p className="text-orange-100">Upcoming Events</p>
            <p className="text-sm text-orange-200">{metrics.pastEvents} completed</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/organizer/events/new">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </Link>
          <Link href="/organizer/events">
            <Button variant="outline" className="w-full py-3 rounded-xl font-medium">
              <Calendar className="w-5 h-5 mr-2" />
              All Events
            </Button>
          </Link>
          <Link href="/organizer/analytics">
            <Button variant="outline" className="w-full py-3 rounded-xl font-medium">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/organizer/checkin">
            <Button variant="outline" className="w-full py-3 rounded-xl font-medium">
              <Ticket className="w-5 h-5 mr-2" />
              Check-in
            </Button>
          </Link>
        </div>
      </div>

      {/* Event List — name, date, status, ticket sales count */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Events
            </h2>
            <Link
              href="/organizer/events"
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              View All Events →
            </Link>
          </div>
        </div>
        
        {recentEvents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Create your first event to start selling tickets and managing attendees
            </p>
            <Link href="/organizer/events/new">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {event.title || event.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.derivedStatus)}`}>
                        {getStatusIcon(event.derivedStatus)}
                        {event.derivedStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.startDate || event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatNumber(event.ticketsSold)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Tickets Sold</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(event.revenue)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-6">
                    <Link href={`/organizer/events/${event.id}`}>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/organizer/events/${event.id}/edit`}>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Overview — derived from real data, no hardcoded percentages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Active Events</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.activeEvents}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            of {metrics.totalEvents} total events
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Avg Attendance</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(metrics.totalEvents > 0 ? Math.round(metrics.totalTicketsSold / metrics.totalEvents) : 0)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tickets per event
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Avg Revenue</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(metrics.totalEvents > 0 ? metrics.totalRevenue / metrics.totalEvents : 0)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Per event average
          </p>
        </div>
      </div>
    </div>
  );
}
