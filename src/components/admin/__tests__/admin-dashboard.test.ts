/**
 * Property-based tests for admin dashboard
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import fc from 'fast-check';
import {
  getDashboardMetrics,
  getRecentActivities,
  getAllUsers,
  getAllOrganizers,
  getAllEvents,
  getAllOrders,
  resetDummyData,
} from '@/lib/dummy-data';

describe('Admin Dashboard - Property-Based Tests', () => {
  beforeEach(() => {
    resetDummyData();
  });

  /**
   * Property 1: Dashboard metrics are displayed
   * For any admin user viewing the dashboard, all key metrics
   * (total users, total organizers, total events, total revenue)
   * should be rendered on the page.
   * **Validates: Requirements 1.1**
   */
  test('Property 1: Dashboard metrics are displayed', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const metrics = getDashboardMetrics();

        // Verify all required metrics are present and are numbers
        expect(metrics).toHaveProperty('totalUsers');
        expect(metrics).toHaveProperty('totalOrganizers');
        expect(metrics).toHaveProperty('totalEvents');
        expect(metrics).toHaveProperty('totalRevenue');

        // Verify metrics are non-negative numbers
        expect(typeof metrics.totalUsers).toBe('number');
        expect(typeof metrics.totalOrganizers).toBe('number');
        expect(typeof metrics.totalEvents).toBe('number');
        expect(typeof metrics.totalRevenue).toBe('number');

        expect(metrics.totalUsers).toBeGreaterThanOrEqual(0);
        expect(metrics.totalOrganizers).toBeGreaterThanOrEqual(0);
        expect(metrics.totalEvents).toBeGreaterThanOrEqual(0);
        expect(metrics.totalRevenue).toBeGreaterThanOrEqual(0);

        // Verify metrics match actual data
        const users = getAllUsers();
        const organizers = getAllOrganizers();
        const events = getAllEvents();
        const orders = getAllOrders();

        expect(metrics.totalUsers).toBe(users.length);
        expect(metrics.totalOrganizers).toBe(organizers.length);
        expect(metrics.totalEvents).toBe(events.length);

        const expectedRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        expect(metrics.totalRevenue).toBe(expectedRevenue);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Activity feed is sorted by recency
   * For any set of activities with timestamps, the activity feed
   * should display them in descending order by timestamp
   * (most recent first).
   * **Validates: Requirements 1.2**
   */
  test('Property 2: Activity feed is sorted by recency', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), () => {
        const activities = getRecentActivities(50);

        // Verify activities are sorted by timestamp descending
        for (let i = 0; i < activities.length - 1; i++) {
          const currentTime = new Date(activities[i].timestamp).getTime();
          const nextTime = new Date(activities[i + 1].timestamp).getTime();

          // Current activity should be more recent (greater or equal timestamp)
          expect(currentTime).toBeGreaterThanOrEqual(nextTime);
        }

        // Verify all activities have valid timestamps
        activities.forEach((activity) => {
          expect(activity.timestamp).toBeInstanceOf(Date);
          expect(activity.timestamp.getTime()).toBeLessThanOrEqual(
            new Date().getTime()
          );
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Activity feed contains expected activity types
   * For any activity feed, all activities should have valid types
   * and descriptions.
   * **Validates: Requirements 1.3**
   */
  test('Property 3: Activity feed contains expected activity types', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), () => {
        const activities = getRecentActivities(50);
        const validTypes = [
          'user_registration',
          'event_creation',
          'order_creation',
        ];

        activities.forEach((activity) => {
          // Verify activity has required fields
          expect(activity).toHaveProperty('id');
          expect(activity).toHaveProperty('type');
          expect(activity).toHaveProperty('description');
          expect(activity).toHaveProperty('timestamp');
          expect(activity).toHaveProperty('user');

          // Verify activity type is valid
          expect(validTypes).toContain(activity.type);

          // Verify description is non-empty string
          expect(typeof activity.description).toBe('string');
          expect(activity.description.length).toBeGreaterThan(0);

          // Verify user is non-empty string
          expect(typeof activity.user).toBe('string');
          expect(activity.user.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Dashboard metrics are consistent with data sources
   * For any state of dummy data, the dashboard metrics should
   * accurately reflect the underlying data.
   * **Validates: Requirements 1.1**
   */
  test('Property 4: Dashboard metrics are consistent with data sources', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), () => {
        const metrics = getDashboardMetrics();
        const users = getAllUsers();
        const organizers = getAllOrganizers();
        const events = getAllEvents();
        const orders = getAllOrders();

        // Verify active users count
        const activeUsers = users.filter((u) => u.status === 'active').length;
        expect(metrics.activeUsers).toBe(activeUsers);

        // Verify verified organizers count
        const verifiedOrganizers = organizers.filter(
          (o) => o.verificationStatus === 'verified'
        ).length;
        expect(metrics.verifiedOrganizers).toBe(verifiedOrganizers);

        // Verify active events count
        const activeEvents = events.filter((e) => e.status === 'active').length;
        expect(metrics.activeEvents).toBe(activeEvents);

        // Verify total revenue calculation
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        expect(metrics.totalRevenue).toBe(totalRevenue);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Activity feed limit is respected
   * For any limit value, the activity feed should return
   * at most that many activities.
   * **Validates: Requirements 1.3**
   */
  test('Property 5: Activity feed limit is respected', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (limit) => {
        const activities = getRecentActivities(limit);

        // Verify activities count does not exceed limit
        expect(activities.length).toBeLessThanOrEqual(limit);

        // Verify activities are still sorted by recency
        for (let i = 0; i < activities.length - 1; i++) {
          const currentTime = new Date(activities[i].timestamp).getTime();
          const nextTime = new Date(activities[i + 1].timestamp).getTime();
          expect(currentTime).toBeGreaterThanOrEqual(nextTime);
        }
      }),
      { numRuns: 100 }
    );
  });
});
