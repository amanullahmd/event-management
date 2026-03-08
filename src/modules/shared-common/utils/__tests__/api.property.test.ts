/**
 * API Utility Property-Based Tests
 *
 * Feature: frontend-role-based-dashboard, Property 13: API URL construction follows correct pattern
 *
 * Validates: Requirements 11.2
 */

import fc from 'fast-check';

// The base URL used by apiRequest when NEXT_PUBLIC_BACKEND_URL is not set
const DEFAULT_BASE_URL = 'http://localhost:8080';

// Arbitrary for generating valid URL path segments (lowercase alphanumeric + hyphens)
const pathSegmentArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);

// Arbitrary for generating endpoint paths like /admin/users, /events, /orders/123
const endpointArb = fc
  .array(pathSegmentArb, { minLength: 1, maxLength: 5 })
  .map(segments => '/' + segments.join('/'));

describe('Property 13: API URL construction follows correct pattern', () => {
  let originalFetch: typeof global.fetch;
  let capturedUrl: string | undefined;

  beforeEach(() => {
    // Clear any env override so the default is used
    delete process.env.NEXT_PUBLIC_BACKEND_URL;

    // Mock localStorage
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      },
      writable: true,
      configurable: true,
    });

    // Mock fetch to capture the URL
    originalFetch = global.fetch;
    capturedUrl = undefined;
    global.fetch = jest.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  /**
   * Property 13: API URL construction follows correct pattern
   *
   * For any endpoint string passed to apiRequest, the constructed URL shall equal
   * `${NEXT_PUBLIC_BACKEND_URL}/api${endpoint}` with no double `/api` prefix.
   *
   * Validates: Requirements 11.2
   */
  it('constructs URL as ${NEXT_PUBLIC_BACKEND_URL}/api${endpoint} for any endpoint', async () => {
    await fc.assert(
      fc.asyncProperty(
        endpointArb,
        async (endpoint) => {
          jest.resetModules();
          const { apiRequest } = await import('../../utils/api');

          await apiRequest(endpoint);

          const expectedUrl = `${DEFAULT_BASE_URL}/api${endpoint}`;
          expect(capturedUrl).toBe(expectedUrl);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('never produces double /api/api when endpoint does not start with /api', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Filter to endpoints that don't start with /api — the correct usage pattern
        endpointArb.filter(ep => !ep.startsWith('/api')),
        async (endpoint) => {
          jest.resetModules();
          const { apiRequest } = await import('../../utils/api');

          await apiRequest(endpoint);

          const expectedUrl = `${DEFAULT_BASE_URL}/api${endpoint}`;
          expect(capturedUrl).toBe(expectedUrl);

          // No double /api prefix when endpoints are correctly formed
          expect(capturedUrl).not.toContain('/api/api');
        }
      ),
      { numRuns: 20 }
    );
  });
});


/**
 * Feature: frontend-role-based-dashboard, Property 12: API requests include JWT Bearer token
 *
 * Validates: Requirements 11.1
 */
describe('Property 12: API requests include JWT Bearer token', () => {
  let originalFetch: typeof global.fetch;
  let capturedHeaders: Record<string, string> | undefined;

  // Arbitrary for generating non-empty JWT-like token strings (alphanumeric + dots + hyphens + underscores)
  const tokenArb = fc.stringMatching(/^[A-Za-z0-9._-]{1,200}$/).filter(s => s.length > 0);

  // Arbitrary for generating valid endpoint paths
  const endpointPathArb = fc
    .array(fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/), { minLength: 1, maxLength: 4 })
    .map(segments => '/' + segments.join('/'));

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;

    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      },
      writable: true,
      configurable: true,
    });

    originalFetch = global.fetch;
    capturedHeaders = undefined;
    global.fetch = jest.fn().mockImplementation((_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string> | undefined;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  /**
   * Property 12: API requests include JWT Bearer token
   *
   * For any API request made via apiRequest while a token exists in localStorage
   * under `auth_token`, the request shall include an Authorization header with
   * value `Bearer {token}`.
   *
   * **Validates: Requirements 11.1**
   */
  it('includes Authorization: Bearer {token} header for any token stored in localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        tokenArb,
        endpointPathArb,
        async (token, endpoint) => {
          jest.resetModules();

          // Store the token in localStorage before making the request
          localStorage.setItem('auth_token', token);

          const { apiRequest } = await import('../../utils/api');

          await apiRequest(endpoint);

          expect(capturedHeaders).toBeDefined();
          expect(capturedHeaders!['Authorization']).toBe(`Bearer ${token}`);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('does not include Authorization header when no token is in localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        endpointPathArb,
        async (endpoint) => {
          jest.resetModules();

          // Ensure no token is stored
          localStorage.removeItem('auth_token');

          const { apiRequest } = await import('../../utils/api');

          await apiRequest(endpoint);

          expect(capturedHeaders).toBeDefined();
          expect(capturedHeaders!['Authorization']).toBeUndefined();
        }
      ),
      { numRuns: 20 }
    );
  });
});

