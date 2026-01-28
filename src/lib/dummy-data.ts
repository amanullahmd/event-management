/**
 * Dummy Data Module
 * 
 * This module provides mock data and CRUD operations for the Event Management
 * & Ticketing System frontend. All data is stored in-memory and resets on page refresh.
 * 
 * ## Demo Credentials
 * 
 * ### Admin Account
 * - Email: admin@example.com
 * - Password: admin123
 * 
 * ### Organizer Account
 * - Email: organizer1@example.com
 * - Password: organizer123
 * 
 * ### Customer Account
 * - Email: customer1@example.com
 * - Password: customer123
 * 
 * ## Data Types
 * - Users: Admin, organizer, and customer accounts
 * - Organizers: Business profiles with verification status
 * - Events: Event listings with ticket types
 * - Orders: Customer purchases with tickets
 * - Tickets: Individual tickets with QR codes
 * - Refunds: Refund requests and processing
 * 
 * ## Usage
 * ```typescript
 * import { getAllEvents, getEventById, createOrder } from '@/lib/dummy-data';
 * 
 * // Get all events
 * const events = getAllEvents();
 * 
 * // Get specific event
 * const event = getEventById('event-1');
 * 
 * // Create an order
 * const order = createOrder({ ... });
 * ```
 * 
 * ## Resetting Data
 * Call `resetDummyData()` to restore all data to initial state.
 * 
 * @module dummy-data
 */

import type {
  User,
  OrganizerProfile,
  Event,
  TicketType,
  Order,
  Ticket,
  RefundRequest,
} from './types';

// ============================================================================
// DUMMY DATA STORAGE (In-memory state)
// ============================================================================

/** In-memory storage for user accounts */
let dummyUsers: User[] = [];
/** In-memory storage for organizer profiles */
let dummyOrganizers: OrganizerProfile[] = [];
/** In-memory storage for events */
let dummyEvents: Event[] = [];
/** In-memory storage for orders */
let dummyOrders: Order[] = [];
/** In-memory storage for tickets */
let dummyTickets: Ticket[] = [];
/** In-memory storage for refund requests */
let dummyRefunds: RefundRequest[] = [];

// ============================================================================
// DATA GENERATORS
// ============================================================================

/**
 * Generate realistic dummy users
 */
