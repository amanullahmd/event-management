'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getAllAdminEvents, updateEventStatus, getAllOrganizers } from '@/modules/shared-common/services/apiService';
import type { Event, User } from '@/modules/shared-common/services/apiService';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Eye,
  Ban,
  XCircle,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Tag,
} from 'lucide-react';

type StatusFilter = 'all' | 'active' | 'inactive' | 'cancelled' | 'draft' | 'published';

export default function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventsData, organizersData] = await Promise.all([
        getAllAdminEvents(),
        getAllOrganizers(),
      ]);
      setEvents(eventsData || []);
      setOrganizers(organizersData || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getOrganizerName = (organizerId: string): string => {
    const org = organizers.find((o) => o.id === organizerId);
    if (!org) return 'Unknown';
    if (org.firstName && org.lastName) return `${org.firstName} ${org.lastName}`;
    return org.name || org.email;
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        (event.name || event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || event.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, statusFilter]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    events.forEach((e) => {
      const s = (e.status || '').toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [events]);

  const handleStatusChange = async (event: Event, newStatus: string) => {
    setActionLoading(event.id);
    try {
      await updateEventStatus(event.id, newStatus);
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e))
      );
      if (selectedEvent?.id === event.id) {
        setSelectedEvent((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (err) {
      console.error('Error updating event status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[s] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-red-600 dark:text-red-400 text-xl font-bold mb-2">Error Loading Events</h2>
          <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all {events.length} events on the platform
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {events.filter(e => ['active', 'published'].includes((e.status || '').toLowerCase())).length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {events.reduce((sum, e) => sum + (e.ticketTypes || []).reduce((s, tt) => s + (tt.sold || 0), 0), 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Attendees</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(
                  events.reduce(
                    (sum, e) =>
                      sum + (e.ticketTypes || []).reduce((s, t) => s + t.price * t.sold, 0),
                    0
                  )
                )}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs + Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                  {statusCounts[tab.key] !== undefined && (
                    <span className={`ml-1.5 text-xs ${statusFilter === tab.key ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {statusCounts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tickets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No events found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Events will appear here once created'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.image || event.imageUrl ? (
                          <img
                            src={event.image || event.imageUrl}
                            alt={event.name || event.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {(event.name || event.title || 'E').charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {event.name || event.title}
                          </p>
                          {event.category && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {event.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {getOrganizerName(event.organizerId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(event.startDate || event.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.location || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {(event.ticketTypes || []).reduce((s, tt) => s + (tt.sold || 0), 0)} sold
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(event.status)}`}>
                        {(event.status || 'unknown').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedEvent(event); setShowDetailModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {['active', 'published'].includes((event.status || '').toLowerCase()) && (
                          <>
                            <button
                              onClick={() => handleStatusChange(event, 'inactive')}
                              disabled={actionLoading === event.id}
                              className="p-1.5 text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(event, 'cancelled')}
                              disabled={actionLoading === event.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {['inactive', 'draft'].includes((event.status || '').toLowerCase()) && (
                          <button
                            onClick={() => handleStatusChange(event, 'active')}
                            disabled={actionLoading === event.id}
                            className="px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length}
            </p>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Event Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</label>
                  <p className="text-slate-900 dark:text-white font-medium mt-1">{selectedEvent.name || selectedEvent.title}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Category</label>
                  <p className="text-slate-900 dark:text-white font-medium mt-1">{selectedEvent.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</label>
                  <p className="text-slate-900 dark:text-white font-medium mt-1">{formatDate(selectedEvent.startDate || selectedEvent.date)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Location</label>
                  <p className="text-slate-900 dark:text-white font-medium mt-1">{selectedEvent.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Organizer</label>
                  <p className="text-slate-900 dark:text-white font-medium mt-1">{getOrganizerName(selectedEvent.organizerId)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</label>
                  <p className="mt-1">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedEvent.status)}`}>
                      {(selectedEvent.status || 'unknown').toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</label>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">{selectedEvent.description}</p>
                </div>
              )}

              {/* Ticket Types */}
              {selectedEvent.ticketTypes && selectedEvent.ticketTypes.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-3 block">Ticket Types</label>
                  <div className="space-y-2">
                    {selectedEvent.ticketTypes.map((tt) => (
                      <div key={tt.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{tt.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{tt.sold} / {tt.quantity} sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{formatCurrency(tt.price)}</p>
                          <p className="text-xs text-slate-500">
                            {tt.quantity > 0 ? ((tt.sold / tt.quantity) * 100).toFixed(0) : 0}% sold
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Attendees</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(selectedEvent.ticketTypes || []).reduce((s, tt) => s + (tt.sold || 0), 0)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency((selectedEvent.ticketTypes || []).reduce((sum, tt) => sum + tt.price * tt.sold, 0))}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {['active', 'published'].includes((selectedEvent.status || '').toLowerCase()) && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => { handleStatusChange(selectedEvent, 'inactive'); setShowDetailModal(false); }}
                    disabled={actionLoading === selectedEvent.id}
                    className="flex-1 py-2.5 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Suspend Event
                  </button>
                  <button
                    onClick={() => { handleStatusChange(selectedEvent, 'cancelled'); setShowDetailModal(false); }}
                    disabled={actionLoading === selectedEvent.id}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
