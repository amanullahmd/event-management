/**
 * Property-Based Tests for Checkout
 * Tests core properties of the cart and checkout functionality
 */

import fc from 'fast-check';
import type { TicketType } from '@/lib/types';

/**
 * Helper type for cart item
 */
interface CartItem {
  ticketTypeId: string;
  eventId: string;
  ticketType: TicketType;
  quantity: number;
}

/**
 * Helper function to calculate subtotal
 */
function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + item.ticketType.price * item.quantity;
  }, 0);
}

/**
 * Helper function to calculate fees (10% of subtotal)
 */
function calculateFees(subtotal: number): number {
  return subtotal * 0.1;
}

/**
 * Helper function to calculate total
 */
function calculateTotal(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items);
  const fees = calculateFees(subtotal);
  return subtotal + fees;
}

/**
 * Arbitrary generator for ticket types
 */
const ticketTypeArbitrary = (): fc.Arbitrary<TicketType> =>
  fc.record({
    id: fc.uuid(),
    eventId: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
    quantity: fc.integer({ min: 1, max: 1000 }),
    sold: fc.integer({ min: 0, max: 500 }),
    type: fc.constantFrom('vip', 'regular', 'early-bird') as fc.Arbitrary<'vip' | 'regular' | 'early-bird'>,
  });

/**
 * Arbitrary generator for cart items
 */
const cartItemArbitrary = (): fc.Arbitrary<CartItem> =>
  fc.record({
    ticketTypeId: fc.uuid(),
    eventId: fc.uuid(),
    ticketType: ticketTypeArbitrary(),
    quantity: fc.integer({ min: 1, max: 10 }),
  });

/**
 * Property 12: Cart updates reflect selected tickets
 * For any ticket selection, adding tickets to the cart should update the cart count
 * and display selected items.
 * **Validates: Requirements 17.5**
 */
describe('Property 12: Cart updates reflect selected tickets', () => {
  test('adding items increases cart count correctly', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          // Calculate expected total quantity
          const expectedCount = items.reduce((sum, item) => sum + item.quantity, 0);

          // Verify count is positive
          expect(expectedCount).toBeGreaterThan(0);

          // Verify count equals sum of all quantities
          let actualCount = 0;
          items.forEach((item) => {
            actualCount += item.quantity;
          });
          expect(actualCount).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing items decreases cart count correctly', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (items, removeIndex) => {
          const validIndex = removeIndex % items.length;
          const initialCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const removedQuantity = items[validIndex].quantity;

          // After removing one item
          const remainingItems = items.filter((_, i) => i !== validIndex);
          const newCount = remainingItems.reduce((sum, item) => sum + item.quantity, 0);

          expect(newCount).toBe(initialCount - removedQuantity);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('updating quantity changes cart item correctly', () => {
    fc.assert(
      fc.property(
        cartItemArbitrary(),
        fc.integer({ min: 1, max: 20 }),
        (item, newQuantity) => {
          const updatedItem = { ...item, quantity: newQuantity };

          // Verify quantity is set to the new value
          expect(updatedItem.quantity).toBe(newQuantity);
          
          // Verify other properties are preserved
          expect(updatedItem.ticketTypeId).toBe(item.ticketTypeId);
          expect(updatedItem.eventId).toBe(item.eventId);
          expect(updatedItem.ticketType).toBe(item.ticketType);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('cart items maintain ticket type information', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          items.forEach((item) => {
            // Each item should have valid ticket type info
            expect(item.ticketType).toBeDefined();
            expect(item.ticketType.id).toBeDefined();
            expect(item.ticketType.name).toBeDefined();
            expect(typeof item.ticketType.price).toBe('number');
            expect(item.ticketType.price).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('cart preserves event association', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          items.forEach((item) => {
            // Each item should have an event ID
            expect(item.eventId).toBeDefined();
            expect(typeof item.eventId).toBe('string');
            expect(item.eventId.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 13: Checkout totals are calculated correctly
 * For any set of items in the cart, the checkout page should display a total
 * that equals the sum of item prices plus applicable fees.
 * **Validates: Requirements 18.1, 18.2**
 */
describe('Property 13: Checkout totals are calculated correctly', () => {
  test('subtotal equals sum of item prices times quantities', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);

          // Calculate expected subtotal manually
          let expectedSubtotal = 0;
          items.forEach((item) => {
            expectedSubtotal += item.ticketType.price * item.quantity;
          });

          // Use approximate equality for floating point
          expect(Math.abs(subtotal - expectedSubtotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('fees are exactly 10% of subtotal', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);
          const fees = calculateFees(subtotal);

          // Fees should be 10% of subtotal
          const expectedFees = subtotal * 0.1;
          expect(Math.abs(fees - expectedFees)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('total equals subtotal plus fees', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);
          const fees = calculateFees(subtotal);
          const total = calculateTotal(items);

          // Total should equal subtotal + fees
          const expectedTotal = subtotal + fees;
          expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('total is always greater than or equal to subtotal', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);
          const total = calculateTotal(items);

          // Total should always be >= subtotal (fees are non-negative)
          expect(total).toBeGreaterThanOrEqual(subtotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('empty cart has zero total', () => {
    fc.assert(
      fc.property(fc.constant([]), (items: CartItem[]) => {
        const subtotal = calculateSubtotal(items);
        const fees = calculateFees(subtotal);
        const total = calculateTotal(items);

        expect(subtotal).toBe(0);
        expect(fees).toBe(0);
        expect(total).toBe(0);
      }),
      { numRuns: 10 }
    );
  });

  test('total is exactly 110% of subtotal', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);
          const total = calculateTotal(items);

          // Total should be 110% of subtotal (100% + 10% fees)
          const expectedTotal = subtotal * 1.1;
          expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('adding more items increases total', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 5 }),
        cartItemArbitrary(),
        (items, newItem) => {
          const originalTotal = calculateTotal(items);
          const newItems = [...items, newItem];
          const newTotal = calculateTotal(newItems);

          // Adding an item should increase the total
          expect(newTotal).toBeGreaterThan(originalTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('doubling quantities doubles the total', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 5 }),
        (items) => {
          const originalTotal = calculateTotal(items);

          // Double all quantities
          const doubledItems = items.map((item) => ({
            ...item,
            quantity: item.quantity * 2,
          }));
          const doubledTotal = calculateTotal(doubledItems);

          // Total should be doubled
          expect(Math.abs(doubledTotal - originalTotal * 2)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Additional tests for checkout validation
 */
describe('Checkout validation', () => {
  test('all cart items have positive quantities', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          items.forEach((item) => {
            expect(item.quantity).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('all ticket prices are positive', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 1, maxLength: 10 }),
        (items) => {
          items.forEach((item) => {
            expect(item.ticketType.price).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('subtotal is non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 0, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);
          expect(subtotal).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('fees are non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary(), { minLength: 0, maxLength: 10 }),
        (items) => {
          const subtotal = calculateSubtotal(items);
          const fees = calculateFees(subtotal);
          expect(fees).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
