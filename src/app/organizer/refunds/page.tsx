'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getAllOrders, getAllEvents } from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import { 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  User, 
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface RefundRequest {
  id: string;
  orderId: string;
  eventId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  eventName?: string;
  customerName?: string;
  eventDate?: string;
}

/**
 * Organizer Refunds Page
 * Manage refund requests for organizer's events
 */
export default function OrganizerRefundsPage() {
  const { user } = useAuth();
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!user) return;

    const fetchRefundRequests = async () => {
      try {
        setLoading(true);
        
        // Get all events for this organizer
        const allEvents = await getAllEvents();
        const organizerEvents = allEvents.filter(event => event.organizerId === user.id);
        const eventIds = organizerEvents.map(event => event.id);
        
        // Get all orders for these events
        const allOrders = await getAllOrders();
        const eventOrders = allOrders.filter(order => eventIds.includes(order.eventId));
        
        // Mock refund requests data (in real app, this would come from API)
        const mockRefunds: RefundRequest[] = eventOrders.slice(0, 5).map((order, index) => ({
          id: `refund-${index + 1}`,
          orderId: order.id,
          eventId: order.eventId,
          customerId: order.customerId,
          amount: order.totalAmount * 0.8, // 80% refund
          reason: index % 2 === 0 ? 'Event cancelled by organizer' : 'Customer unable to attend',
          status: index === 0 ? 'pending' : index === 1 ? 'approved' : 'rejected',
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          processedAt: index > 0 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          processedBy: index > 0 ? user.name : undefined,
          eventName: organizerEvents.find(e => e.id === order.eventId)?.name || 'Unknown Event',
          customerName: `Customer ${index + 1}`,
          eventDate: organizerEvents.find(e => e.id === order.eventId)?.date ? 
            new Date(organizerEvents.find(e => e.id === order.eventId)!.date).toISOString() : undefined
        }));

        setRefundRequests(mockRefunds);
      } catch (err) {
        console.error('Failed to fetch refund requests:', err);
        setError('Failed to load refund requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRefundRequests();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredRefunds = refundRequests.filter(refund => {
    const matchesSearch = refund.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveRefund = async (refundId: string) => {
    // In a real app, this would call an API
    setRefundRequests(prev => prev.map(refund => 
      refund.id === refundId 
        ? { ...refund, status: 'approved', processedAt: new Date().toISOString(), processedBy: user?.name }
        : refund
    ));
  };

  const handleRejectRefund = async (refundId: string) => {
    // In a real app, this would call an API
    setRefundRequests(prev => prev.map(refund => 
      refund.id === refundId 
        ? { ...refund, status: 'rejected', processedAt: new Date().toISOString(), processedBy: user?.name }
        : refund
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading refund requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Refund Management</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Process and manage refund requests for your events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {refundRequests.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {refundRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {refundRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Refunded</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(refundRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search refunds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.length > 0 ? (
          filteredRefunds.map((refund) => (
            <div
              key={refund.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                        Refund #{refund.id.replace('refund-', '')}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                          {refund.eventName}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {refund.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {refund.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Requested {formatDate(refund.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(refund.amount)}
                          </span>
                        </div>
                      </div>

                      {refund.processedAt && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Processed by {refund.processedBy} on {formatDate(refund.processedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                      {formatCurrency(refund.amount)}
                    </p>
                    {refund.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveRefund(refund.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectRefund(refund.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
              <RefreshCw className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No refund requests found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No refund requests match your filters'
                : 'No refund requests have been submitted yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
