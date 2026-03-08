/**
 * Refund-related type definitions
 */

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum RefundReason {
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  EVENT_POSTPONED = 'EVENT_POSTPONED',
  DUPLICATE_PURCHASE = 'DUPLICATE_PURCHASE',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  OTHER = 'OTHER',
}

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

export interface RefundPolicy {
  id: string;
  eventId: string;
  refundablePercentage: number;
  refundDeadlineDays: number;
  allowPartialRefunds: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundResponse {
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
