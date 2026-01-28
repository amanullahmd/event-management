'use client';

import React, { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectOption } from '@/components/ui/select';

export interface EventFilterValues {
  keyword: string;
  category: string;
  location: string;
  dateRange: string;
}

interface EventFilterProps {
  filters: EventFilterValues;
  onFilterChange: (filters: EventFilterValues) => void;
  onClearFilters: () => void;
  categories: string[];
  locations: string[];
}

/**
 * Event search and filter component
 * Implements keyword search and filters for date, location, and category
 * Requirements: 16.3
 */
export const EventFilter = memo(function EventFilter({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  locations,
}: EventFilterProps) {
  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, keyword: e.target.value });
  }, [filters, onFilterChange]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  }, [filters, onFilterChange]);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, location: e.target.value });
  }, [filters, onFilterChange]);

  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, dateRange: e.target.value });
  }, [filters, onFilterChange]);

  const hasActiveFilters =
    filters.keyword ||
    filters.category ||
    filters.location ||
    filters.dateRange;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Keyword Search */}
        <div className="lg:col-span-2">
          <label
            htmlFor="keyword-search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Events
          </label>
          <Input
            id="keyword-search"
            type="text"
            placeholder="Search by name, description..."
            value={filters.keyword}
            onChange={handleKeywordChange}
            aria-label="Search events by keyword"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label
            htmlFor="category-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <Select
            id="category-filter"
            value={filters.category}
            onChange={handleCategoryChange}
            aria-label="Filter by category"
          >
            <SelectOption value="">All Categories</SelectOption>
            {categories.map((category) => (
              <SelectOption key={category} value={category}>
                {category}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Location Filter */}
        <div>
          <label
            htmlFor="location-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <Select
            id="location-filter"
            value={filters.location}
            onChange={handleLocationChange}
            aria-label="Filter by location"
          >
            <SelectOption value="">All Locations</SelectOption>
            {locations.map((location) => (
              <SelectOption key={location} value={location}>
                {location}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label
            htmlFor="date-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date
          </label>
          <Select
            id="date-filter"
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            aria-label="Filter by date range"
          >
            <SelectOption value="">Any Date</SelectOption>
            <SelectOption value="today">Today</SelectOption>
            <SelectOption value="this-week">This Week</SelectOption>
            <SelectOption value="this-month">This Month</SelectOption>
            <SelectOption value="next-month">Next Month</SelectOption>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
});

export default EventFilter;
