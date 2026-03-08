/**
 * Event type definitions for the Event Management & Ticketing System
 */

export type EventStatus = 'active' | 'inactive' | 'cancelled' | 'draft' | 'published' | 'unpublished';
export type TicketTypeCategory = 'vip' | 'regular' | 'early-bird';

export interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  eventType?: string;
  onlineLink?: string;
  date: Date | string;
  location: string;
  category: string;
  image?: string;
  status: EventStatus;
  ticketTypes: TicketType[];
  totalAttendees: number;
  createdAt: Date | string;
  publishedAt?: Date | string;
  unpublishedAt?: Date | string;
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

