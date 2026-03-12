'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/modules/shared-common/components/ui/button';
import { getMyEvents, type Event } from '@/modules/shared-common/services/apiService';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  BarChart3,
  Ticket,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'published' | 'draft' | 'inactive' | 'cancelled';

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const organizerEvents = await getMyEvents();
      setEvents(organizerEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load your events');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getTicketsSold = (event: Event) =>
    (event.ticketTypes || []).reduce((total, tt) => total + (tt.sold || 0), 0);

  const getTotalCapacity = (event: Event) =>
    (event.ticketTypes || []).reduce((total, tt) => total + (tt.quantity || 0), 0);

  const getRevenue = (event: Event) =>
    (event.ticketTypes || []).reduce((total, tt) => total + ((tt.sold || 0) * (tt.price || 0)), 0);

  const normalizeStatus = (status: string) => (status || '').toLowerCase();

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus = statusFilter === 'all' || normalizeStatus(event.status) === statusFilter;
      const matchesSearch =
        !searchTerm ||
        (event.title || event.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.categoryName || event.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [events, statusFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: events.length,
    active: events.filter(e => ['active', 'published'].includes(normalizeStatus(e.status))).length,
    totalSold: events.reduce((sum, e) => sum + getTicketsSold(e), 0),
    totalRevenue: events.reduce((sum, e) => sum + getRevenue(e), 0),
  }), [events]);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const getStatusBadge = (status: string) => {
    const s = normalizeStatus(status);
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      unpublished: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    return styles[s] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-5 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
            </div>
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Events</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track your {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/organizer/events/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Events</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Events</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tickets Sold</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">{stats.totalSold}</p>
            </div>
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Ticket className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching events' : 'No events yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Create your first event to start selling tickets!'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link href="/organizer/events/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const sold = getTicketsSold(event);
            const capacity = getTotalCapacity(event);
            const revenue = getRevenue(event);
            const sellPercent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                          {event.title || event.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0 ${getStatusBadge(event.status)}`}>
                          {normalizeStatus(event.status).charAt(0).toUpperCase() + normalizeStatus(event.status).slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-500" />
                          {formatDate(event.startDate || event.date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-fuchsia-500" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {sold} / {capacity} tickets ({sellPercent}%)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                      <div className="mt-3 w-full max-w-xs">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(sellPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/organizer/events/${event.id}`}>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </Link>
                      <Link href={`/organizer/events/${event.id}/analytics`}>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <BarChart3 className="w-3.5 h-3.5" /> Analytics
                        </button>
                      </Link>
                      <Link href={`/events/${event.id}`}>
                        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
