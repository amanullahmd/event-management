/**
 * RoleGuard Property-Based Tests
 *
 * Feature: frontend-role-based-dashboard, Property 1: Role mismatch redirects to correct dashboard
 * Feature: frontend-role-based-dashboard, Property 2: Unauthenticated users are redirected to login
 *
 * Validates: Requirements 1.4, 1.5
 */

import fc from 'fast-check';

// --- Types and constants mirroring the RoleGuard implementation ---

type UserRole = 'ADMIN' | 'ORGANIZER' | 'CUSTOMER';

const ALL_ROLES: UserRole[] = ['ADMIN', 'ORGANIZER', 'CUSTOMER'];

const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  CUSTOMER: '/dashboard',
};

const DASHBOARD_ROUTES = ['/admin', '/organizer', '/dashboard'];

const AUTH_STORAGE_KEYS = [
  'auth_token',
  'auth_refresh_token',
  'auth_token_expires_at',
  'auth_user_id',
  'auth_user_role',
];

// --- Arbitraries ---

const userRoleArb = fc.constantFrom<UserRole>('ADMIN', 'ORGANIZER', 'CUSTOMER');

const dashboardRouteArb = fc.constantFrom('/admin', '/organizer', '/dashboard');

/**
 * Generates a (userRole, dashboardRoute) pair where the route does NOT match the role.
 * This ensures we always test the mismatch redirect scenario.
 */
const roleMismatchArb = userRoleArb.chain((role) => {
  const correctRoute = ROLE_DASHBOARD_ROUTES[role];
  const mismatchedRoutes = DASHBOARD_ROUTES.filter((r) => r !== correctRoute);
  return fc.constantFrom(...mismatchedRoutes).map((route) => ({ role, route }));
});

// --- Mock infrastructure ---

let mockPush: jest.Mock;
let mockUseAuth: jest.Mock;

// We mock next/navigation and AuthContext at the module level
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

jest.mock('@/modules/authentication/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// We need React and render for component testing
import React from 'react';
import { render, act } from '@testing-library/react';
import { RoleGuard } from '../RoleGuard';


// --- Property 1 Tests ---

describe('Property 1: Role mismatch redirects to correct dashboard', () => {
  beforeEach(() => {
    mockPush = jest.fn();

    // Mock localStorage
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k]);
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 1: Role mismatch redirects to correct dashboard
   *
   * For any authenticated user with role R and any dashboard route not matching R,
   * RoleGuard redirects to the correct dashboard (ADMIN → /admin, ORGANIZER → /organizer,
   * CUSTOMER → /dashboard).
   *
   * **Validates: Requirements 1.4**
   */
  it('redirects authenticated user to their correct dashboard when role does not match allowed roles', () => {
    fc.assert(
      fc.property(roleMismatchArb, ({ role, route }) => {
        mockPush.mockClear();

        // Determine the allowedRoles from the route the user is trying to access
        const allowedRolesForRoute: UserRole[] = ALL_ROLES.filter(
          (r) => ROLE_DASHBOARD_ROUTES[r] === route
        );

        // Mock an authenticated user with the given role
        mockUseAuth = jest.fn().mockReturnValue({
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role,
            status: 'active',
            createdAt: new Date(),
          },
          isAuthenticated: true,
          isLoading: false,
        });

        const { unmount } = render(
          React.createElement(
            RoleGuard,
            { allowedRoles: allowedRolesForRoute },
            React.createElement('div', null, 'Protected Content')
          )
        );

        // The RoleGuard should redirect to the correct dashboard for the user's role
        const expectedRedirect = ROLE_DASHBOARD_ROUTES[role];
        expect(mockPush).toHaveBeenCalledWith(expectedRedirect);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Additional check: RoleGuard does NOT render children when role mismatches.
   */
  it('does not render children when role does not match allowed roles', () => {
    fc.assert(
      fc.property(roleMismatchArb, ({ role, route }) => {
        mockPush.mockClear();

        const allowedRolesForRoute: UserRole[] = ALL_ROLES.filter(
          (r) => ROLE_DASHBOARD_ROUTES[r] === route
        );

        mockUseAuth = jest.fn().mockReturnValue({
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role,
            status: 'active',
            createdAt: new Date(),
          },
          isAuthenticated: true,
          isLoading: false,
        });

        const { container, unmount } = render(
          React.createElement(
            RoleGuard,
            { allowedRoles: allowedRolesForRoute },
            React.createElement('div', { 'data-testid': 'protected' }, 'Protected Content')
          )
        );

        // Children should not be rendered
        expect(container.querySelector('[data-testid="protected"]')).toBeNull();

        unmount();
      }),
      { numRuns: 20 }
    );
  });
});

// --- Property 2 Tests ---

describe('Property 2: Unauthenticated users are redirected to login', () => {
  beforeEach(() => {
    mockPush = jest.fn();

    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k]);
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 2: Unauthenticated users are redirected to login
   *
   * For any dashboard route (/admin, /organizer, /dashboard) and any unauthenticated
   * state (no user in AuthContext), the RoleGuard shall redirect to /login.
   *
   * **Validates: Requirements 1.5**
   */
  it('redirects to /login for any dashboard route when user is unauthenticated', () => {
    fc.assert(
      fc.property(dashboardRouteArb, userRoleArb, (route, guardRole) => {
        mockPush.mockClear();

        // Determine allowedRoles from the route
        const allowedRolesForRoute: UserRole[] = ALL_ROLES.filter(
          (r) => ROLE_DASHBOARD_ROUTES[r] === route
        );

        // Mock unauthenticated state
        mockUseAuth = jest.fn().mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Pre-populate localStorage with auth keys to verify they get cleared
        AUTH_STORAGE_KEYS.forEach((key) => {
          localStorage.setItem(key, 'some-value');
        });

        const { unmount } = render(
          React.createElement(
            RoleGuard,
            { allowedRoles: allowedRolesForRoute },
            React.createElement('div', null, 'Protected Content')
          )
        );

        // Should redirect to /login
        expect(mockPush).toHaveBeenCalledWith('/login');

        // Should clear all auth storage keys
        AUTH_STORAGE_KEYS.forEach((key) => {
          expect(localStorage.getItem(key)).toBeNull();
        });

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Unauthenticated RoleGuard does NOT render children.
   */
  it('does not render children when user is unauthenticated', () => {
    fc.assert(
      fc.property(dashboardRouteArb, (route) => {
        mockPush.mockClear();

        const allowedRolesForRoute: UserRole[] = ALL_ROLES.filter(
          (r) => ROLE_DASHBOARD_ROUTES[r] === route
        );

        mockUseAuth = jest.fn().mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });

        const { container, unmount } = render(
          React.createElement(
            RoleGuard,
            { allowedRoles: allowedRolesForRoute },
            React.createElement('div', { 'data-testid': 'protected' }, 'Protected Content')
          )
        );

        expect(container.querySelector('[data-testid="protected"]')).toBeNull();

        unmount();
      }),
      { numRuns: 20 }
    );
  });
});

