/**
 * Property-based tests for dummy data initialization
 * Property 18: Data updates persist across user actions
 * Validates: Requirements 22.1, 22.2
 */

import fc from 'fast-check';
import {
  initializeDummyData,
  getAllUsers,
  getAllOrganizers,
  getAllEvents,
  getAllOrders,
  getAllTickets,
  updateUserStatus,
  updateEventStatus,
  updateOrderStatus,
  updateTicketCheckIn,
  getUserById,
  getEventById,
  getOrderById,
  resetDummyData,
} from '../dummy-data';

describe('Property 18: Data updates persist across user actions', () => {
  beforeEach(() => {
    resetDummyData();
  });

  test('User status updates persist after modification', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('active', 'blocked'),
        (newStatus) => {
          // Get initial users
          const users = getAllUsers();
          if (users.length === 0) return true;

          const userId = users[0].id;

          // Update user status
          const updatedUser = updateUserStatus(userId, newStatus as any);

          // Verify update persisted
          const retrievedUser = getUserById(userId);

          return (
            updatedUser?.status === newStatus &&
            retrievedUser?.status === newStatus
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Event status updates persist after modification', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('active', 'inactive', 'cancelled'),
        (newStatus) => {
          // Get initial events
          const events = getAllEvents();
          if (events.length === 0) return true;

          const eventId = events[0].id;

          // Update event status
          const updatedEvent = updateEventStatus(eventId, newStatus as any);

          // Verify update persisted
          const retrievedEvent = getEventById(eventId);

          return (
            updatedEvent?.status === newStatus &&
            retrievedEvent?.status === newStatus
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Order status updates persist after modification', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('completed', 'pending', 'refunded', 'cancelled'),
        (newStatus) => {
          // Get initial orders
          const orders = getAllOrders();
          if (orders.length === 0) return true;

          const orderId = orders[0].id;

          // Update order status
          const updatedOrder = updateOrderStatus(orderId, newStatus as any);

          // Verify update persisted
          const retrievedOrder = getOrderById(orderId);

          return (
            updatedOrder?.status === newStatus &&
            retrievedOrder?.status === newStatus
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Ticket check-in status updates persist after modification', () => {
    fc.assert(
      fc.property(fc.boolean(), (checkedIn) => {
        // Get initial tickets
        const tickets = getAllTickets();
        if (tickets.length === 0) return true;

        const ticketId = tickets[0].id;

        // Update ticket check-in status
        const updatedTicket = updateTicketCheckIn(ticketId, checkedIn);

        // Verify update persisted
        const allTickets = getAllTickets();
        const retrievedTicket = allTickets.find((t) => t.id === ticketId);

        return (
          updatedTicket?.checkedIn === checkedIn &&
          retrievedTicket?.checkedIn === checkedIn
        );
      }),
      { numRuns: 50 }
    );
  });

  test('Multiple sequential updates persist correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('active', 'blocked'), {
          minLength: 1,
          maxLength: 5,
        }),
        (statusUpdates) => {
          const users = getAllUsers();
          if (users.length === 0) return true;

          const userId = users[0].id;

          // Apply multiple updates
          statusUpdates.forEach((status) => {
            updateUserStatus(userId, status as any);
          });

          // Verify final state matches last update
          const finalUser = getUserById(userId);
          const lastStatus = statusUpdates[statusUpdates.length - 1];

          return finalUser?.status === lastStatus;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Data initialization creates valid data structures', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        initializeDummyData();

        const users = getAllUsers();
        const organizers = getAllOrganizers();
        const events = getAllEvents();
        const orders = getAllOrders();
        const tickets = getAllTickets();

        // Verify all data structures are populated
        const hasUsers = users.length > 0;
        const hasOrganizers = organizers.length > 0;
        const hasEvents = events.length > 0;
        const hasOrders = orders.length > 0;
        const hasTickets = tickets.length > 0;

        // Verify data integrity
        const allUsersHaveIds = users.every((u) => u.id);
        const allEventsHaveOrganizers = events.every((e) => e.organizerId);
        const allOrdersHaveCustomers = orders.every((o) => o.customerId);

        return (
          hasUsers &&
          hasOrganizers &&
          hasEvents &&
          hasOrders &&
          hasTickets &&
          allUsersHaveIds &&
          allEventsHaveOrganizers &&
          allOrdersHaveCustomers
        );
      }),
      { numRuns: 10 }
    );
  });

  test('Data updates do not affect other data entities', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('active', 'blocked'),
        (newStatus) => {
          const initialUsers = getAllUsers();
          const initialEvents = getAllEvents();
          const initialOrders = getAllOrders();

          if (initialUsers.length === 0) return true;

          const userId = initialUsers[0].id;

          // Update user status
          updateUserStatus(userId, newStatus as any);

          // Verify other data is unchanged
          const finalEvents = getAllEvents();
          const finalOrders = getAllOrders();

          const eventsUnchanged =
            initialEvents.length === finalEvents.length &&
            initialEvents.every((e) =>
              finalEvents.some((fe) => fe.id === e.id)
            );

          const ordersUnchanged =
            initialOrders.length === finalOrders.length &&
            initialOrders.every((o) =>
              finalOrders.some((fo) => fo.id === o.id)
            );

          return eventsUnchanged && ordersUnchanged;
        }
      ),
      { numRuns: 50 }
    );
  });
});
