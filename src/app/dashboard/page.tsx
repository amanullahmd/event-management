'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { getOrdersByCustomerId, getTicketsByCustomerId, getAllEvents, getEventById } from '@/lib/dummy-data';
import type { Order, Ticket, Event } from '@/lib/types';

/**
 * Customer Dashboard Overview Page
 * Displays upcoming events with tickets, recent orders, and profile information link
 * Requirements: 12.2, 12.3, 12.4
 */
export default function CustomerDashboardPage() {
  const { user } = useAuth();
  
  // Get customer's orders and tickets
  const orders = user ? getOrdersByCustomerId(user.id) : [];
  const tickets = user ? getTicketsByCustomerId(user.id) : [];
  const allEvents = getAllEvents();
  
  // Get upcoming events with tickets (events that haven't passed yet)
  const now = new Date();
  const upcomingTickets = tickets.filter((ticket) => {
    const event = getEventById(ticket.eventId);
    return event && new Date(event.date) > now;
  });
  
  // Get unique upcoming events
  const upcomingEventIds = [...new Set(upcomingTickets.map((t) => t.eventId))];
  const upcomingEvents = upcomingEventIds
    .map((id) => getEventById(id))
    .filter((e): e is Event => e !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Guest'}!
        </h1>
        <p className="text-indigo-100">
          Manage your tickets, view orders, and update your profile all in one place.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <span className="text-2xl">🎫</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Tickets</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{tickets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming Events</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
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
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const eventTickets = upcomingTickets.filter((t) => t.eventId === event.id);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl">
                      📅
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {event.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        📍 {event.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {eventTickets.length} ticket{eventTickets.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎫</div>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No upcoming events yet
              </p>
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
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
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const event = getEventById(order.eventId);
                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl">
                        📋
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Order #{order.id.replace('order-', '')}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {event?.name || 'Unknown Event'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No orders yet
              </p>
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Profile Quick Access */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white text-2xl">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {user?.name || 'Guest User'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.email || 'No email'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Edit Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
