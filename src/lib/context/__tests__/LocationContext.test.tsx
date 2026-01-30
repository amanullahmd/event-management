/**
 * Unit tests for LocationContext
 * Tests location state management and localStorage persistence
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LocationProvider,
  useLocation,
  getLocationDisplayName,
  getLocationById,
  Location,
} from '../LocationContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the location context
function TestConsumer() {
  const { selectedLocation, setSelectedLocation, availableLocations } = useLocation();
  
  return (
    <div>
      <span data-testid="selected-location">{selectedLocation || 'none'}</span>
      <span data-testid="location-count">{availableLocations.length}</span>
      <button
        data-testid="set-new-york"
        onClick={() => setSelectedLocation('new-york')}
      >
        Set New York
      </button>
      <button
        data-testid="set-los-angeles"
        onClick={() => setSelectedLocation('los-angeles')}
      >
        Set Los Angeles
      </button>
      <button
        data-testid="clear-location"
        onClick={() => setSelectedLocation(null)}
      >
        Clear Location
      </button>
    </div>
  );
}

describe('LocationContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('LocationProvider', () => {
    test('provides default null location when no stored value exists', () => {
      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      expect(screen.getByTestId('selected-location')).toHaveTextContent('none');
    });

    test('provides available locations list', () => {
      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      // Should have at least 10 major cities
      const locationCount = parseInt(screen.getByTestId('location-count').textContent || '0');
      expect(locationCount).toBeGreaterThanOrEqual(10);
    });

    test('reads location from localStorage on mount', async () => {
      localStorageMock.setItem('selected_location', 'new-york');

      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-location')).toHaveTextContent('new-york');
      });
    });

    test('clears invalid stored location', async () => {
      localStorageMock.setItem('selected_location', 'invalid-city-xyz');

      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-location')).toHaveTextContent('none');
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('selected_location');
    });
  });

  describe('setSelectedLocation', () => {
    test('updates selected location state', async () => {
      const user = userEvent.setup();

      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      await user.click(screen.getByTestId('set-new-york'));

      expect(screen.getByTestId('selected-location')).toHaveTextContent('new-york');
    });

    test('persists location to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      await user.click(screen.getByTestId('set-new-york'));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('selected_location', 'new-york');
    });

    test('removes location from localStorage when set to null', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('selected_location', 'new-york');

      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      await user.click(screen.getByTestId('clear-location'));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('selected_location');
      expect(screen.getByTestId('selected-location')).toHaveTextContent('none');
    });

    test('allows changing location multiple times', async () => {
      const user = userEvent.setup();

      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      await user.click(screen.getByTestId('set-new-york'));
      expect(screen.getByTestId('selected-location')).toHaveTextContent('new-york');

      await user.click(screen.getByTestId('set-los-angeles'));
      expect(screen.getByTestId('selected-location')).toHaveTextContent('los-angeles');

      await user.click(screen.getByTestId('clear-location'));
      expect(screen.getByTestId('selected-location')).toHaveTextContent('none');
    });
  });

  describe('useLocation hook', () => {
    test('throws error when used outside LocationProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useLocation must be used within a LocationProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('getLocationDisplayName', () => {
    test('returns "All Locations" for null input', () => {
      expect(getLocationDisplayName(null)).toBe('All Locations');
    });

    test('returns location name for valid location ID', () => {
      expect(getLocationDisplayName('new-york')).toBe('New York');
      expect(getLocationDisplayName('los-angeles')).toBe('Los Angeles');
    });

    test('returns original value for unknown location', () => {
      expect(getLocationDisplayName('unknown-city')).toBe('unknown-city');
    });

    test('works with custom locations array', () => {
      const customLocations: Location[] = [
        { id: 'custom-1', name: 'Custom City 1' },
        { id: 'custom-2', name: 'Custom City 2' },
      ];

      expect(getLocationDisplayName('custom-1', customLocations)).toBe('Custom City 1');
      expect(getLocationDisplayName('unknown', customLocations)).toBe('unknown');
    });
  });

  describe('getLocationById', () => {
    test('returns location object for valid ID', () => {
      const location = getLocationById('new-york');
      expect(location).toBeDefined();
      expect(location?.name).toBe('New York');
      expect(location?.region).toBe('NY');
    });

    test('returns undefined for invalid ID', () => {
      const location = getLocationById('invalid-city');
      expect(location).toBeUndefined();
    });

    test('works with custom locations array', () => {
      const customLocations: Location[] = [
        { id: 'custom-1', name: 'Custom City 1', region: 'CC' },
      ];

      const location = getLocationById('custom-1', customLocations);
      expect(location?.name).toBe('Custom City 1');
      expect(location?.region).toBe('CC');
    });
  });

  describe('Available locations', () => {
    test('includes major US cities', () => {
      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      const { availableLocations } = useLocationFromProvider();
      
      const cityNames = availableLocations.map(loc => loc.name);
      expect(cityNames).toContain('New York');
      expect(cityNames).toContain('Los Angeles');
      expect(cityNames).toContain('Chicago');
      expect(cityNames).toContain('San Francisco');
    });

    test('each location has required properties', () => {
      render(
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      );

      const { availableLocations } = useLocationFromProvider();
      
      availableLocations.forEach(location => {
        expect(location.id).toBeDefined();
        expect(location.name).toBeDefined();
        expect(typeof location.id).toBe('string');
        expect(typeof location.name).toBe('string');
      });
    });
  });
});

// Helper to get location context value for assertions
let capturedContext: ReturnType<typeof useLocation> | null = null;

function ContextCapture() {
  capturedContext = useLocation();
  return null;
}

function useLocationFromProvider() {
  render(
    <LocationProvider>
      <ContextCapture />
    </LocationProvider>
  );
  if (!capturedContext) {
    throw new Error('Context not captured');
  }
  return capturedContext;
}
