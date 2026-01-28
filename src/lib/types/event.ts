/**
 * Event type definitions for the Event Management & Ticketing System
 */

export type EventStatus = 'active' | 'inactive' | 'cancelled';
export type TicketTypeCategory = 'vip' | 'regular' | 'early-bird';

export interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  date: Date;
  location: string;
  category: string;
  image: string;
  status: EventStatus;
  ticketTypes: TicketType[];
  totalAttendees: number;
  createdAt: Date;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  type: TicketTypeCategory;
}

export interface EventAnalytics {
  eventId: string;
  totalTicketsSold: number;
  totalRevenue: number;
  salesByTicketType: Record<string, number>;
  salesOverTime: SalesDataPoint[];
}

export interface SalesDataPoint {
  date: Date;
  sales: number;
  revenue: number;
}
