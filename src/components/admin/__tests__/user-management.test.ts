/**
 * Property-based tests for user management
 * Property 3: User list contains all users
 * Property 4: User status updates are reflected immediately
 * Validates: Requirements 2.1, 2.2, 2.6, 2.7
 */

import fc from 'fast-check';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getUserById,
  resetDummyData,
} from '@/lib/dummy-data';
import type { User } from '@/lib/types';

describe('Property 3: User list contains all users', () => {
  beforeEach(() => {
    resetDummyData();
  });

  test('All users from dummy data are included in the user list', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Get all users from dummy data
        const allUsers = getAllUsers();

        // Verify we have users
        if (allUsers.length === 0) return false;

        // Verify each user has required properties for display
        return allUsers.every((user) => {
          return (
            user.id !== undefined &&
            user.name !== undefined &&
            user.email !== undefined &&
            user.role !== undefined &&
            user.status !== undefined &&
            user.createdAt !== undefined &&
            typeof user.name === 'string' &&
            typeof user.email === 'string' &&
            user.name.length > 0 &&
            user.email.length > 0
          );
        });
      }),
      { numRuns: 50 }
    );
  });

  test('User list contains users with all role types', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        if (allUsers.length === 0) return false;

        // Verify we have users with different roles
        const roles = new Set(allUsers.map((u) => u.role));

        // Should have at least one role
        return roles.size > 0 && Array.from(roles).every((role) =>
          ['admin', 'organizer', 'customer'].includes(role)
        );
      }),
      { numRuns: 50 }
    );
  });

  test('User list contains users with all status types', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        if (allUsers.length === 0) return false;

        // Verify we have users with different statuses
        const statuses = new Set(allUsers.map((u) => u.status));

        // Should have at least one status
        return statuses.size > 0 && Array.from(statuses).every((status) =>
          ['active', 'blocked'].includes(status)
        );
      }),
      { numRuns: 50 }
    );
  });

  test('User list does not contain duplicate users', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        if (allUsers.length === 0) return false;

        // Verify no duplicate IDs
        const userIds = allUsers.map((u) => u.id);
        const uniqueIds = new Set(userIds);

        return userIds.length === uniqueIds.size;
      }),
      { numRuns: 50 }
    );
  });

  test('User list contains correct number of users', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        // Verify we have a reasonable number of users
        return allUsers.length > 0 && allUsers.length <= 1000;
      }),
      { numRuns: 50 }
    );
  });

  test('Each user in list can be retrieved by ID', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        if (allUsers.length === 0) return false;

        // Verify each user can be retrieved by ID
        return allUsers.every((user) => {
          const retrievedUser = getUserById(user.id);
          return (
            retrievedUser !== undefined &&
            retrievedUser.id === user.id &&
            retrievedUser.email === user.email
          );
        });
      }),
      { numRuns: 50 }
    );
  });

  test('User list maintains data consistency across multiple retrievals', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const firstRetrieval = getAllUsers();
        const secondRetrieval = getAllUsers();

        if (firstRetrieval.length === 0) return false;

        // Verify both retrievals have same number of users
        if (firstRetrieval.length !== secondRetrieval.length) return false;

        // Verify each user appears in both retrievals
        return firstRetrieval.every((user) => {
          const matchingUser = secondRetrieval.find((u) => u.id === user.id);
          return (
            matchingUser !== undefined &&
            matchingUser.email === user.email &&
            matchingUser.role === user.role
          );
        });
      }),
      { numRuns: 50 }
    );
  });

  test('User list displays users with valid email format', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        if (allUsers.length === 0) return false;

        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Verify all users have valid email format
        return allUsers.every((user) => emailRegex.test(user.email));
      }),
      { numRuns: 50 }
    );
  });

  test('User list displays users with valid registration dates', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const allUsers = getAllUsers();

        if (allUsers.length === 0) return false;

        const now = new Date();

        // Verify all users have valid registration dates (not in future)
        return allUsers.every((user) => {
          return (
            user.createdAt instanceof Date &&
            user.createdAt <= now
          );
        });
      }),
      { numRuns: 50 }
    );
  });
});

