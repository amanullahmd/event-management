'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getOrdersByCustomerId, getTicketsByCustomerId, getEventById } from '@/modules/shared-common/services/apiService';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  User, 
  Star,
  Heart,
  Search,
  Download,
  QrCode,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Gift,
  Bell,
  DollarSign,
  Settings
} from 'lucide-react';

interface CustomerOrder {
  id: string;
  eventId: string;
  customerId: string;
  totalAmount: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  tickets: any[];
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

interface CustomerTicket {
  id: string;
  eventId: string;
  orderId: string;
  checkedIn: boolean;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  ticketType?: string;
  price?: number;
}

interface CustomerEvent {
  id: string;
  name: string;
  date: string | Date;
  location: string;
  image?: string;
  category?: string;
  tickets: CustomerTicket[];
}

interface CustomerStats {
  totalTickets: number;
  totalOrders: number;
  totalSpent: number;
  upcomingEvents: number;
  attendedEvents: number;
  favoriteCategories: string[];
  loyaltyPoints: number;
}

/**
 * Modern Customer Dashboard with real-time data
 * Professional UI/UX with personalized experience
 */
export default function ModernCustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CustomerEvent[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalTickets: 0,
    totalOrders: 0,
    totalSpent: 0,
    upcomingEvents: 0,
    attendedEvents: 0,
    favoriteCategories: [],
    loyaltyPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [ordersData, ticketsData] = await Promise.all([
          getOrdersByCustomerId(user.id),
          getTicketsByCustomerId(user.id),
        ]);

        const allOrders = (ordersData || []) as CustomerOrder[];
        const allTickets = (ticketsData || []) as CustomerTicket[];

        setOrders(allOrders);
        setTickets(allTickets);

        // Calculate stats
        const totalSpent = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const attendedEvents = allTickets.filter(ticket => ticket.checkedIn).length;
        
        // Fetch event details for tickets
        const uniqueTicketEventIds = [...new Set(allTickets.map((t) => t.eventId))];
        const ticketEvents = await Promise.all(uniqueTicketEventIds.map((id) => getEventById(id)));

        const ticketsByEvent: Record<string, CustomerTicket[]> = {};
        const upcomingList: CustomerEvent[] = [];

        const now = new Date();
        uniqueTicketEventIds.forEach((id, i) => {
          const event = ticketEvents[i] as any;
          if (event) {
            const eventTickets = allTickets.filter((t) => t.eventId === id);
            if (eventTickets.length > 0) {
              ticketsByEvent[id] = eventTickets.map(ticket => ({
                ...ticket,
                eventName: event.name,
                eventDate: event.date,
                eventLocation: event.location
              }));
              
              if (new Date(event.date) > now) {
                upcomingList.push({
                  id: event.id,
                  name: event.name,
                  date: event.date,
                  location: event.location,
                  image: event.image,
                  category: event.category,
                  tickets: ticketsByEvent[id]
                });
              }
            }
          }
        });

        upcomingList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingEvents(upcomingList.slice(0, 3));

        // Fetch event details for orders
        const orderEventIds = [...new Set(allOrders.slice(0, 5).map((o) => o.eventId))];
        const orderEvents = await Promise.all(orderEventIds.map((id) => getEventById(id)));
        
        const ordersWithEventDetails = allOrders.map(order => {
          const eventIndex = orderEventIds.indexOf(order.eventId);
          const event = orderEvents[eventIndex] as any;
          return {
            ...order,
            eventName: event?.name || 'Unknown Event',
            eventDate: event?.date,
            eventLocation: event?.location
          };
        });

        setOrders(ordersWithEventDetails);

        // Update stats
        setStats({
          totalTickets: allTickets.length,
          totalOrders: allOrders.length,
          totalSpent,
          upcomingEvents: upcomingList.length,
          attendedEvents,
          favoriteCategories: ['Music', 'Sports', 'Technology'], // Would be calculated from actual data
          loyaltyPoints: Math.floor(totalSpent / 10) // Simple loyalty calculation
        });

        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Fetching your tickets and orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Guest'}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              Your personalized event hub - manage tickets, discover events, and track your experiences
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Gift className="w-4 h-4" />
                <span className="text-sm font-medium">{stats.loyaltyPoints} Loyalty Points</span>
              </div>
              <div className="text-sm text-indigo-200">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tickets */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>12%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{stats.totalTickets}</p>
            <p className="text-blue-100">Total Tickets</p>
            <p className="text-sm text-blue-200">In your collection</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>8%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <p className="text-green-100">Total Orders</p>
            <p className="text-sm text-green-200">Successfully placed</p>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>24%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{formatCurrency(stats.totalSpent)}</p>
            <p className="text-purple-100">Total Spent</p>
            <p className="text-sm text-purple-200">On amazing events</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Bell className="w-4 h-4" />
              <span>New</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
            <p className="text-orange-100">Upcoming Events</p>
            <p className="text-sm text-orange-200">Get ready to go!</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/events" className="group">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all group-hover:scale-105">
              <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Browse Events</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Discover new experiences</p>
            </div>
          </Link>
          
          <Link href="/dashboard/tickets" className="group">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group-hover:scale-105">
              <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">My Tickets</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">View all tickets</p>
            </div>
          </Link>
          
          <Link href="/dashboard/orders" className="group">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all group-hover:scale-105">
              <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">Order History</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track purchases</p>
            </div>
          </Link>
          
          <Link href="/dashboard/profile" className="group">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all group-hover:scale-105">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium text-slate-900 dark:text-white">My Profile</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Upcoming Events
            </h2>
            <Link
              href="/dashboard/tickets"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              View All Tickets →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {upcomingEvents.length > 0 ? (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all"
                >
                  <div className="w-full md:w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-4xl">
                    <Calendar className="w-16 h-16" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
                          {event.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 mb-2">
                          {event.tickets.length} ticket{event.tickets.length !== 1 ? 's' : ''}
                        </span>
                        <div className="space-x-2">
                          <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {event.tickets.map((ticket, index) => (
                        <div key={ticket.id} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {ticket.ticketType || 'General Admission'}
                          </span>
                          {ticket.price && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1">
                              • {formatCurrency(ticket.price)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                <Ticket className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No upcoming events
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                You don't have any tickets for upcoming events. Browse our events to find something amazing!
              </p>
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              View All Orders →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Order #{order.id.replace('order-', '')}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {order.eventName || 'Unknown Event'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {order.tickets.length} ticket{order.tickets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                <CreditCard className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No orders yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start by browsing events and purchasing your first tickets!
              </p>
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Your Profile Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {user?.name || 'Guest User'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.email || 'No email'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {stats.loyaltyPoints} Loyalty Points
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Events Attended</span>
              <span className="font-semibold text-slate-900 dark:text-white">{stats.attendedEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Member Since</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Favorite Categories</span>
              <div className="flex gap-1">
                {stats.favoriteCategories.map((category, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <User className="w-4 h-4 mr-2" />
            Edit Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
