/**
 * Order type definitions for the Event Management & Ticketing System
 */

import type { OrderTicket } from './ticket';

export type OrderStatus = 'completed' | 'pending' | 'refunded' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Order {
  id: string;
  customerId: string;
  eventId: string;
  tickets: OrderTicket[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  reason: string;
  status: RefundStatus;
  amount: number;
  requestedAt: Date;
  processedAt?: Date;
}

export interface OrderSummary {
  subtotal: number;
  fees: number;
  tax: number;
  total: number;
}

export interface CheckinStats {
  totalTickets: number;
  checkedIn: number;
  remaining: number;
  checkinPercentage: number;
}
