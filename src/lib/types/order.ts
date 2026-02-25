export interface OrderItemResponse {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  priceCents: number;
  currency: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  totalAmountCents: number;
  currency: string;
  stripePaymentIntentId?: string;
  clientSecret?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmationResponse {
  orderId: string;
  orderDate: string;
  orderStatus: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  items: OrderItemResponse[];
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedPromoCode?: string;
  eventName: string;
  eventDate: string;
  instructions: string;
}

export interface OrderTicketItem {
  qrCode: string;
  checkedIn: boolean;
  quantity: number;
  ticketTypeId: string;
}

export type OrderStatus = 'completed' | 'pending' | 'refunded' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  eventId: string;
  createdAt: Date;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  tickets: OrderTicketItem[];
}

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  eventId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: Date;
  processedAt?: Date;
}
