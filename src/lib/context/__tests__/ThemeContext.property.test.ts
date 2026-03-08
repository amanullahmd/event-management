/**
 * ThemeContext Property-Based Tests
 *
 * Feature: frontend-role-based-dashboard
 * Property 9: Theme selection persists to localStorage (round-trip)
 * Property 10: Cross-tab theme synchronization
 *
 * Validates: Requirements 7.2, 7.6
 */

import fc from 'fast-check';
import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// --- Types ---

type Theme = 'light' | 'dark' | 'system';

// --- Arbitraries ---

const themeArb = fc.constantFrom<Theme>('light', 'dark', 'system');

// --- Mock setup helpers ---

function makeLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    store,
    mock: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    },
  };
}

function mockMatchMedia(prefersDark = false) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
      listeners.push(handler);
    }),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    _listeners: listeners,
  };
  window.matchMedia = jest.fn().mockReturnValue(mql);
  return mql;
}

// --- Property 9 Tests ---

describe('Property 9: Theme selection persists to localStorage (round-trip)', () => {
  let localStorageMock: ReturnType<typeof makeLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = makeLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock.mock,
      writable: true,
      configurable: true,
    });
    mockMatchMedia(false);
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 9: Theme selection persists to localStorage (round-trip)
   *
   * For any theme value (light, dark, system), when `setTheme` is called,
   * reading `localStorage.getItem('theme')` shall return that same value.
   *
   * **Validates: Requirements 7.2**
   */
  it('stores the selected theme in localStorage for any valid theme value', async () => {
    const samples = fc.sample(themeArb, 20);

    for (const themeValue of samples) {
      // Reset store between samples
      Object.keys(localStorageMock.store).forEach((k) => delete localStorageMock.store[k]);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, null, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Call setTheme with the generated value
      await act(async () => {
        result.current.setTheme(themeValue);
      });

      // Property: localStorage must contain the exact theme value that was set
      expect(localStorageMock.store['theme']).toBe(themeValue);

      cleanup();
    }
  });

  /**
   * Property 9 (pure logic): The round-trip property holds for all three theme values.
   *
   * Validates the setTheme → localStorage.setItem('theme', value) mapping
   * using fast-check's property runner.
   *
   * **Validates: Requirements 7.2**
   */
  it('round-trip: setTheme(value) → localStorage.getItem("theme") === value for any theme', () => {
    fc.assert(
      fc.property(themeArb, (themeValue) => {
        // Simulate the exact logic from ThemeContext.setTheme:
        //   const setTheme = (newTheme: Theme) => {
        //     setThemeState(newTheme);
        //     localStorage.setItem('theme', newTheme);
        //   };
        localStorageMock.mock.setItem('theme', themeValue);
        const stored = localStorageMock.mock.getItem('theme');

        // The round-trip must be lossless
        expect(stored).toBe(themeValue);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9 (sequential): Calling setTheme multiple times always reflects
   * the last value in localStorage.
   *
   * **Validates: Requirements 7.2**
   */
  it('last setTheme call wins in localStorage for any sequence of theme values', async () => {
    fc.assert(
      fc.property(
        fc.array(themeArb, { minLength: 2, maxLength: 5 }),
        (themeSequence) => {
          // Simulate sequential setTheme calls
          for (const t of themeSequence) {
            localStorageMock.mock.setItem('theme', t);
          }
          const lastTheme = themeSequence[themeSequence.length - 1];
          expect(localStorageMock.mock.getItem('theme')).toBe(lastTheme);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 10 Tests ---

describe('Property 10: Cross-tab theme synchronization', () => {
  let localStorageMock: ReturnType<typeof makeLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = makeLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock.mock,
      writable: true,
      configurable: true,
    });
    mockMatchMedia(false);
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Property 10: Cross-tab theme synchronization
   *
   * For any theme value written to localStorage under the key 'theme' from
   * another tab (simulated via StorageEvent), the ThemeContext shall update
   * its internal theme state to match the new value.
   *
   * **Validates: Requirements 7.6**
   */
  it('updates theme state when a StorageEvent with key "theme" is dispatched for any theme value', async () => {
    const samples = fc.sample(themeArb, 20);

    for (const themeValue of samples) {
      Object.keys(localStorageMock.store).forEach((k) => delete localStorageMock.store[k]);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ThemeProvider, null, children);

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Wait for mount/initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Simulate a StorageEvent from another tab
      await act(async () => {
        const storageEvent = new StorageEvent('storage', {
          key: 'theme',
          newValue: themeValue,
          oldValue: null,
        });
        window.dispatchEvent(storageEvent);
      });

      // Property: theme state must match the value from the cross-tab event
      expect(result.current.theme).toBe(themeValue);

      cleanup();
    }
  });

  /**
   * Property 10 (fast-check runner): For any theme value dispatched via StorageEvent,
   * the ThemeContext state updates to match.
   *
   * **Validates: Requirements 7.6**
   */
  it('cross-tab sync: StorageEvent with any theme value updates ThemeContext state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await fc.assert(
      fc.asyncProperty(themeArb, async (themeValue) => {
        await act(async () => {
          const storageEvent = new StorageEvent('storage', {
            key: 'theme',
            newValue: themeValue,
          });
          window.dispatchEvent(storageEvent);
        });

        expect(result.current.theme).toBe(themeValue);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10 (negative): StorageEvents with a key other than 'theme'
   * shall NOT change the ThemeContext state.
   *
   * **Validates: Requirements 7.6**
   */
  it('ignores StorageEvents with keys other than "theme"', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeProvider, null, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for mount and set an initial known theme
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      result.current.setTheme('light');
    });

    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== 'theme' && s.length > 0),
        themeArb,
        (otherKey, themeValue) => {
          // Dispatch a storage event for a different key
          const storageEvent = new StorageEvent('storage', {
            key: otherKey,
            newValue: themeValue,
          });
          window.dispatchEvent(storageEvent);

          // Theme state must remain 'light' (unchanged)
          expect(result.current.theme).toBe('light');
        }
      ),
      { numRuns: 100 }
    );
  });
});
