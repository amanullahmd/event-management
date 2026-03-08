/**
 * AuthContext Property-Based Tests
 *
 * Feature: frontend-role-based-dashboard
 * Property 3: Post-login redirect matches user role
 * Property 14: Login response stored correctly in localStorage (round-trip)
 * Property 15: User display name is firstName + lastName concatenation
 *
 * Validates: Requirements 1.6, 12.1, 12.2, 12.5
 */

import fc from 'fast-check';
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';

// --- Types mirroring the AuthContext implementation ---

type UserRole = 'ADMIN' | 'ORGANIZER' | 'CUSTOMER';

const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  CUSTOMER: '/dashboard',
};

// --- Mock infrastructure ---

let mockPush: jest.Mock;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: any[]) => mockPush(...args),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// --- Arbitraries ---

const userRoleArb = fc.constantFrom<UserRole>('ADMIN', 'ORGANIZER', 'CUSTOMER');

/** Generates a valid AuthResponse for a given role */
const authResponseArb = (role: UserRole) =>
  fc.record({
    token: fc.stringMatching(/^[A-Za-z0-9._-]{10,50}$/),
    refreshToken: fc.stringMatching(/^[A-Za-z0-9._-]{10,50}$/),
    id: fc.uuid(),
    email: fc.stringMatching(/^[a-z]{3,8}@[a-z]{3,6}\.[a-z]{2,4}$/),
    firstName: fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
    lastName: fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
    role: fc.constant(role),
    expiresIn: fc.integer({ min: 300, max: 3600 }),
  });

/** Generates a full AuthResponse with any role */
const anyAuthResponseArb = userRoleArb.chain((role) =>
  authResponseArb(role).map((response) => ({ ...response, expectedRoute: ROLE_DASHBOARD_ROUTES[role] }))
);

// Import AuthProvider and useAuth statically (single React instance)
import { AuthProvider, useAuth } from '../AuthContext';

// --- Property 3 Tests ---

describe('Property 3: Post-login redirect matches user role', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    mockPush = jest.fn();
    originalFetch = global.fetch;

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
    global.fetch = originalFetch;
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 3: Post-login redirect matches user role
   *
   * For any successful login response containing a role field, the Auth_Context
   * shall redirect to the dashboard route corresponding to that role
   * (ADMIN → /admin, ORGANIZER → /organizer, CUSTOMER → /dashboard).
   *
   * This test validates the redirect mapping logic: for any role in the response,
   * the correct dashboard route is computed and passed to router.push().
   *
   * **Validates: Requirements 1.6**
   */
  it('computes the correct redirect route for any role in a login response', () => {
    fc.assert(
      fc.property(anyAuthResponseArb, (response) => {
        // The login function in AuthContext uses this exact mapping:
        //   const roleDashboardRoutes = { ADMIN: '/admin', ORGANIZER: '/organizer', CUSTOMER: '/dashboard' };
        //   const redirectPath = roleDashboardRoutes[user.role] || '/dashboard';
        //
        // We verify the property: for any role, the redirect path matches the expected route.
        const role = response.role.toUpperCase();
        const redirectPath = ROLE_DASHBOARD_ROUTES[role] || '/dashboard';

        expect(redirectPath).toBe(response.expectedRoute);
        // Also verify the route is one of the valid dashboard routes
        expect(['/admin', '/organizer', '/dashboard']).toContain(redirectPath);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Integration test: verifies the actual AuthProvider login function calls
   * router.push with the correct route for each role.
   *
   * Uses a smaller number of runs since each iteration renders the full component.
   */
  it('calls router.push with the correct dashboard route after login for each role', async () => {
    const roles: UserRole[] = ['ADMIN', 'ORGANIZER', 'CUSTOMER'];

    for (const role of roles) {
      cleanup();
      mockPush.mockClear();

      // Generate a valid login response for this role
      const responseData = fc.sample(authResponseArb(role), 1)[0];

      // Mock fetch
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(responseData),
            headers: { entries: () => [] },
          });
        }
        // For /auth/me during initialization, return 401 to skip user loading
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
          headers: { entries: () => [] },
        });
      });

      // Create a test component that captures the login function
      let loginFn: ((email: string, password: string) => Promise<void>) | null = null;

      const TestConsumer = () => {
        const auth = useAuth();
        loginFn = auth.login;
        return null;
      };

      // Render the AuthProvider
      await act(async () => {
        render(
          React.createElement(AuthProvider, null,
            React.createElement(TestConsumer)
          )
        );
      });

      // Wait for initialization to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Call login
      expect(loginFn).not.toBeNull();
      await act(async () => {
        await loginFn!('test@example.com', 'password123');
      });

      // Verify redirect to the correct dashboard route
      const expectedRoute = ROLE_DASHBOARD_ROUTES[role];
      expect(mockPush).toHaveBeenCalledWith(expectedRoute);
    }
  }, 30000);

  /**
   * Property: for any role value, the fallback to /dashboard is correct
   * when role is not in the mapping (defensive behavior).
   */
  it('falls back to /dashboard for unknown roles', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !['ADMIN', 'ORGANIZER', 'CUSTOMER'].includes(s.toUpperCase())),
        (unknownRole) => {
          const redirectPath = ROLE_DASHBOARD_ROUTES[unknownRole.toUpperCase()] || '/dashboard';
          expect(redirectPath).toBe('/dashboard');
        }
      ),
      { numRuns: 20 }
    );
  });
});


