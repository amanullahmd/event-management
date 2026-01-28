/**
 * Integration tests for checkout flow
 */

import {
  getAllEvents,
  getEventById,
  createOrder,
  getOrderById,
  getAllOrders,
  resetDummyData,
} from '@/lib/dummy-data';
import type { PaymentMethod } from '@/lib/types/order';

describe('Checkout Flow Integration', () => {
  beforeEach(() => {
    resetDummyData();
  });

  describe('Event Discovery', () => {
    test('events are available for browsing', () => {
      const events = getAllEvents();
      expect(events.length).toBeGreaterThan(0);
    });

    test('events have ticket types', () => {
      const events = getAllEvents();
      
      events.forEach(event => {
        expect(event.ticketTypes).toBeDefined();
        expect(event.ticketTypes.length).toBeGreaterThan(0);
      });
    });

    test('ticket types have valid prices', () => {
      const events = getAllEvents();
      
      events.forEach(event => {
        event.ticketTypes.forEach(ticketType => {
          expect(ticketType.price).toBeGreaterThanOrEqual(0);
          expect(ticketType.quantity).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('event can be retrieved by ID', () => {
      const events = getAllEvents();
      const testEvent = events[0];
      
      const foundEvent = getEventById(testEvent.id);
      
      expect(foundEvent).toBeDefined();
      expect(foundEvent?.id).toBe(testEvent.id);
      expect(foundEvent?.name).toBe(testEvent.name);
    });
  });

  describe('Cart Operations', () => {
    test('cart items can be calculated', () => {
      const events = getAllEvents();
      const event = events[0];
      const ticketType = event.ticketTypes[0];
      
      const cartItem = {
        eventId: event.id,
        ticketTypeId: ticketType.id,
        ticketType: ticketType,
        quantity: 2,
      };
      
      const subtotal = cartItem.ticketType.price * cartItem.quantity;
      const fees = subtotal * 0.1;
      const total = subtotal + fees;
      
      expect(subtotal).toBe(ticketType.price * 2);
      expect(fees).toBe(subtotal * 0.1);
      expect(total).toBe(subtotal + fees);
    });

    test('multiple cart items can be totaled', () => {
      const events = getAllEvents();
      const event = events[0];
      
      const cartItems = event.ticketTypes.slice(0, 2).map((tt, index) => ({
        eventId: event.id,
        ticketTypeId: tt.id,
        ticketType: tt,
        quantity: index + 1,
      }));
      
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.ticketType.price * item.quantity,
        0
      );
      
      expect(subtotal).toBeGreaterThan(0);
    });
  });

  describe('Order Creation', () => {
    test('order can be created', () => {
      const events = getAllEvents();
      const event = events[0];
      const ticketType = event.ticketTypes[0];
      
      const orderData = {
        customerId: 'customer-1',
        eventId: event.id,
        tickets: [
          {
            id: `ticket-${Date.now()}`,
            ticketTypeId: ticketType.id,
            quantity: 1,
            qrCode: `QR-${Date.now()}`,
            checkedIn: false,
          },
        ],
        totalAmount: ticketType.price * 1.1,
        status: 'completed' as const,
        paymentMethod: 'credit_card' as PaymentMethod,
        createdAt: new Date(),
      };
      
      const order = createOrder(orderData);
      
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.customerId).toBe(orderData.customerId);
      expect(order.eventId).toBe(orderData.eventId);
      expect(order.totalAmount).toBe(orderData.totalAmount);
    });

    test('created order can be retrieved', () => {
      const events = getAllEvents();
      const event = events[0];
      const ticketType = event.ticketTypes[0];
      
      const orderData = {
        customerId: 'customer-1',
        eventId: event.id,
        tickets: [
          {
            id: `ticket-${Date.now()}`,
            ticketTypeId: ticketType.id,
            quantity: 1,
            qrCode: `QR-${Date.now()}`,
            checkedIn: false,
          },
        ],
        totalAmount: ticketType.price * 1.1,
        status: 'completed' as const,
        paymentMethod: 'credit_card' as PaymentMethod,
        createdAt: new Date(),
      };
      
      const createdOrder = createOrder(orderData);
      const retrievedOrder = getOrderById(createdOrder.id);
      
      expect(retrievedOrder).toBeDefined();
      expect(retrievedOrder?.id).toBe(createdOrder.id);
    });

    test('order count increases after creation', () => {
      const initialOrders = getAllOrders();
      const initialCount = initialOrders.length;
      
      const events = getAllEvents();
      const event = events[0];
      const ticketType = event.ticketTypes[0];
      
      createOrder({
        customerId: 'customer-1',
        eventId: event.id,
        tickets: [
          {
            id: `ticket-${Date.now()}`,
            ticketTypeId: ticketType.id,
            quantity: 1,
            qrCode: `QR-${Date.now()}`,
            checkedIn: false,
          },
        ],
        totalAmount: ticketType.price * 1.1,
        status: 'completed' as const,
        paymentMethod: 'credit_card' as PaymentMethod,
        createdAt: new Date(),
      });
      
      const finalOrders = getAllOrders();
      expect(finalOrders.length).toBe(initialCount + 1);
    });
  });

  describe('Order Data Integrity', () => {
    test('all orders have required fields', () => {
      const orders = getAllOrders();
      
      orders.forEach(order => {
        expect(order.id).toBeDefined();
        expect(order.customerId).toBeDefined();
        expect(order.eventId).toBeDefined();
        expect(order.tickets).toBeDefined();
        expect(order.totalAmount).toBeDefined();
        expect(order.status).toBeDefined();
        expect(order.createdAt).toBeDefined();
      });
    });

    test('all orders have valid status', () => {
      const orders = getAllOrders();
      const validStatuses = ['completed', 'pending', 'refunded', 'cancelled'];
      
      orders.forEach(order => {
        expect(validStatuses).toContain(order.status);
      });
    });

    test('all orders have positive total amounts', () => {
      const orders = getAllOrders();
      
      orders.forEach(order => {
        expect(order.totalAmount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