function generateUsers(): User[] {
  const firstNames = [
    'John',
    'Jane',
    'Michael',
    'Sarah',
    'David',
    'Emma',
    'Robert',
    'Lisa',
    'James',
    'Mary',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
  ];

  const users: User[] = [];

  // Create admin user
  users.push({
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-01'),
  });

  // Create customer users
  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    users.push({
      id: `customer-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `customer${i + 1}@example.com`,
      role: 'customer',
      status: Math.random() > 0.1 ? 'active' : 'blocked',
      createdAt: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
    });
  }

  return users;
}

/**
 * Generate realistic dummy organizers
 */
function generateOrganizers(): OrganizerProfile[] {
  const businessNames = [
    'Tech Events Inc',
    'Music Festivals Ltd',
    'Sports Management Co',
    'Entertainment Plus',
    'Conference Organizers',
    'Festival Productions',
    'Event Masters',
    'Creative Events',
  ];

  const organizers: OrganizerProfile[] = [];

  for (let i = 0; i < 8; i++) {
    organizers.push({
      id: `organizer-${i + 1}`,
      name: `Organizer ${i + 1}`,
      email: `organizer${i + 1}@example.com`,
      role: 'organizer',
      status: 'active',
      businessName: businessNames[i],
      verificationStatus:
        i < 5 ? 'verified' : i < 7 ? 'pending' : 'rejected',
      documents: [
        {
          id: `doc-${i}-1`,
          name: 'Business License',
          url: '/documents/license.pdf',
          type: 'license',
          uploadedAt: new Date(),
        },
      ],
      commissionRate: 0.1,
      createdAt: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
    });
  }

  return organizers;
}

/**
 * Generate realistic dummy events
 */
function generateEvents(): Event[] {
  const eventNames = [
    'Tech Conference 2024',
    'Summer Music Festival',
    'Web Development Workshop',
    'Annual Sports Championship',
    'Digital Marketing Summit',
    'AI & Machine Learning Expo',
    'Startup Pitch Event',
    'Creative Design Conference',
    'Cloud Computing Bootcamp',
    'Blockchain Innovation Summit',
  ];

  const locations = [
    'New York, NY',
    'San Francisco, CA',
    'Los Angeles, CA',
    'Chicago, IL',
    'Boston, MA',
    'Seattle, WA',
    'Austin, TX',
    'Denver, CO',
  ];

  const categories = [
    'Technology',
    'Music',
    'Sports',
    'Business',
    'Education',
    'Entertainment',
  ];

  const events: Event[] = [];

  for (let i = 0; i < 10; i++) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 90) + 1);

    const ticketTypes: TicketType[] = [
      {
        id: `ticket-type-${i}-1`,
        eventId: `event-${i + 1}`,
        name: 'Early Bird',
        price: 49.99,
        quantity: 100,
        sold: Math.floor(Math.random() * 80),
        type: 'early-bird',
      },
      {
        id: `ticket-type-${i}-2`,
        eventId: `event-${i + 1}`,
        name: 'Regular',
        price: 79.99,
        quantity: 200,
        sold: Math.floor(Math.random() * 150),
        type: 'regular',
      },
      {
        id: `ticket-type-${i}-3`,
        eventId: `event-${i + 1}`,
        name: 'VIP',
        price: 149.99,
        quantity: 50,
        sold: Math.floor(Math.random() * 40),
        type: 'vip',
      },
    ];

    const totalSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);

    events.push({
      id: `event-${i + 1}`,
      name: eventNames[i],
      description: `Join us for an amazing ${eventNames[i]} experience. This event features industry experts, networking opportunities, and hands-on workshops.`,
      organizerId: `organizer-${(i % 8) + 1}`,
      date: eventDate,
      location: locations[i % locations.length],
      category: categories[i % categories.length],
      image: `/images/event-${i + 1}.jpg`,
      status: i < 8 ? 'active' : 'inactive',
      ticketTypes,
      totalAttendees: totalSold,
      createdAt: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
    });
  }

  return events;
}

/**
 * Generate realistic dummy orders
 */
function generateOrders(events: Event[]): Order[] {
  const orders: Order[] = [];
  const paymentMethods = [
    'credit_card',
    'debit_card',
    'paypal',
    'bank_transfer',
  ] as const;

  for (let i = 0; i < 20; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const ticketType =
      event.ticketTypes[
        Math.floor(Math.random() * event.ticketTypes.length)
      ];
    const quantity = Math.floor(Math.random() * 4) + 1;

    const orderTickets = [];
    for (let j = 0; j < quantity; j++) {
      orderTickets.push({
        id: `order-ticket-${i}-${j}`,
        ticketTypeId: ticketType.id,
        quantity: 1,
        qrCode: `QR-${i}-${j}-${Math.random().toString(36).substr(2, 9)}`,
        checkedIn: Math.random() > 0.7,
      });
    }

    orders.push({
      id: `order-${i + 1}`,
      customerId: `customer-${(i % 15) + 1}`,
      eventId: event.id,
      tickets: orderTickets,
      totalAmount: ticketType.price * quantity + 10,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      createdAt: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
      updatedAt: new Date(),
    });
  }

  return orders;
}

/**
 * Generate realistic dummy tickets
 */
function generateTickets(orders: Order[]): Ticket[] {
  const tickets: Ticket[] = [];

  orders.forEach((order) => {
    order.tickets.forEach((orderTicket, index) => {
      tickets.push({
        id: `ticket-${order.id}-${index}`,
        orderId: order.id,
        eventId: order.eventId,
        ticketTypeId: orderTicket.ticketTypeId,
        qrCode: orderTicket.qrCode,
        checkedIn: orderTicket.checkedIn,
        checkedInAt: orderTicket.checkedIn ? new Date() : undefined,
        status: orderTicket.checkedIn ? 'used' : 'valid',
      });
    });
  });

  return tickets;
}

/**
 * Generate realistic dummy refunds
 */
function generateRefunds(orders: Order[]): RefundRequest[] {
  const refunds: RefundRequest[] = [];

  for (let i = 0; i < 5; i++) {
    const order = orders[Math.floor(Math.random() * orders.length)];
    refunds.push({
      id: `refund-${i + 1}`,
      orderId: order.id,
      customerId: order.customerId,
      reason: 'Cannot attend event',
      status: ['pending', 'approved', 'rejected', 'completed'][
        Math.floor(Math.random() * 4)
      ] as any,
      amount: order.totalAmount,
      requestedAt: new Date(),
      processedAt: Math.random() > 0.5 ? new Date() : undefined,
    });
  }

  return refunds;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all dummy data
 */
export function initializeDummyData(): void {
  dummyUsers = generateUsers();
  dummyOrganizers = generateOrganizers();
  dummyEvents = generateEvents();
  dummyOrders = generateOrders(dummyEvents);
  dummyTickets = generateTickets(dummyOrders);
  dummyRefunds = generateRefunds(dummyOrders);
}

// Initialize on module load
initializeDummyData();

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all users in the system
 * @returns Array of all user objects (copy to prevent mutation)
 * @example
 * const users = getAllUsers();
 * const activeUsers = users.filter(u => u.status === 'active');
 */
export function getAllUsers(): User[] {
  return [...dummyUsers];
}

/**
 * Find a user by their unique ID
 * @param id - The user's unique identifier
 * @returns The user object if found, undefined otherwise
 * @example
 * const user = getUserById('customer-1');
 * if (user) console.log(user.name);
 */
export function getUserById(id: string): User | undefined {
  return dummyUsers.find((u) => u.id === id);
}

/**
 * Find a user by their email address
 * @param email - The user's email address
 * @returns The user object if found, undefined otherwise
 * @example
 * const user = getUserByEmail('admin@example.com');
 */
export function getUserByEmail(email: string): User | undefined {
  return dummyUsers.find((u) => u.email === email);
}

/**
 * Get all organizer profiles
 * @returns Array of all organizer profiles with business information
 */
export function getAllOrganizers(): OrganizerProfile[] {
  return [...dummyOrganizers];
}

/**
 * Find an organizer by their unique ID
 * @param id - The organizer's unique identifier
 * @returns The organizer profile if found, undefined otherwise
 */
export function getOrganizerById(id: string): OrganizerProfile | undefined {
  return dummyOrganizers.find((o) => o.id === id);
}

/**
 * Get all events in the system
 * @returns Array of all event objects with ticket types
 */
export function getAllEvents(): Event[] {
  return [...dummyEvents];
}

/**
 * Find an event by its unique ID
 * @param id - The event's unique identifier
 * @returns The event object if found, undefined otherwise
 */
export function getEventById(id: string): Event | undefined {
  return dummyEvents.find((e) => e.id === id);
}

/**
 * Get all events created by a specific organizer
 * @param organizerId - The organizer's unique identifier
 * @returns Array of events belonging to the organizer
 */
export function getEventsByOrganizerId(organizerId: string): Event[] {
  return dummyEvents.filter((e) => e.organizerId === organizerId);
}

/**
 * Get all orders
 */
export function getAllOrders(): Order[] {
  return [...dummyOrders];
}

/**
 * Get order by ID
 */
export function getOrderById(id: string): Order | undefined {
  return dummyOrders.find((o) => o.id === id);
}

/**
 * Get orders by customer ID
 */
export function getOrdersByCustomerId(customerId: string): Order[] {
  return dummyOrders.filter((o) => o.customerId === customerId);
}

/**
 * Get all tickets
 */
export function getAllTickets(): Ticket[] {
  return [...dummyTickets];
}

/**
 * Get tickets by order ID
 */
export function getTicketsByOrderId(orderId: string): Ticket[] {
  return dummyTickets.filter((t) => t.orderId === orderId);
}

/**
 * Get tickets by customer ID
 */
export function getTicketsByCustomerId(customerId: string): Ticket[] {
  const customerOrders = dummyOrders.filter((o) => o.customerId === customerId);
  const orderIds = customerOrders.map((o) => o.id);
  return dummyTickets.filter((t) => orderIds.includes(t.orderId));
}

/**
 * Get ticket by QR code
 */
export function getTicketByQrCode(qrCode: string): Ticket | undefined {
  return dummyTickets.find((t) => t.qrCode === qrCode);
}

/**
 * Get tickets by event ID
 */
export function getTicketsByEventId(eventId: string): Ticket[] {
  return dummyTickets.filter((t) => t.eventId === eventId);
}

/**
 * Get all refunds
 */
export function getAllRefunds(): RefundRequest[] {
  return [...dummyRefunds];
}

/**
 * Get refunds by order ID
 */
export function getRefundsByOrderId(orderId: string): RefundRequest[] {
  return dummyRefunds.filter((r) => r.orderId === orderId);
}

/**
 * Get refunds by event ID
 */
export function getRefundsByEventId(eventId: string): RefundRequest[] {
  const eventOrders = dummyOrders.filter((o) => o.eventId === eventId);
  const orderIds = eventOrders.map((o) => o.id);
  return dummyRefunds.filter((r) => orderIds.includes(r.orderId));
}

// ============================================================================
// UPDATE FUNCTIONS
// ============================================================================

/**
 * Update user status
 */
export function updateUserStatus(
  userId: string,
  status: 'active' | 'blocked'
): User | undefined {
  const user = dummyUsers.find((u) => u.id === userId);
  if (user) {
    user.status = status;
  }
  return user;
}

/**
 * Update user role
 */
export function updateUserRole(
  userId: string,
  role: 'admin' | 'organizer' | 'customer'
): User | undefined {
  const user = dummyUsers.find((u) => u.id === userId);
  if (user) {
    user.role = role;
  }
  return user;
}

/**
 * Update organizer verification status
 */
export function updateOrganizerVerificationStatus(
  organizerId: string,
  status: 'pending' | 'verified' | 'rejected'
): OrganizerProfile | undefined {
  const organizer = dummyOrganizers.find((o) => o.id === organizerId);
  if (organizer) {
    organizer.verificationStatus = status;
  }
  return organizer;
}

/**
 * Update event status
 */
export function updateEventStatus(
  eventId: string,
  status: 'active' | 'inactive' | 'cancelled'
): Event | undefined {
  const event = dummyEvents.find((e) => e.id === eventId);
  if (event) {
    event.status = status;
  }
  return event;
}

/**
 * Update order status
 */
export function updateOrderStatus(
  orderId: string,
  status: 'completed' | 'pending' | 'refunded' | 'cancelled'
): Order | undefined {
  const order = dummyOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date();
  }
  return order;
}

/**
 * Update ticket check-in status
 */
export function updateTicketCheckIn(
  ticketId: string,
  checkedIn: boolean
): Ticket | undefined {
  const ticket = dummyTickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.checkedIn = checkedIn;
    ticket.checkedInAt = checkedIn ? new Date() : undefined;
    ticket.status = checkedIn ? 'used' : 'valid';
  }
  return ticket;
}

/**
 * Create new event
 */
export function createEvent(event: Omit<Event, 'id' | 'createdAt'>): Event {
  const newEvent: Event = {
    ...event,
    id: `event-${dummyEvents.length + 1}`,
    createdAt: new Date(),
  };
  dummyEvents.push(newEvent);
  return newEvent;
}

/**
 * Create new order
 */
export function createOrder(order: Omit<Order, 'id' | 'updatedAt'>): Order {
  const newOrder: Order = {
    ...order,
    id: `order-${dummyOrders.length + 1}`,
    updatedAt: new Date(),
  };
  dummyOrders.push(newOrder);

  // Create tickets for the order
  order.tickets.forEach((ticket, index) => {
    const newTicket: Ticket = {
      id: `ticket-${newOrder.id}-${index}`,
      orderId: newOrder.id,
      eventId: newOrder.eventId,
      ticketTypeId: ticket.ticketTypeId,
      qrCode: ticket.qrCode,
      checkedIn: false,
      status: 'valid',
    };
    dummyTickets.push(newTicket);
  });

  return newOrder;
}

/**
 * Update refund status
 */
export function updateRefundStatus(
  refundId: string,
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): RefundRequest | undefined {
  const refund = dummyRefunds.find((r) => r.id === refundId);
  if (refund) {
    refund.status = status;
    refund.processedAt = new Date();
  }
  return refund;
}

/**
 * Reset all dummy data to initial state
 */
export function resetDummyData(): void {
  initializeDummyData();
}

/**
 * Get dashboard metrics
 */
export function getDashboardMetrics() {
  return {
    totalUsers: dummyUsers.length,
    totalOrganizers: dummyOrganizers.length,
    totalEvents: dummyEvents.length,
    totalRevenue: dummyOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    activeUsers: dummyUsers.filter((u) => u.status === 'active').length,
    verifiedOrganizers: dummyOrganizers.filter(
      (o) => o.verificationStatus === 'verified'
    ).length,
    activeEvents: dummyEvents.filter((e) => e.status === 'active').length,
  };
}

/**
 * Get recent activities
 */
export function getRecentActivities(limit: number = 10) {
  const activities: any[] = [];

  // Add user registrations
  dummyUsers.forEach((user) => {
    activities.push({
      id: `activity-user-${user.id}`,
      type: 'user_registration',
      description: `${user.name} registered as ${user.role}`,
      timestamp: user.createdAt,
      user: user.name,
    });
  });

  // Add event creations
  dummyEvents.forEach((event) => {
    activities.push({
      id: `activity-event-${event.id}`,
      type: 'event_creation',
      description: `Event "${event.name}" was created`,
      timestamp: event.createdAt,
      user: event.organizerId,
    });
  });

  // Add orders
  dummyOrders.forEach((order) => {
    activities.push({
      id: `activity-order-${order.id}`,
      type: 'order_creation',
      description: `Order placed for event`,
      timestamp: order.createdAt,
      user: order.customerId,
    });
  });

  // Sort by timestamp descending and limit
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}
