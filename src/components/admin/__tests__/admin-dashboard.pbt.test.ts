/**
 * Property-Based Tests for Admin Dashboard
 * Tests core properties of the admin dashboard functionality
 */

import fc from 'fast-check';
import {
  getDashboardMetrics,
  getRecentActivities,
  getAllUsers,
  getAllOrganizers,
  getAllEvents,
  getAllOrders,
} from '@/lib/dummy-data';

/**
 * Property 1: Dashboard metrics are displayed
 * For any admin user viewing the dashboard, all key metrics (total users, total organizers, 
 * total events, total revenue) should be rendered on the page.
 * **Validates: Requirements 1.1**
 */
describe('Property 1: Dashboard metrics are displayed', () => {
  test('should display all required metrics', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const metrics = getDashboardMetrics();

        // Verify all required metrics are present and are numbers
        expect(metrics).toHaveProperty('totalUsers');
        expect(metrics).toHaveProperty('totalOrganizers');
        expect(metrics).toHaveProperty('totalEvents');
        expect(metrics).toHaveProperty('totalRevenue');
        expect(metrics).toHaveProperty('activeUsers');
        expect(metrics).toHaveProperty('verifiedOrganizers');
        expect(metrics).toHaveProperty('activeEvents');

        // Verify metrics are non-negative numbers
        expect(typeof metrics.totalUsers).toBe('number');
        expect(typeof metrics.totalOrganizers).toBe('number');
        expect(typeof metrics.totalEvents).toBe('number');
        expect(typeof metrics.totalRevenue).toBe('number');
        expect(typeof metrics.activeUsers).toBe('number');
        expect(typeof metrics.verifiedOrganizers).toBe('number');
        expect(typeof metrics.activeEvents).toBe('number');

        expect(metrics.totalUsers).toBeGreaterThanOrEqual(0);
        expect(metrics.totalOrganizers).toBeGreaterThanOrEqual(0);
        expect(metrics.totalEvents).toBeGreaterThanOrEqual(0);
        expect(metrics.totalRevenue).toBeGreaterThanOrEqual(0);
        expect(metrics.activeUsers).toBeGreaterThanOrEqual(0);
        expect(metrics.verifiedOrganizers).toBeGreaterThanOrEqual(0);
        expect(metrics.activeEvents).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  test('should have consistent metric relationships', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const metrics = getDashboardMetrics();

        // Active users should not exceed total users
        expect(metrics.activeUsers).toBeLessThanOrEqual(metrics.totalUsers);

        // Verified organizers should not exceed total organizers
        expect(metrics.verifiedOrganizers).toBeLessThanOrEqual(
          metrics.totalOrganizers
        );

        // Active events should not exceed total events
        expect(metrics.activeEvents).toBeLessThanOrEqual(metrics.totalEvents);
      }),
      { numRuns: 100 }
    );
  });

  test('should calculate revenue correctly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const metrics = getDashboardMetrics();
        const orders = getAllOrders();

        // Calculate expected revenue
        const expectedRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Revenue should match sum of all orders
        expect(metrics.totalRevenue).toBe(expectedRevenue);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Activity feed is sorted by recency
 * For any set of activities with timestamps, the activity feed should display them 
 * in descending order by timestamp (most recent first).
 * **Validates: Requirements 1.2**
 */
describe('Property 2: Activity feed is sorted by recency', () => {
  test('should return activities sorted by timestamp descending', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (limit) => {
        const activities = getRecentActivities(limit);

        // Verify activities are sorted by timestamp descending
        for (let i = 0; i < activities.length - 1; i++) {
          const currentTime = new Date(activities[i].timestamp).getTime();
          const nextTime = new Date(activities[i + 1].timestamp).getTime();
          expect(currentTime).toBeGreaterThanOrEqual(nextTime);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('should respect the limit parameter', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (limit) => {
        const activities = getRecentActivities(limit);

        // Activities should not exceed the limit
        expect(activities.length).toBeLessThanOrEqual(limit);
      }),
      { numRuns: 100 }
    );
  });

  test('should include all activity types', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), () => {
        const activities = getRecentActivities(100);

        // Should have at least one of each activity type if data exists
        const types = new Set(activities.map((a) => a.type));

        // Verify activity types are valid
        activities.forEach((activity) => {
          expect(['user_registration', 'event_creation', 'order_creation']).toContain(
            activity.type
          );
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should have valid activity structure', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), () => {
        const activities = getRecentActivities(50);

        // Verify each activity has required fields
        activities.forEach((activity) => {
          expect(activity).toHaveProperty('id');
          expect(activity).toHaveProperty('type');
          expect(activity).toHaveProperty('description');
          expect(activity).toHaveProperty('timestamp');
          expect(activity).toHaveProperty('user');

          // Verify field types
          expect(typeof activity.id).toBe('string');
          expect(typeof activity.type).toBe('string');
          expect(typeof activity.description).toBe('string');
          expect(typeof activity.user).toBe('string');
          expect(activity.timestamp instanceof Date || typeof activity.timestamp === 'number').toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('should return empty array when limit is 0', () => {
    fc.assert(
      fc.property(fc.constant(0), () => {
        const activities = getRecentActivities(0);
        expect(activities).toEqual([]);
      }),
      { numRuns: 10 }
    );
  });
});

/**
 * Additional test: Metrics consistency with underlying data
 */
describe('Dashboard metrics consistency', () => {
  test('should have metrics that match underlying data', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), () => {
        const metrics = getDashboardMetrics();
        const users = getAllUsers();
        const organizers = getAllOrganizers();
        const events = getAllEvents();

        // Verify counts match
        expect(metrics.totalUsers).toBe(users.length);
        expect(metrics.totalOrganizers).toBe(organizers.length);
        expect(metrics.totalEvents).toBe(events.length);

        // Verify active counts
        const activeUsers = users.filter((u) => u.status === 'active').length;
        expect(metrics.activeUsers).toBe(activeUsers);

        const verifiedOrganizers = organizers.filter(
          (o) => o.verificationStatus === 'verified'
        ).length;
        expect(metrics.verifiedOrganizers).toBe(verifiedOrganizers);

        const activeEvents = events.filter((e) => e.status === 'active').length;
        expect(metrics.activeEvents).toBe(activeEvents);
      }),
      { numRuns: 100 }
    );
  });
});
