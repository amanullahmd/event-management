/**
 * API Service for all backend data operations
 * All endpoints match backend Spring Boot controllers
 */

import { apiRequest, apiPut, apiPost } from '@/modules/shared-common/utils/api';

// ─── Types matching backend DTOs ────────────────────────────────────────────

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

/** Matches backend UserRoleResponse DTO */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string; // Backend computes: firstName + ' ' + lastName
  role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
  status: string; // Backend: ACTIVE, BLOCKED, INACTIVE
  createdAt: string;
  updatedAt?: string;
}

/** Matches backend EventResponse DTO */
export interface Event {
  id: string;
  name: string;
  title?: string;
  description: string;
  organizerId: string;
  date: Date | string;
  startDate?: string;
  endDate?: string;
  location: string;
  category: string;
  categoryName?: string;
  eventType?: string;
  image?: string;
  imageUrl?: string;
  status: string;
  ticketTypes: TicketType[];
  totalAttendees: number;
  capacity?: number;
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

/** Matches backend admin /admin/orders enriched response */
export interface AdminOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  eventId: string;
  eventName: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

/** Matches backend OrderResponse for customer GET /orders */
export interface Order {
  id: string;
  customerId?: string;
  userId?: string;
  eventId: string;
  items?: OrderItem[];
  tickets?: Ticket[];
  totalAmount: number;
  totalAmountCents?: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  /** Enriched fields returned by some endpoints */
  customerName?: string;
  customerEmail?: string;
  eventName?: string;
}

export interface OrderItem {
  id: string;
  ticketTypeId: string;
  ticketTypeName?: string;
  quantity: number;
  unitPrice?: number;
  priceCents?: number; // backend field name
}

export interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName?: string;
  ticketNumber?: string;
  ticketCode?: string;
  eventTitle?: string;
  attendeeName?: string;
  qrCode: string;
  qrCodeData?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt?: string;
  status: string;
}

/** Spring Boot Page response wrapper */
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Helper: unwrap paginated or array response ─────────────────────────────

function unwrapPageResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'content' in data) {
    return (data as PageResponse<T>).content || [];
  }
  return [];
}

// ─── Users API (Admin) ──────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  return apiRequest('/admin/users');
}

export async function getUserById(id: string): Promise<User | undefined> {
  return apiRequest(`/admin/users/${id}`);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return apiRequest(`/admin/users/email/${encodeURIComponent(email)}`);
}

export async function updateUserRole(userId: string, role: string): Promise<User> {
  return apiRequest('/admin/users/role', {
    method: 'PUT',
    body: JSON.stringify({ userId, role }),
  });
}