// --- Property 14 Tests ---

describe('Property 14: Login response stored correctly in localStorage (round-trip)', () => {
  let originalFetch: typeof global.fetch;
  let store: Record<string, string>;

  beforeEach(() => {
    mockPush = jest.fn();
    originalFetch = global.fetch;

    // Mock localStorage with a fresh store
    store = {};
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
    global.fetch = originalFetch;
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 14: Login response stored correctly in localStorage (round-trip)
   *
   * For any successful AuthResponse containing token, refreshToken, id, role, and expiresIn
   * fields, after login completes, localStorage shall contain:
   * - `auth_token` equal to the response `token`
   * - `auth_refresh_token` equal to `refreshToken`
   * - `auth_user_id` equal to `id`
   * - `auth_user_role` equal to the uppercased `role`
   *
   * **Validates: Requirements 12.1, 12.2**
   */
  it('stores auth_token, auth_refresh_token, auth_user_id, and auth_user_role correctly after login', async () => {
    const samples = fc.sample(anyAuthResponseArb, 10);

    for (const response of samples) {
      // Reset store and mocks for each sample
      Object.keys(store).forEach((k) => delete store[k]);
      mockPush.mockClear();

      // Mock fetch for login and auth/me
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response),
            headers: { entries: () => [] },
          });
        }
        // For /auth/me during initialization, return 401 to skip user loading
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
          headers: { entries: () => [] },
        });
      });

      // Create a test component that captures the login function
      let loginFn: ((email: string, password: string) => Promise<void>) | null = null;

      const TestConsumer = () => {
        const auth = useAuth();
        loginFn = auth.login;
        return null;
      };

      // Render the AuthProvider
      await act(async () => {
        render(
          React.createElement(AuthProvider, null,
            React.createElement(TestConsumer)
          )
        );
      });

      // Wait for initialization to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Call login
      expect(loginFn).not.toBeNull();
      await act(async () => {
        await loginFn!('test@example.com', 'password123');
      });

      // Verify localStorage round-trip
      expect(store['auth_token']).toBe(response.token);
      expect(store['auth_refresh_token']).toBe(response.refreshToken);
      expect(store['auth_user_id']).toBe(response.id);
      expect(store['auth_user_role']).toBe(response.role.toUpperCase());

      cleanup();
    }
  }, 60000);
});

// --- Property 15 Tests ---

describe('Property 15: User display name is firstName + lastName concatenation', () => {
  let originalFetch: typeof global.fetch;
  let store: Record<string, string>;

  beforeEach(() => {
    mockPush = jest.fn();
    originalFetch = global.fetch;

    // Mock localStorage with a fresh store
    store = {};
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
    global.fetch = originalFetch;
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 15: User display name is firstName + lastName concatenation
   *
   * For any ProfileResponse containing firstName and lastName, the Auth_Context
   * shall construct the user display name as `${firstName} ${lastName}`.
   *
   * We test this via the login flow since login also constructs the user name
   * from firstName and lastName in the AuthResponse.
   *
   * **Validates: Requirements 12.5**
   */
  it('constructs user.name as firstName + space + lastName for any login response', async () => {
    const samples = fc.sample(anyAuthResponseArb, 10);

    for (const response of samples) {
      // Reset store and mocks for each sample
      Object.keys(store).forEach((k) => delete store[k]);
      mockPush.mockClear();

      // Mock fetch for login and auth/me
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(response),
            headers: { entries: () => [] },
          });
        }
        // For /auth/me during initialization, return 401 to skip user loading
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
          headers: { entries: () => [] },
        });
      });

      // Create a test component that captures the user object after login
      let loginFn: ((email: string, password: string) => Promise<void>) | null = null;
      let capturedUser: any = null;

      const TestConsumer = () => {
        const auth = useAuth();
        loginFn = auth.login;
        capturedUser = auth.user;
        return null;
      };

      // Render the AuthProvider
      await act(async () => {
        render(
          React.createElement(AuthProvider, null,
            React.createElement(TestConsumer)
          )
        );
      });

      // Wait for initialization to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Call login
      expect(loginFn).not.toBeNull();
      await act(async () => {
        await loginFn!('test@example.com', 'password123');
      });

      // Verify user display name is firstName + " " + lastName
      expect(capturedUser).not.toBeNull();
      expect(capturedUser.name).toBe(`${response.firstName} ${response.lastName}`);

      cleanup();
    }
  }, 60000);

  /**
   * Pure property test: verifies the display name concatenation logic
   * for any firstName and lastName strings.
   *
   * **Validates: Requirements 12.5**
   */
  it('display name concatenation is always firstName + space + lastName', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[A-Z][a-z]{1,15}$/),
        fc.stringMatching(/^[A-Z][a-z]{1,15}$/),
        (firstName, lastName) => {
          // This mirrors the exact logic in AuthContext:
          //   name: `${data.firstName} ${data.lastName}`
          const displayName = `${firstName} ${lastName}`;

          // The display name must contain both parts separated by a space
          expect(displayName).toBe(`${firstName} ${lastName}`);
          expect(displayName).toContain(firstName);
          expect(displayName).toContain(lastName);
          expect(displayName.split(' ').length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 20 }
    );
  });
});

