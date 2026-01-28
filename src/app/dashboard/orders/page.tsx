'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { getOrdersByCustomerId, getEventById } from '@/lib/dummy-data';
import type { Order, OrderStatus } from '@/lib/types';

/**
 * Customer Orders Page
 * Displays list of all customer orders with details
 * Requirements: 14.1, 14.2
 */
export default function OrdersPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  
  // Get customer's orders
  const orders = user ? getOrdersByCustomerId(user.id) : [];
  
  // Filter orders by status
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.totalAmount - a.totalAmount;
  });

  // Calculate stats
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Orders
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          View and manage all your ticket orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedOrders}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['all', 'completed', 'pending', 'refunded', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Date (Newest)</option>
            <option value="amount">Amount (Highest)</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {sortedOrders.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedOrders.map((order) => {
                  const event = getEventById(order.eventId);
                  const ticketCount = order.tickets.reduce((sum, t) => sum + t.quantity, 0);
                  
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          #{order.id.replace('order-', '')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
                            📅
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                              {event?.name || 'Unknown Event'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {event?.location || 'Unknown Location'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900 dark:text-white">
                          {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {statusFilter === 'all'
              ? "You haven't placed any orders yet. Browse events to find something exciting!"
              : `You don't have any orders with status "${statusFilter}".`}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Order status badge component
 */
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusStyles = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
