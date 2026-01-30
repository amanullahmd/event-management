'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * Location context for managing location-based event discovery
 * Provides location state to all components and persists selection to localStorage
 */

// Storage key for localStorage persistence
const LOCATION_STORAGE_KEY = 'selected_location';

/**
 * Location interface representing a city/region for event discovery
 */
export interface Location {
  id: string;
  name: string;
  region?: string;
  eventCount?: number;
}

/**
 * Context value interface for LocationContext
 */
export interface LocationContextValue {
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  availableLocations: Location[];
}

// Default available locations - major cities for event discovery
const defaultLocations: Location[] = [
  { id: 'new-york', name: 'New York', region: 'NY', eventCount: 1250 },
  { id: 'los-angeles', name: 'Los Angeles', region: 'CA', eventCount: 980 },
  { id: 'chicago', name: 'Chicago', region: 'IL', eventCount: 720 },
  { id: 'houston', name: 'Houston', region: 'TX', eventCount: 540 },
  { id: 'phoenix', name: 'Phoenix', region: 'AZ', eventCount: 380 },
  { id: 'philadelphia', name: 'Philadelphia', region: 'PA', eventCount: 420 },
  { id: 'san-antonio', name: 'San Antonio', region: 'TX', eventCount: 290 },
  { id: 'san-diego', name: 'San Diego', region: 'CA', eventCount: 450 },
  { id: 'dallas', name: 'Dallas', region: 'TX', eventCount: 580 },
  { id: 'san-jose', name: 'San Jose', region: 'CA', eventCount: 320 },
  { id: 'austin', name: 'Austin', region: 'TX', eventCount: 610 },
  { id: 'seattle', name: 'Seattle', region: 'WA', eventCount: 490 },
  { id: 'denver', name: 'Denver', region: 'CO', eventCount: 410 },
  { id: 'boston', name: 'Boston', region: 'MA', eventCount: 560 },
  { id: 'miami', name: 'Miami', region: 'FL', eventCount: 680 },
  { id: 'atlanta', name: 'Atlanta', region: 'GA', eventCount: 520 },
  { id: 'san-francisco', name: 'San Francisco', region: 'CA', eventCount: 750 },
  { id: 'portland', name: 'Portland', region: 'OR', eventCount: 340 },
  { id: 'nashville', name: 'Nashville', region: 'TN', eventCount: 390 },
  { id: 'las-vegas', name: 'Las Vegas', region: 'NV', eventCount: 470 },
];

// Create the context with undefined default value
const LocationContext = createContext<LocationContextValue | undefined>(undefined);

/**
 * LocationProvider component that wraps the application with location context
 * Handles localStorage persistence for returning users
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  // Initialize with null - will be updated from localStorage on mount
  const [selectedLocation, setSelectedLocationState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Read location from localStorage on mount
  useEffect(() => {
    try {
      const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (storedLocation) {
        // Validate that the stored location exists in available locations
        const isValidLocation = defaultLocations.some(
          (loc) => loc.id === storedLocation || loc.name === storedLocation
        );
        if (isValidLocation) {
          setSelectedLocationState(storedLocation);
        } else {
          // Clear invalid stored location
          localStorage.removeItem(LOCATION_STORAGE_KEY);
        }
      }
      // When no location is selected, default to showing events from all locations (null)
    } catch (error) {
      console.error('Failed to read location from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Memoized setter that also persists to localStorage
  const setSelectedLocation = useCallback((location: string | null) => {
    setSelectedLocationState(location);
    
    try {
      if (location === null) {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      } else {
        localStorage.setItem(LOCATION_STORAGE_KEY, location);
      }
    } catch (error) {
      console.error('Failed to persist location to localStorage:', error);
    }
  }, []);

  const value: LocationContextValue = {
    selectedLocation,
    setSelectedLocation,
    availableLocations: defaultLocations,
  };

  // Render children even before initialization to avoid hydration issues
  // The selectedLocation will update once localStorage is read
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to access location context
 * @throws Error if used outside of LocationProvider
 */
export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

/**
 * Helper function to get location display name
 * @param locationId - The location ID or name
 * @param locations - Array of available locations
 * @returns The display name for the location, or the original value if not found
 */
export function getLocationDisplayName(
  locationId: string | null,
  locations: Location[] = defaultLocations
): string {
  if (!locationId) return 'All Locations';
  
  const location = locations.find(
    (loc) => loc.id === locationId || loc.name === locationId
  );
  
  return location ? location.name : locationId;
}

/**
 * Helper function to get location by ID
 * @param locationId - The location ID
 * @param locations - Array of available locations
 * @returns The Location object or undefined if not found
 */
export function getLocationById(
  locationId: string,
  locations: Location[] = defaultLocations
): Location | undefined {
  return locations.find((loc) => loc.id === locationId);
}

// Export the context for advanced use cases (e.g., testing)
export { LocationContext };
