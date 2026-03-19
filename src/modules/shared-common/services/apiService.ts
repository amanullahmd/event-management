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

// ─── Organization & Team Management API (KAN-203) ───────────────────────────

export interface Organization {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  logoUrl?: string;
  websiteUrl?: string;
  status: string;
  memberCount: number;
  members?: OrganizationMember[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';
  permissions: string;
  status: string;
  joinedAt?: string;
}

export interface OrganizationInvitation {
  id: string;
  invitedEmail: string;
  role: string;
  invitedAt: string;
  expiresAt: string;
  status: string;
}

export async function createOrganization(data: {
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}): Promise<Organization> {
  return apiRequest('/organizations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyOrganizations(): Promise<Organization[]> {
  const data = await apiRequest('/organizations');
  return Array.isArray(data) ? data : [];
}

export async function getOrganization(orgId: string): Promise<Organization> {
  return apiRequest(`/organizations/${orgId}`);
}

export async function updateOrganization(orgId: string, data: {
  name?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}): Promise<Organization> {
  return apiRequest(`/organizations/${orgId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await apiRequest(`/organizations/${orgId}`, { method: 'DELETE' });
}

export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const data = await apiRequest(`/organizations/${orgId}/members`);
  return Array.isArray(data) ? data : [];
}

export async function updateMemberRole(orgId: string, memberId: string, role: string): Promise<OrganizationMember> {
  return apiRequest(`/organizations/${orgId}/members/${memberId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function removeMember(orgId: string, memberId: string): Promise<void> {
  await apiRequest(`/organizations/${orgId}/members/${memberId}`, { method: 'DELETE' });
}

export async function inviteMember(orgId: string, data: {
  email: string;
  role?: string;
}): Promise<{ invitationId: string; invitationToken: string; invitedEmail: string; role: string; expiresAt: string; message: string }> {
  return apiRequest(`/organizations/${orgId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPendingInvitations(orgId: string): Promise<OrganizationInvitation[]> {
  const data = await apiRequest(`/organizations/${orgId}/invitations`);
  return Array.isArray(data) ? data : [];
}

export async function cancelInvitation(orgId: string, invitationId: string): Promise<void> {
  await apiRequest(`/organizations/${orgId}/invitations/${invitationId}`, { method: 'DELETE' });
}

export async function acceptInvitation(token: string): Promise<OrganizationMember> {
  return apiRequest(`/organizations/invitations/accept/${token}`, { method: 'POST' });
}

// ─── Ticket Resale Marketplace API (KAN-207) ────────────────────────────────

export interface ResaleListing {
  id: string;
  ticketId: string;
  ticketNumber?: string;
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  sellerId: string;
  sellerName?: string;
  originalPrice: number;
  resalePrice: number;
  platformFee: number;
  sellerPayout: number;
  currency: string;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  sellerNote?: string;
  ticketTypeName?: string;
  createdAt: string;
  soldAt?: string;
}

export async function createResaleListing(data: {
  ticketId: string;
  resalePrice: number;
  sellerNote?: string;
}): Promise<ResaleListing> {
  return apiRequest('/resale/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getActiveResaleListings(page = 0, size = 20): Promise<ResaleListing[]> {
  const data = await apiRequest(`/resale/listings?page=${page}&size=${size}`);
  return Array.isArray(data) ? data : [];
}

export async function getResaleListingsByEvent(eventId: string): Promise<ResaleListing[]> {
  const data = await apiRequest(`/resale/listings/event/${eventId}`);
  return Array.isArray(data) ? data : [];
}

export async function getMyResaleListings(): Promise<ResaleListing[]> {
  const data = await apiRequest('/resale/listings/my');
  return Array.isArray(data) ? data : [];
}

export async function purchaseResaleListing(listingId: string): Promise<ResaleListing> {
  return apiRequest(`/resale/listings/${listingId}/purchase`, { method: 'POST' });
}

export async function cancelResaleListing(listingId: string): Promise<void> {
  await apiRequest(`/resale/listings/${listingId}`, { method: 'DELETE' });
}

// ─── Admin Team API (KAN-205/KAN-214) ────────────────────────────────────────

export interface AdminTeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'SUPER_ADMIN' | 'ADMIN_MEMBER';
  permSupport: boolean;
  permUsers: boolean;
  permEvents: boolean;
  permOrganizers: boolean;
  permContent: boolean;
  permAnalytics: boolean;
  permSettings: boolean;
  status: string;
  joinedAt: string;
}

export async function getAdminTeamMembers(): Promise<AdminTeamMember[]> {
  const data = await apiRequest('/admin/team');
  return Array.isArray(data) ? data : [];
}

export async function getMyAdminMembership(): Promise<AdminTeamMember | null> {
  try {
    return await apiRequest('/admin/team/me');
  } catch {
    return null;
  }
}

export async function addAdminTeamMember(data: {
  userEmail: string;
  permSupport?: boolean;
  permUsers?: boolean;
  permEvents?: boolean;
  permOrganizers?: boolean;
  permContent?: boolean;
  permAnalytics?: boolean;
  permSettings?: boolean;
}): Promise<AdminTeamMember> {
  return apiRequest('/admin/team', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAdminMemberPermissions(memberId: string, data: {
  permSupport?: boolean;
  permUsers?: boolean;
  permEvents?: boolean;
  permOrganizers?: boolean;
  permContent?: boolean;
  permAnalytics?: boolean;
  permSettings?: boolean;
}): Promise<AdminTeamMember> {
  return apiRequest(`/admin/team/${memberId}/permissions`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function removeAdminTeamMember(memberId: string): Promise<void> {
  await apiRequest(`/admin/team/${memberId}`, { method: 'DELETE' });
}

// ─── Support Ticket API (KAN-208/KAN-220) ────────────────────────────────────

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  assignedTo?: string;
  assignedToName?: string;
  messageCount: number;
  messages?: SupportMessage[];
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  internalNote: boolean;
  createdAt: string;
}

export async function createSupportTicket(data: {
  subject: string;
  category: string;
  priority?: string;
  description: string;
}): Promise<SupportTicket> {
  return apiRequest('/support/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMySupportTickets(): Promise<SupportTicket[]> {
  const data = await apiRequest('/support/tickets/my');
  return Array.isArray(data) ? data : [];
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  const data = await apiRequest('/support/tickets');
  return Array.isArray(data) ? data : [];
}

export async function getSupportTicket(ticketId: string): Promise<SupportTicket> {
  return apiRequest(`/support/tickets/${ticketId}`);
}

export async function sendSupportMessage(ticketId: string, content: string): Promise<SupportMessage> {
  return apiRequest(`/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function updateSupportTicketStatus(ticketId: string, status: string): Promise<SupportTicket> {
  return apiRequest(`/support/tickets/${ticketId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function assignSupportTicket(ticketId: string): Promise<SupportTicket> {
  return apiRequest(`/support/tickets/${ticketId}/assign`, { method: 'PUT', body: '{}' });
}

export async function getSupportStats(): Promise<Record<string, number>> {
  return apiRequest('/support/tickets/stats');
}

// ─── Team Chat API (KAN-204/KAN-212) ─────────────────────────────────────────

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  roomType: string;
  organizationId?: string;
  messageCount: number;
  lastMessage?: ChatMessage;
  messages: ChatMessage[];
  createdAt: string;
}

export async function getOrgChatRoom(organizationId: string, limit = 50): Promise<ChatRoom> {
  return apiRequest(`/chat/rooms/org/${organizationId}?limit=${limit}`);
}

export async function initOrgChatRoom(organizationId: string, orgName: string): Promise<ChatRoom> {
  return apiRequest(`/chat/rooms/org/${organizationId}`, {
    method: 'POST',
    body: JSON.stringify({ name: orgName }),
  });
}

export async function getAdminChatRoom(limit = 50): Promise<ChatRoom> {
  return apiRequest(`/chat/rooms/admin?limit=${limit}`);
}

export async function sendChatMessage(roomId: string, content: string): Promise<ChatMessage> {
  return apiRequest(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ─── Video Notifications API (KAN-206/KAN-216) ───────────────────────────────

export interface VideoNotification {
  id: string;
  eventId: string;
  eventTitle: string;
  uploaderId: string;
  uploaderName: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewNote?: string;
  deliveryCount: number;
  reviewedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export async function uploadVideoNotification(
  eventId: string,
  title: string,
  description: string,
  videoFile: File
): Promise<VideoNotification> {
  const formData = new FormData();
  formData.append('eventId', eventId);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('video', videoFile);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    : null;

  const response = await fetch(`${API_BASE_URL}/api/video-notifications/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export async function getMyVideoNotifications(): Promise<VideoNotification[]> {
  const data = await apiRequest('/video-notifications/my');
  return Array.isArray(data) ? data : [];
}

export async function getVideoNotificationsByEvent(eventId: string): Promise<VideoNotification[]> {
  const data = await apiRequest(`/video-notifications/event/${eventId}`);
  return Array.isArray(data) ? data : [];
}

export async function getAllVideoNotifications(): Promise<VideoNotification[]> {
  const data = await apiRequest('/video-notifications');
  return Array.isArray(data) ? data : [];
}

export async function getPendingVideoNotifications(): Promise<VideoNotification[]> {
  const data = await apiRequest('/video-notifications/pending');
  return Array.isArray(data) ? data : [];
}

export async function reviewVideoNotification(
  videoId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNote?: string
): Promise<VideoNotification> {
  return apiRequest(`/video-notifications/${videoId}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, reviewNote }),
  });
}
