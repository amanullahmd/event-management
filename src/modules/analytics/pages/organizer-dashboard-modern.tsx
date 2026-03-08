'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getAllEvents, getAllOrders, type Event, type Order } from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import Link from 'next/link';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Eye, 
  QrCode, 
  BarChart3,
  Clock,
  MapPin,
  Ticket,
  AlertCircle,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';

interface EventMetrics {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageRevenuePerEvent: number;
  averageTicketsPerEvent: number;
}

interface RecentEvent extends Event {
  revenue: number;
  ticketsSold: number;
  status: 'upcoming' | 'active' | 'completed';
}

/**
 * Modern Organizer Dashboard with real-time data
 * Professional UI/UX with enhanced metrics and management features
 */
export default function ModernOrganizerDashboard() {
  const { user } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [organizerOrders, setOrganizerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setOrganizerEvents([]);
        setOrganizerOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [allEvents, allOrders] = await Promise.all([
          getAllEvents(),
          getAllOrders()
        ]);
        
        const events = allEvents.filter((event) => event.organizerId === user.id);
        const eventIds = events.map((e) => e.id);
        const orders = allOrders.filter((order) => eventIds.includes(order.eventId));
        
        setOrganizerEvents(events);
        setOrganizerOrders(orders);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setOrganizerEvents([]);
        setOrganizerOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const metrics = useMemo((): EventMetrics => {
    const now = new Date();
    const totalEvents = organizerEvents.length;
    const activeEvents = organizerEvents.filter((e) => e.status === 'active').length;
    const upcomingEvents = organizerEvents.filter((e) => new Date(e.date) > now).length;
    const pastEvents = organizerEvents.filter((e) => new Date(e.date) <= now).length;
    
    const totalTicketsSold = organizerEvents.reduce((sum, e) => sum + (e.totalAttendees || 0), 0);
    const totalRevenue = organizerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    return {
      totalEvents,
      activeEvents,
      upcomingEvents,
      pastEvents,
      totalTicketsSold,
      totalRevenue,
      averageRevenuePerEvent: totalEvents > 0 ? totalRevenue / totalEvents : 0,
      averageTicketsPerEvent: totalEvents > 0 ? totalTicketsSold / totalEvents : 0,
    };
  }, [organizerEvents, organizerOrders]);

  const recentEvents: RecentEvent[] = useMemo(() => {
    const now = new Date();
    return organizerEvents
      .map(event => {
        const eventOrders = organizerOrders.filter(order => order.eventId === event.id);
        const revenue = eventOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const ticketsSold = event.totalAttendees || 0;
        
        let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
        if (event.status === 'active') status = 'active';
        else if (new Date(event.date) <= now) status = 'completed';
        
        return {
          ...event,
          revenue,
          ticketsSold,
          status
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [organizerEvents, organizerOrders]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-purple-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading organizer dashboard...</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Fetching your events and analytics</p>
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
        <Link href="/organizer/events/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{metrics.activeEvents}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatNumber(metrics.totalEvents)}</p>
            <p className="text-purple-100">Total Events</p>
            <p className="text-sm text-purple-200">{metrics.upcomingEvents} upcoming</p>
          </div>
        </div>

        {/* Tickets Sold Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4" />
              <span>{formatNumber(Math.round(metrics.averageTicketsPerEvent))}</span>
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
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>18%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
            <p className="text-green-100">Total Revenue</p>
            <p className="text-sm text-green-200">All time earnings</p>
          </div>
        </div>

        {/* Average Revenue Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-4 h-4" />
              <span>Hot</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatCurrency(metrics.averageRevenuePerEvent)}</p>
            <p className="text-orange-100">Avg per Event</p>
            <p className="text-sm text-orange-200">Performance metric</p>
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
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-all">
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
              <QrCode className="w-5 h-5 mr-2" />
              Check-in
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Events */}
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
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {event.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
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
        
        {recentEvents.length > 5 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link href="/organizer/events">
              <Button variant="outline" size="sm" className="rounded-lg">
                View All Events ({metrics.totalEvents})
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Event Success Rate</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.totalEvents > 0 ? Math.round((metrics.activeEvents / metrics.totalEvents) * 100) : 0}%
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Active events ratio
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Avg Attendance</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(Math.round(metrics.averageTicketsPerEvent))}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tickets per event
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Revenue Growth</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">+24%</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Month over month
          </p>
        </div>
      </div>
    </div>
  );
}
