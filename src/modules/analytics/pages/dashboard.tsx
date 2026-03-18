'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { getOrdersByCustomerId, getTicketsByCustomerId, getEventById } from '@/modules/shared-common/services/apiService';
import { PersonalizedFeedComponent } from '@/modules/analytics/components/PersonalizedFeedComponent';

type AnyOrder = {
  id: string;
  eventId: string;
  customerId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  tickets: any[];
};

type AnyTicket = {
  id: string;
  eventId: string;
  orderId: string;
  checkedIn: boolean;
};

type AnyEvent = {
  id: string;
  name: string;
  title?: string;
  date: string | Date;
  startDate?: string | Date;
  location: string;
};

/**
 * Customer Dashboard Overview Page
 * Displays upcoming events with tickets, recent orders, and profile information link
 * Requirements: 12.2, 12.3, 12.4
 */
export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AnyOrder[]>([]);
  const [tickets, setTickets] = useState<AnyTicket[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AnyEvent[]>([]);
  const [upcomingTicketsByEvent, setUpcomingTicketsByEvent] = useState<Record<string, AnyTicket[]>>({});
  const [recentOrders, setRecentOrders] = useState<AnyOrder[]>([]);
  const [orderEventNames, setOrderEventNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [ordersData, ticketsData] = await Promise.all([
          getOrdersByCustomerId(user.id),
          getTicketsByCustomerId(user.id),
        ]);

        const allOrders = (ordersData || []) as AnyOrder[];
        const allTickets = (ticketsData || []) as AnyTicket[];

        setOrders(allOrders);
        setTickets(allTickets);

        // Recent orders: last 5 by date
        const sortedOrders = [...allOrders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentOrders(sortedOrders.slice(0, 5));

        // Fetch event names for recent orders
        const orderEventIds = [...new Set(sortedOrders.slice(0, 5).map((o) => o.eventId))];
        const orderEvents = await Promise.all(orderEventIds.map((id) => getEventById(id)));
        const nameMap: Record<string, string> = {};
        orderEventIds.forEach((id, i) => {
          const ev = orderEvents[i] as AnyEvent | undefined;
          nameMap[id] = ev?.title || ev?.name || 'Unknown Event';
        });
        setOrderEventNames(nameMap);

        // Find upcoming events with tickets
        const now = new Date();
        const uniqueTicketEventIds = [...new Set(allTickets.map((t) => t.eventId))];
        const ticketEvents = await Promise.all(uniqueTicketEventIds.map((id) => getEventById(id)));

        const ticketsByEvent: Record<string, AnyTicket[]> = {};
        const upcomingList: AnyEvent[] = [];

        uniqueTicketEventIds.forEach((id, i) => {
          const event = ticketEvents[i] as AnyEvent | undefined;
          if (event && new Date(event.startDate || event.date) > now) {
            const eventTickets = allTickets.filter((t) => t.eventId === id);
            if (eventTickets.length > 0) {
              ticketsByEvent[id] = eventTickets;
              upcomingList.push(event);
            }
          }
        });

        upcomingList.sort((a, b) => new Date(a.startDate || a.date).getTime() - new Date(b.startDate || b.date).getTime());
        setUpcomingTicketsByEvent(ticketsByEvent);
        setUpcomingEvents(upcomingList.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, [user?.id]);

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
                const eventTickets = upcomingTicketsByEvent[event.id] || [];
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
                        {event.title || event.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(event.startDate || event.date).toLocaleDateString('en-US', {
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
              {recentOrders.map((order) => (
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
                        {orderEventNames[order.eventId] || 'Unknown Event'}
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
              ))}
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

      {/* Personalized Recommendations Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Recommended For You
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Personalized events based on your interests
                </p>
              </div>
            </div>
            <Link
              href="/events"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Browse All Events →
            </Link>
          </div>
        </div>
        <div className="p-6">
          <PersonalizedFeedComponent
            onEventClick={(eventId) => {
              window.location.href = `/events/${eventId}`;
            }}
            onRegister={(eventId) => {
              window.location.href = `/events/${eventId}`;
            }}
          />
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

