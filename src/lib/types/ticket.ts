/**
 * Ticket type definitions for the Event Management & Ticketing System
 */

export type TicketStatus = 'valid' | 'used' | 'cancelled';

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  status: TicketStatus;
}

export interface OrderTicket {
  id: string;
  ticketTypeId: string;
  quantity: number;
  qrCode: string;
  checkedIn: boolean;
}

export interface TicketDownloadData {
  ticketId: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  ticketType: string;
  attendeeName: string;
  qrCode: string;
  orderDate: Date;
}