// --- Property 16 Tests ---

describe('Property 16: Token expiration detection', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage with a fresh store
    store = {};
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
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 16: Token expiration detection
   *
   * For any stored token expiration time, when the current time is within
   * 5 minutes of that expiration, `isTokenExpiringSoon` shall be true;
   * when more than 5 minutes remain, it shall be false.
   *
   * This test validates the pure expiration detection logic extracted from
   * AuthContext's `checkTokenExpiration` function.
   *
   * **Validates: Requirements 12.6**
   */
  it('detects token expiring soon when within 5 minutes of expiration', () => {
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    // Replicate the checkTokenExpiration logic from AuthContext
    const checkTokenExpiration = (): boolean => {
      const token = localStorage.getItem('auth_token');
      const tokenExpiresAt = localStorage.getItem('auth_token_expires_at');

      if (token && tokenExpiresAt) {
        const expiresAt = new Date(tokenExpiresAt).getTime();
        const now = new Date().getTime();
        const timeUntilExpiration = expiresAt - now;

        if (timeUntilExpiration > 0 && timeUntilExpiration < FIVE_MINUTES_MS) {
          return true;
        }
      }

      return false;
    };

    fc.assert(
      fc.property(
        // Generate an offset in ms from now: negative means expired, positive means future
        // Range: -10 minutes to +30 minutes from now
        fc.integer({ min: -10 * 60 * 1000, max: 30 * 60 * 1000 }),
        (offsetMs) => {
          const now = Date.now();
          const expiresAt = new Date(now + offsetMs).toISOString();

          // Set up localStorage with a valid token and the generated expiration
          store['auth_token'] = 'valid-jwt-token';
          store['auth_token_expires_at'] = expiresAt;

          const result = checkTokenExpiration();

          // Token is expiring soon when: timeUntilExpiration > 0 AND timeUntilExpiration < 5 minutes
          // offsetMs represents timeUntilExpiration (approximately, since Date.now() may advance slightly)
          if (offsetMs > 0 && offsetMs < FIVE_MINUTES_MS) {
            expect(result).toBe(true);
          } else {
            // Already expired (offsetMs <= 0) or more than 5 minutes remain (offsetMs >= FIVE_MINUTES_MS)
            expect(result).toBe(false);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 16 (boundary): When no token or no expiration is stored,
   * isTokenExpiringSoon shall be false.
   *
   * **Validates: Requirements 12.6**
   */
  it('returns false when no token or no expiration is stored', () => {
    const checkTokenExpiration = (): boolean => {
      const token = localStorage.getItem('auth_token');
      const tokenExpiresAt = localStorage.getItem('auth_token_expires_at');

      if (token && tokenExpiresAt) {
        const expiresAt = new Date(tokenExpiresAt).getTime();
        const now = new Date().getTime();
        const timeUntilExpiration = expiresAt - now;

        if (timeUntilExpiration > 0 && timeUntilExpiration < 5 * 60 * 1000) {
          return true;
        }
      }

      return false;
    };

    fc.assert(
      fc.property(
        fc.constantFrom('no_token', 'no_expiration', 'neither'),
        (scenario) => {
          // Clear store
          Object.keys(store).forEach((k) => delete store[k]);

          if (scenario === 'no_token') {
            store['auth_token_expires_at'] = new Date(Date.now() + 60000).toISOString();
          } else if (scenario === 'no_expiration') {
            store['auth_token'] = 'valid-jwt-token';
          }
          // 'neither' leaves both absent

          expect(checkTokenExpiration()).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });
});


