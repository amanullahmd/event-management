/**
 * Unit tests for useAuth hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/context/AuthContext';
import { resetDummyData, getAllUsers } from '@/lib/dummy-data';

// Wrapper component for testing hooks with context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    resetDummyData();
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  test('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('login function authenticates user with valid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const users = getAllUsers();
    const testUser = users.find(u => u.status === 'active');
    
    if (!testUser) {
      console.warn('No active users found for testing');
      return;
    }

    await act(async () => {
      await result.current.login(testUser.email, 'password123');
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe(testUser.email);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('login function fails with invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('invalid@email.com', 'wrongpassword');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('logout function clears user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const users = getAllUsers();
    const testUser = users.find(u => u.status === 'active');
    
    if (!testUser) return;

    // First login
    await act(async () => {
      await result.current.login(testUser.email, 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('register function creates new user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register(
        'Test User',
        'newuser@test.com',
        'password123',
        'customer'
      );
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('newuser@test.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('blocked users cannot login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const users = getAllUsers();
    const blockedUser = users.find(u => u.status === 'blocked');
    
    if (!blockedUser) {
      console.warn('No blocked users found for testing');
      return;
    }

    await act(async () => {
      try {
        await result.current.login(blockedUser.email, 'password123');
      } catch (error) {
        // Expected to throw for blocked users
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('user role is correctly set after login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const users = getAllUsers();
    
    // Test admin user
    const adminUser = users.find(u => u.role === 'admin' && u.status === 'active');
    if (adminUser) {
      await act(async () => {
        await result.current.login(adminUser.email, 'password123');
      });
      expect(result.current.user?.role).toBe('admin');
      
      act(() => {
        result.current.logout();
      });
    }

    // Test organizer user
    const organizerUser = users.find(u => u.role === 'organizer' && u.status === 'active');
    if (organizerUser) {
      await act(async () => {
        await result.current.login(organizerUser.email, 'password123');
      });
      expect(result.current.user?.role).toBe('organizer');
      
      act(() => {
        result.current.logout();
      });
    }

    // Test customer user
    const customerUser = users.find(u => u.role === 'customer' && u.status === 'active');
    if (customerUser) {
      await act(async () => {
        await result.current.login(customerUser.email, 'password123');
      });
      expect(result.current.user?.role).toBe('customer');
    }
  });
});
