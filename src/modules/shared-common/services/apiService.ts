/**
 * API Service for all backend data operations
 * Replaces dummy-data with real API calls
 */

import { apiRequest } from '@/modules/shared-common/utils/api';

// Types
// Types for API responses
export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  eventId: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: Date;
  processedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  date: Date | string;
  location: string;
  category: string;
  image?: string;
  status: 'active' | 'inactive' | 'cancelled';
  ticketTypes: TicketType[];
  totalAttendees: number;
  createdAt: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  type: string;
}

export interface Order {
  id: string;
  customerId: string;
  eventId: string;
  tickets: Ticket[];
  totalAmount: number;
  status: 'completed' | 'pending' | 'refunded' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  status: 'used' | 'valid';
}

// Users API
export async function getAllUsers(): Promise<User[]> {
  return apiRequest('/api/admin/users');
}

export async function getUserById(id: string): Promise<User | undefined> {
  return apiRequest(`/api/admin/users/${id}`);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return apiRequest(`/api/admin/users/email/${encodeURIComponent(email)}`);
}

export async function updateUserRole(userId: string, role: string): Promise<User> {
  return apiRequest('/api/admin/users/role', {
    method: 'PUT',
    body: JSON.stringify({ userId, role }),
  });
}

// Events API
export async function getAllEvents(): Promise<Event[]> {
  return apiRequest('/api/events');
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return apiRequest(`/api/events/${id}`);
}

export async function getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
  return apiRequest(`/api/admin/organizers/${organizerId}/events`);
}

// Orders API
export async function getAllOrders(): Promise<Order[]> {
  return apiRequest('/api/admin/orders');
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  return apiRequest(`/api/orders/${id}`);
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  return apiRequest(`/api/orders/customer/${customerId}`);
}

// Tickets API
export async function getAllTickets(): Promise<Ticket[]> {
  return apiRequest('/api/tickets');
}

export async function getTicketsByOrderId(orderId: string): Promise<Ticket[]> {
  return apiRequest(`/api/tickets/order/${orderId}`);
}

export async function getTicketsByCustomerId(customerId: string): Promise<Ticket[]> {
  return apiRequest(`/api/tickets/customer/${customerId}`);
}

export async function getTicketsByEventId(eventId: string): Promise<Ticket[]> {
  return apiRequest(`/api/tickets/event/${eventId}`);
}

// Dashboard Metrics
export async function getDashboardMetrics(startDate?: string, endDate?: string): Promise<any> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  return apiRequest(`/api/admin/dashboard/metrics?${params.toString()}`);
}

// Create operations
export async function createOrder(order: Omit<Order, 'id'>): Promise<Order> {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  return apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

// Utility functions for dashboard
export async function getDashboardData() {
  try {
    const [metricsData, usersData] = await Promise.all([
      getDashboardMetrics(),
      getAllUsers()
    ]);
    
    return {
      metrics: metricsData,
      users: usersData
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// Refunds API
export async function getAllRefunds(): Promise<RefundRequest[]> {
  return apiRequest('/api/admin/refunds');
}

export async function getRefundsByEventId(eventId: string): Promise<RefundRequest[]> {
  return apiRequest(`/api/admin/refunds/event/${eventId}`);
}

export async function updateRefundStatus(refundId: string, status: string): Promise<RefundRequest> {
  return apiRequest(`/api/admin/refunds/${refundId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// Organizers API
export async function getAllOrganizers(): Promise<User[]> {
  return apiRequest('/api/admin/organizers');
}

export async function getOrganizerById(id: string): Promise<User | undefined> {
  return apiRequest(`/api/admin/organizers/${id}`);
}

export async function updateOrganizerVerificationStatus(organizerId: string, status: string): Promise<User> {
  return apiRequest(`/api/admin/organizers/${organizerId}/verification`, {
    method: 'PUT',
    body: JSON.stringify({ verificationStatus: status }),
  });
}

// Users API
export async function updateUserStatus(userId: string, status: string): Promise<User> {
  return apiRequest(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function updateTicketCheckIn(ticketId: string, checkedIn: boolean): Promise<Ticket> {
  return apiRequest(`/api/tickets/${ticketId}/checkin`, {
    method: 'PUT',
    body: JSON.stringify({ checkedIn }),
  });
}

export async function getTicketByQrCode(qrCode: string): Promise<Ticket | undefined> {
  return apiRequest(`/api/tickets/qr/${qrCode}`);
}

// Events API
export async function updateEventStatus(eventId: string, status: string): Promise<Event> {
  return apiRequest(`/api/admin/events/${eventId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// Orders API
export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