export async function updateUserStatus(userId: string, status: string): Promise<User> {
  return apiRequest(`/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ─── Events API ─────────────────────────────────────────────────────────────

export async function getAllEvents(): Promise<Event[]> {
  const data = await apiRequest('/events');
  return unwrapPageResponse<Event>(data);
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return apiRequest(`/events/${id}`);
}

export async function getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
  const data = await apiRequest(`/admin/organizers/${organizerId}/events`);
  return unwrapPageResponse<Event>(data);
}

/** Admin: get ALL events across all organizers, enriched with ticket type data */
export async function getAllAdminEvents(): Promise<Event[]> {
  const organizers = await getAllOrganizers();
  const eventArrays = await Promise.all(
    organizers.map((org) => getEventsByOrganizerId(org.id).catch(() => [] as Event[]))
  );
  const allEvents = eventArrays.flat();

  // Enrich each event with ticket type data (includes sold counts and prices)
  const enriched = await Promise.all(
    allEvents.map(async (event) => {
      const ticketTypes = await getEventTicketTypes(event.id).catch(() => event.ticketTypes || []);
      return { ...event, ticketTypes };
    })
  );
  return enriched;
}

/** Organizer: get own events (all statuses, backend uses JWT to identify organizer) */
export async function getMyEvents(): Promise<Event[]> {
  const data = await apiRequest('/events/my-events');
  return unwrapPageResponse<Event>(data);
}

export async function createEvent(event: Partial<Event>): Promise<Event> {
  return apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function updateEventStatus(eventId: string, status: string): Promise<Event> {
  return apiRequest(`/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Orders API ─────────────────────────────────────────────────────────────

/** Admin: get all orders with enriched customer/event names */
export async function getAllOrders(): Promise<AdminOrder[]> {
  return apiRequest('/admin/orders');
}

/** Customer: get own orders (backend auto-filters by JWT) */
export async function getMyOrders(): Promise<Order[]> {
  const data = await apiRequest('/orders');
  return unwrapPageResponse<Order>(data);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  return apiRequest(`/orders/${id}`);
}

/** @deprecated Use getMyOrders() instead - backend auto-filters by JWT */
export async function getOrdersByCustomerId(_customerId: string): Promise<Order[]> {
  return getMyOrders();
}

export async function updateOrderStatus(orderId: string, status: string): Promise<AdminOrder> {
  return apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function refundOrder(orderId: string, reason?: string): Promise<Order> {
  return apiRequest(`/v1/orders/${orderId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Customer refund request' }),
  });
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

// ─── Promo Code API ──────────────────────────────────────────────────────────

export interface PromoValidationResult {
  valid: boolean;
  message?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  discountAmount?: number;
}

export async function validatePromoCode(
  code: string,
  eventId?: string
): Promise<PromoValidationResult> {
  const params = new URLSearchParams({ code });
  if (eventId) params.append('eventId', eventId);
  return apiRequest(`/checkout/validate-promo-code?${params.toString()}`);
}

// ─── Tickets API ────────────────────────────────────────────────────────────

/** Get current user's tickets (backend auto-filters by JWT) */
export async function getAllTickets(): Promise<Ticket[]> {
  return apiRequest('/tickets');
}

export async function getTicketsByOrderId(orderId: string): Promise<Ticket[]> {
  return apiRequest(`/tickets/order/${orderId}`);
}

export async function getTicketsByCustomerId(_customerId: string): Promise<Ticket[]> {
  return apiRequest('/tickets');
}

export async function getTicketsByEventId(eventId: string): Promise<Ticket[]> {
  return apiRequest(`/tickets/event/${eventId}`);
}

/** Organizer: get a single ticket type by ID */
export async function getTicketTypeById(eventId: string, ticketTypeId: string): Promise<TicketType | null> {
  const tt = await apiRequest(`/events/${eventId}/ticket-types/${ticketTypeId}`) as Record<string, unknown>;
  if (!tt) return null;
  return {
    id: tt.id as string,
    eventId: tt.eventId as string,
    name: tt.name as string,
    price: (tt.price as number) || 0,
    quantity: (tt.quantityLimit as number) || (tt.quantity as number) || 0,
    sold: (tt.quantitySold as number) || (tt.sold as number) || 0,
    type: (tt.category as string) || (tt.type as string) || 'GENERAL',
    saleStartDate: tt.saleStartDate as string | undefined,
    saleEndDate: tt.saleEndDate as string | undefined,
  } as TicketType & { saleStartDate?: string; saleEndDate?: string };
}

/** Organizer: update a ticket type */
export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  data: {
    name?: string;
    category?: string;
    price?: number;
    quantityLimit?: number;
    saleStartDate?: string;
    saleEndDate?: string;
  }
): Promise<TicketType> {
  const result = await apiRequest(`/events/${eventId}/ticket-types/${ticketTypeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }) as Record<string, unknown>;
  return {
    id: result.id as string,
    eventId: result.eventId as string,
    name: result.name as string,
    price: (result.price as number) || 0,
    quantity: (result.quantityLimit as number) || (result.quantity as number) || 0,
    sold: (result.quantitySold as number) || (result.sold as number) || 0,
    type: (result.category as string) || (result.type as string) || 'GENERAL',
  };
}

/** Organizer: delete a ticket type */
export async function deleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
  await apiRequest(`/events/${eventId}/ticket-types/${ticketTypeId}`, { method: 'DELETE' });
}

/** Public: get ticket types for an event (no auth required) */
export async function getEventTicketTypes(eventId: string): Promise<TicketType[]> {
  const data = await apiRequest(`/events/${eventId}/ticket-types`);
  if (!Array.isArray(data)) return [];
  // Map backend TicketTypeResponse fields to frontend TicketType interface
  return data.map((tt: Record<string, unknown>) => ({
    id: tt.id as string,
    eventId: tt.eventId as string,
    name: tt.name as string,
    price: (tt.price as number) || 0,
    quantity: (tt.quantityLimit as number) || (tt.quantity as number) || 0,
    sold: (tt.quantitySold as number) || (tt.sold as number) || 0,
    type: (tt.category as string) || (tt.type as string) || 'GENERAL',
  }));
}

/** Organizer: create a ticket type for an event */
export async function createTicketType(
  eventId: string,
  data: {
    name: string;
    category: string;
    price: number;
    quantityLimit: number;
    saleStartDate?: string;
    saleEndDate?: string;
  }
): Promise<TicketType> {
  const result = await apiRequest(`/events/${eventId}/ticket-types`, {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Record<string, unknown>;
  return {
    id: result.id as string,
    eventId: result.eventId as string,
    name: result.name as string,
    price: (result.price as number) || 0,
    quantity: (result.quantityLimit as number) || (result.quantity as number) || 0,
    sold: (result.quantitySold as number) || (result.sold as number) || 0,
    type: (result.category as string) || (result.type as string) || 'GENERAL',
  };
}

export async function updateTicketCheckIn(ticketId: string, checkedIn: boolean): Promise<Ticket> {
  return apiRequest(`/tickets/${ticketId}/checkin`, {
    method: 'PUT',
    body: JSON.stringify({ checkedIn }),
  });
}

export async function getTicketByQrCode(qrCode: string): Promise<Ticket | undefined> {
  return apiRequest(`/tickets/qr/${encodeURIComponent(qrCode)}`);
}

export async function getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
  return apiRequest(`/tickets/number/${encodeURIComponent(ticketNumber)}`);
}

// ─── Dashboard Metrics (Admin) ──────────────────────────────────────────────

export async function getDashboardMetrics(startDate?: string, endDate?: string): Promise<any> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const qs = params.toString();
  return apiRequest(`/admin/dashboard/metrics${qs ? '?' + qs : ''}`);
}

export async function getDashboardData() {
  const [metricsData, usersData] = await Promise.all([
    getDashboardMetrics(),
    getAllUsers()
  ]);
  return { metrics: metricsData, users: usersData };
}

// ─── Refunds API ────────────────────────────────────────────────────────────

export async function getAllRefunds(): Promise<RefundRequest[]> {
  return apiRequest('/admin/refunds');
}

export async function getRefundsByEventId(eventId: string): Promise<RefundRequest[]> {
  return apiRequest(`/admin/refunds/event/${eventId}`);
}

export async function updateRefundStatus(refundId: string, status: string): Promise<RefundRequest> {
  return apiRequest(`/admin/refunds/${refundId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ─── Organizer Refund Request API ───────────────────────────────────────────

export interface RefundRequestItem {
  id: string;
  ticketId: string;
  eventId: string;
  status: string;
  reason: string;
  refundAmount: number;
  originalAmount: number;
  refundPercentage: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface RefundPolicy {
  id?: string;
  eventId: string;
  refundWindowDays: number;
  refundPercentage: number;
  isActive: boolean;
  isDefault?: boolean;
  updatedAt?: string;
}

export interface RefundEligibility {
  eligible: boolean;
  reason?: string;
  refundPercentage?: number;
  windowDays?: number;
  deadline?: string;
  deadlineDate?: string;
}

export async function getRefundPolicy(eventId: string): Promise<RefundPolicy> {
  return apiRequest(`/v1/events/${eventId}/refund-policy`);
}

export async function upsertRefundPolicy(eventId: string, policy: {
  refundWindowDays: number;
  refundPercentage: number;
  isActive: boolean;
}): Promise<RefundPolicy> {
  return apiRequest(`/v1/events/${eventId}/refund-policy`, {
    method: 'PUT',
    body: JSON.stringify(policy),
  });
}

export async function getRefundEligibility(orderId: string): Promise<RefundEligibility> {
  try {
    return await apiRequest(`/v1/orders/${orderId}/refund-eligibility`);
  } catch {
    return { eligible: false, reason: 'Unable to check eligibility' };
  }
}

export async function getEventRefundRequests(eventId: string, status?: string): Promise<RefundRequestItem[]> {
  const url = status
    ? `/v1/events/${eventId}/refund-requests?status=${encodeURIComponent(status)}`
    : `/v1/events/${eventId}/refund-requests`;
  const data = await apiRequest(url);
  return Array.isArray(data) ? data : [];
}

export async function approveRefundRequest(requestId: string, note?: string): Promise<RefundRequestItem> {
  return apiRequest(`/v1/refund-requests/${requestId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function rejectRefundRequest(requestId: string, reason?: string): Promise<RefundRequestItem> {
  return apiRequest(`/v1/refund-requests/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function submitTicketRefundRequest(ticketId: string, reason: string): Promise<RefundRequestItem> {
  return apiRequest(`/v1/tickets/${ticketId}/refund-request`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ─── Organizers API (Admin) ─────────────────────────────────────────────────

export async function getAllOrganizers(): Promise<User[]> {
  return apiRequest('/admin/organizers');
}

export async function getOrganizerById(id: string): Promise<User | undefined> {
  return apiRequest(`/admin/organizers/${id}`);
}

export async function approveOrganizer(organizerId: string): Promise<User> {
  return apiRequest(`/admin/organizers/${organizerId}/approve`, {
    method: 'POST',
  });
}

export async function rejectOrganizer(organizerId: string, reason?: string): Promise<User> {
  return apiRequest(`/admin/organizers/${organizerId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || '' }),
  });
}

/** @deprecated Use approveOrganizer/rejectOrganizer instead */
export async function updateOrganizerVerificationStatus(organizerId: string, status: string): Promise<User> {
  if (status === 'approved' || status === 'verified') {
    return approveOrganizer(organizerId);
  }
  return rejectOrganizer(organizerId);
}

// ─── Profile API ────────────────────────────────────────────────────────────

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<any> {
  return apiPut('/auth/profile', data);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<any> {
  return apiPost('/auth/change-password', data);
}