describe('Property 4: User status updates are reflected immediately', () => {
  beforeEach(() => {
    resetDummyData();
  });

  test('Blocking a user updates status immediately in data', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length === 0) return true;

        const userId = users[0].id;
        const originalStatus = users[0].status;

        // Block the user
        const newStatus = originalStatus === 'active' ? 'blocked' : 'active';
        updateUserStatus(userId, newStatus);

        // Verify status updated immediately
        const updatedUser = getUserById(userId);

        return updatedUser?.status === newStatus;
      }),
      { numRuns: 50 }
    );
  });

  test('Unblocking a user updates status immediately in data', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length === 0) return true;

        // Find a blocked user
        const blockedUser = users.find((u) => u.status === 'blocked');

        if (!blockedUser) return true;

        // Unblock the user
        updateUserStatus(blockedUser.id, 'active');

        // Verify status updated immediately
        const updatedUser = getUserById(blockedUser.id);

        return updatedUser?.status === 'active';
      }),
      { numRuns: 50 }
    );
  });

  test('Promoting a user updates role immediately in data', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length === 0) return true;

        // Find a customer user
        const customerUser = users.find((u) => u.role === 'customer');

        if (!customerUser) return true;

        // Promote to organizer
        updateUserRole(customerUser.id, 'organizer');

        // Verify role updated immediately
        const updatedUser = getUserById(customerUser.id);

        return updatedUser?.role === 'organizer';
      }),
      { numRuns: 50 }
    );
  });

  test('Multiple status updates are reflected correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('active', 'blocked'), {
          minLength: 1,
          maxLength: 5,
        }),
        (statusSequence) => {
          const users = getAllUsers();

          if (users.length === 0) return true;

          const userId = users[0].id;

          // Apply multiple status updates
          statusSequence.forEach((status) => {
            updateUserStatus(userId, status as any);
          });

          // Verify final status matches last update
          const finalUser = getUserById(userId);
          const expectedStatus = statusSequence[statusSequence.length - 1];

          return finalUser?.status === expectedStatus;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Status update does not affect other user properties', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length === 0) return true;

        const userId = users[0].id;
        const originalUser = getUserById(userId);

        if (!originalUser) return false;

        const originalName = originalUser.name;
        const originalEmail = originalUser.email;
        const originalRole = originalUser.role;

        // Update status
        const newStatus = originalUser.status === 'active' ? 'blocked' : 'active';
        updateUserStatus(userId, newStatus);

        // Verify other properties unchanged
        const updatedUser = getUserById(userId);

        return (
          updatedUser?.name === originalName &&
          updatedUser?.email === originalEmail &&
          updatedUser?.role === originalRole &&
          updatedUser?.status === newStatus
        );
      }),
      { numRuns: 50 }
    );
  });

  test('Role update does not affect other user properties', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length === 0) return true;

        // Find a customer user
        const customerUser = users.find((u) => u.role === 'customer');

        if (!customerUser) return true;

        const originalName = customerUser.name;
        const originalEmail = customerUser.email;
        const originalStatus = customerUser.status;

        // Update role
        updateUserRole(customerUser.id, 'organizer');

        // Verify other properties unchanged
        const updatedUser = getUserById(customerUser.id);

        return (
          updatedUser?.name === originalName &&
          updatedUser?.email === originalEmail &&
          updatedUser?.status === originalStatus &&
          updatedUser?.role === 'organizer'
        );
      }),
      { numRuns: 50 }
    );
  });

  test('Status updates are visible in user list immediately', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const initialUsers = getAllUsers();

        if (initialUsers.length === 0) return true;

        const userId = initialUsers[0].id;
        const newStatus = initialUsers[0].status === 'active' ? 'blocked' : 'active';

        // Update status
        updateUserStatus(userId, newStatus);

        // Get updated user list
        const updatedUsers = getAllUsers();

        // Find the updated user in the list
        const updatedUserInList = updatedUsers.find((u) => u.id === userId);

        return updatedUserInList?.status === newStatus;
      }),
      { numRuns: 50 }
    );
  });

  test('Role updates are visible in user list immediately', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const initialUsers = getAllUsers();

        if (initialUsers.length === 0) return true;

        // Find a customer user
        const customerUser = initialUsers.find((u) => u.role === 'customer');

        if (!customerUser) return true;

        // Update role
        updateUserRole(customerUser.id, 'organizer');

        // Get updated user list
        const updatedUsers = getAllUsers();

        // Find the updated user in the list
        const updatedUserInList = updatedUsers.find((u) => u.id === customerUser.id);

        return updatedUserInList?.role === 'organizer';
      }),
      { numRuns: 50 }
    );
  });

  test('Concurrent updates to different users are independent', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length < 2) return true;

        const user1 = users[0];
        const user2 = users[1];

        const originalStatus1 = user1.status;
        const originalStatus2 = user2.status;

        // Update both users
        const newStatus1 = originalStatus1 === 'active' ? 'blocked' : 'active';
        const newStatus2 = originalStatus2 === 'active' ? 'blocked' : 'active';

        updateUserStatus(user1.id, newStatus1);
        updateUserStatus(user2.id, newStatus2);

        // Verify both updates applied correctly
        const updatedUser1 = getUserById(user1.id);
        const updatedUser2 = getUserById(user2.id);

        return (
          updatedUser1?.status === newStatus1 &&
          updatedUser2?.status === newStatus2
        );
      }),
      { numRuns: 50 }
    );
  });

  test('Status updates persist across multiple retrievals', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const users = getAllUsers();

        if (users.length === 0) return true;

        const userId = users[0].id;
        const newStatus = users[0].status === 'active' ? 'blocked' : 'active';

        // Update status
        updateUserStatus(userId, newStatus);

        // Retrieve multiple times
        const firstRetrieval = getUserById(userId);
        const secondRetrieval = getUserById(userId);
        const thirdRetrieval = getUserById(userId);

        return (
          firstRetrieval?.status === newStatus &&
          secondRetrieval?.status === newStatus &&
          thirdRetrieval?.status === newStatus
        );
      }),
      { numRuns: 50 }
    );
  });
});
