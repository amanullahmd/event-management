'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getOrdersByCustomerId, getEventById } from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import { 
  CreditCard, 
  Calendar, 
  MapPin, 
  Ticket, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
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

/**
 * Customer Orders Page
 * Displays all orders for the logged-in customer
 */
export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getOrdersByCustomerId(user.id);
        
        // Fetch event details for each order
        const ordersWithEventDetails = await Promise.all(
          (ordersData || []).map(async (order: any) => {
            try {
              const event = await getEventById(order.eventId);
              return {
                ...order,
                eventName: event?.name || 'Unknown Event',
                eventDate: event?.date,
                eventLocation: event?.location
              };
            } catch (err) {
              return {
                ...order,
                eventName: 'Unknown Event',
                eventDate: null,
                eventLocation: null
              };
            }
          })
        );

        // Sort by creation date (newest first)
        ordersWithEventDetails.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(ordersWithEventDetails);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your orders...</p>
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View and manage all your ticket purchases
        </p>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                        Order #{order.id.replace('order-', '')}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                          {order.eventName}
                        </h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          {order.eventDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.eventDate)}</span>
                            </div>
                          )}
                          {order.eventLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{order.eventLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {order.tickets.length} ticket{order.tickets.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Ordered {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {order.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
            <CreditCard className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            You haven't purchased any tickets yet. Browse our events to find something amazing!
          </p>
          <Button>
            Browse Events
          </Button>
        </div>
      )}
    </div>
  );
}
