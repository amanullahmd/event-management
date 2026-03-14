'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getAllOrganizers, approveOrganizer, rejectOrganizer } from '@/modules/shared-common/services/apiService';
import type { User } from '@/modules/shared-common/services/apiService';
import {
  Search,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'active' | 'blocked' | 'inactive';

export default function OrganizerManagementPage() {
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrganizer, setSelectedOrganizer] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrganizers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrganizers();
      setOrganizers(data || []);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const getDisplayName = (user: User): string => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.name) return user.name;
    return user.email;
  };

  const getInitial = (user: User): string => {
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.name) return user.name.charAt(0).toUpperCase();
    return user.email.charAt(0).toUpperCase();
  };

  const isActive = (user: User): boolean => {
    return ['ACTIVE', 'active'].includes(user.status);
  };

  const isBlocked = (user: User): boolean => {
    return ['BLOCKED', 'blocked'].includes(user.status);
  };

  const filteredOrganizers = useMemo(() => {
    return organizers.filter((org) => {
      const name = getDisplayName(org).toLowerCase();
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase());
      // 'pending' tab shows BLOCKED organizers (awaiting approval)
      const effectiveFilter = statusFilter === 'pending' ? 'blocked' : statusFilter;
      const matchesStatus =
        effectiveFilter === 'all' || org.status?.toLowerCase() === effectiveFilter;
      return matchesSearch && matchesStatus;
    });
  }, [organizers, searchTerm, statusFilter]);

  const paginatedOrganizers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrganizers.slice(start, start + itemsPerPage);
  }, [filteredOrganizers, currentPage]);

  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage);

  const handleApprove = async (org: User) => {
    setActionLoading(org.id);
    try {
      await approveOrganizer(org.id);
      setOrganizers((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, status: 'ACTIVE' } : o))
      );
    } catch (err) {
      console.error('Error approving organizer:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (org: User) => {
    setActionLoading(org.id);
    try {
      await rejectOrganizer(org.id);
      setOrganizers((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, status: 'BLOCKED' } : o))
      );
    } catch (err) {
      console.error('Error rejecting organizer:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (s === 'BLOCKED') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (s === 'INACTIVE') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-60 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
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
          <h2 className="text-red-600 dark:text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-500 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={fetchOrganizers}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Organizer Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage {organizers.length} organizer accounts
          </p>
        </div>
        <button
          onClick={fetchOrganizers}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{organizers.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {organizers.filter(isActive).length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
            </div>
          </div>
        </div>
        <div
          className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-amber-200 dark:border-amber-800 shadow-sm cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {organizers.filter(isBlocked).length}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {organizers.filter(isBlocked).length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Blocked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(['all', 'pending', 'active', 'blocked', 'inactive'] as StatusFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                  statusFilter === tab
                    ? tab === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'pending' ? 'Pending Approval' : tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedOrganizers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No organizers found</p>
                  </td>
                </tr>
              ) : (
                paginatedOrganizers.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitial(org)}
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {getDisplayName(org)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {org.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(org.status)}`}>
                        {(org.status || 'unknown').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {org.createdAt ? formatDate(org.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedOrganizer(org); setShowDetailModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isActive(org) && (
                          <button
                            onClick={() => handleApprove(org)}
                            disabled={actionLoading === org.id}
                            className="px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" /> Approve
                          </button>
                        )}
                        {isActive(org) && (
                          <button
                            onClick={() => handleReject(org)}
                            disabled={actionLoading === org.id}
                            className="px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" /> Block
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
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredOrganizers.length)} of {filteredOrganizers.length}
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
      {showDetailModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organizer Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getInitial(selectedOrganizer)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {getDisplayName(selectedOrganizer)}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedOrganizer.email}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(selectedOrganizer.status)}`}>
                    {(selectedOrganizer.status || 'unknown').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedOrganizer.role}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Joined</p>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {selectedOrganizer.createdAt ? formatDate(selectedOrganizer.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                {!isActive(selectedOrganizer) && (
                  <button
                    onClick={() => { handleApprove(selectedOrganizer); setShowDetailModal(false); }}
                    disabled={actionLoading === selectedOrganizer.id}
                    className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" /> Approve
                  </button>
                )}
                {isActive(selectedOrganizer) && (
                  <button
                    onClick={() => { handleReject(selectedOrganizer); setShowDetailModal(false); }}
                    disabled={actionLoading === selectedOrganizer.id}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <UserX className="w-4 h-4" /> Block Organizer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
