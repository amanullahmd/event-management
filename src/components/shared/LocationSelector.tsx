/**
 * LocationSelector Component
 * 
 * A dropdown component with search functionality for selecting a location
 * (city/region) for location-based event discovery. Integrates with LocationContext
 * to persist selection and update all location-dependent sections.
 * 
 * Features:
 * - Searchable dropdown with city list
 * - Display of event count for each location
 * - Integration with LocationContext for state persistence
 * - Keyboard navigation support
 * - Mobile-friendly design
 * 
 * @example
 * ```tsx
 * <LocationSelector 
 *   value={selectedLocation}
 *   onChange={setSelectedLocation}
 *   locations={availableLocations}
 * />
 * ```
 * 
 * Requirements: 2.1, 2.5
 */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Location } from '@/lib/context/LocationContext';

export interface LocationSelectorProps {
  /** Currently selected location ID or name */
  value: string | null;
  /** Callback when location selection changes */
  onChange: (location: string | null) => void;
  /** Available locations to choose from */
  locations: Location[];
  /** Additional CSS classes */
  className?: string;
  /** Placeholder text for the selector */
  placeholder?: string;
}

/**
 * LocationSelector component for location-based event discovery
 * 
 * @param props - LocationSelector configuration props
 * @returns JSX element containing the location selector dropdown
 * 
 * Validates: Requirements 2.1 (Display Location_Selector dropdown with search functionality)
 * Validates: Requirements 2.5 (Display searchable list of available cities/regions with icons)
 */
export function LocationSelector({
  value,
  onChange,
  locations,
  className,
  placeholder = 'Select a location',
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * Filter locations based on search query
   */
  const filteredLocations = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return locations;
    }

    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.region?.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  /**
   * Get the display name for the selected location
   */
  const selectedLocationName = React.useMemo(() => {
    if (!value) {
      return placeholder;
    }

    const location = locations.find(
      (loc) => loc.id === value || loc.name === value
    );

    return location ? location.name : value;
  }, [value, locations, placeholder]);

  /**
   * Handle location selection
   */
  const handleSelectLocation = useCallback(
    (locationId: string | null) => {
      onChange(locationId);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange]
  );

  /**
   * Handle clear selection
   */
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSelectLocation(null);
    },
    [handleSelectLocation]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Enter' && filteredLocations.length > 0) {
        handleSelectLocation(filteredLocations[0].id);
      }
    },
    [filteredLocations, handleSelectLocation]
  );

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  /**
   * Focus search input when dropdown opens
   */
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full max-w-xs', className)}
    >
      {/* Selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg',
          'bg-white dark:bg-slate-800',
          'border border-slate-200 dark:border-slate-700',
          'flex items-center justify-between gap-2',
          'text-slate-900 dark:text-slate-50',
          'hover:border-slate-300 dark:hover:border-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
          'transition-all duration-200',
          isOpen && 'ring-2 ring-violet-500 ring-offset-2'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        type="button"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="w-4 h-4 flex-shrink-0 text-violet-600 dark:text-violet-400" />
          <span className="truncate text-sm font-medium">
            {selectedLocationName}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button
              onClick={handleClear}
              className={cn(
                'p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700',
                'transition-colors'
              )}
              aria-label="Clear location selection"
              type="button"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          )}

          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-500 dark:text-slate-400',
              'transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-2',
            'bg-white dark:bg-slate-800',
            'border border-slate-200 dark:border-slate-700',
            'rounded-lg shadow-lg',
            'overflow-hidden'
          )}
          role="listbox"
        >
          {/* Search input */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'w-full pl-9 pr-3 py-2',
                  'bg-slate-50 dark:bg-slate-700',
                  'border border-slate-200 dark:border-slate-600',
                  'rounded text-sm',
                  'text-slate-900 dark:text-slate-50',
                  'placeholder-slate-500 dark:placeholder-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500',
                  'transition-all'
                )}
              />
            </div>
          </div>

          {/* Location list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLocations.length > 0 ? (
              <ul className="py-1">
                {/* "All Locations" option */}
                <li>
                  <button
                    onClick={() => handleSelectLocation(null)}
                    className={cn(
                      'w-full px-4 py-2.5 text-left',
                      'flex items-center justify-between gap-2',
                      'text-sm transition-colors',
                      value === null
                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    )}
                    role="option"
                    aria-selected={value === null}
                    type="button"
                  >
                    <span>All Locations</span>
                  </button>
                </li>

                {/* Location options */}
                {filteredLocations.map((location) => (
                  <li key={location.id}>
                    <button
                      onClick={() => handleSelectLocation(location.id)}
                      className={cn(
                        'w-full px-4 py-2.5 text-left',
                        'flex items-center justify-between gap-2',
                        'text-sm transition-colors',
                        value === location.id
                          ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      )}
                      role="option"
                      aria-selected={value === location.id}
                      type="button"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {location.name}
                          </div>
                          {location.region && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {location.region}
                            </div>
                          )}
                        </div>
                      </div>

                      {location.eventCount !== undefined && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                          {location.eventCount} events
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No locations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationSelector;

