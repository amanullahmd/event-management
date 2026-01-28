'use client';

import React, { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectOption } from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';

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

  const hasActiveFilters = filters.keyword || filters.category || filters.location || filters.dateRange;
  const activeFilterCount = [filters.keyword, filters.category, filters.location, filters.dateRange].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Filter Events</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : 'Find your perfect event'}
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="keyword-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Events
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              id="keyword-search"
              type="text"
              placeholder="Search by name, description..."
              value={filters.keyword}
              onChange={handleKeywordChange}
              className="pl-10 border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-violet-500 focus:ring-violet-500 dark:focus:border-violet-400"
            />
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <Select 
            id="category-filter" 
            value={filters.category} 
            onChange={handleCategoryChange} 
            className="border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
          >
            <SelectOption value="">All Categories</SelectOption>
            {categories.map((category) => (
              <SelectOption key={category} value={category}>{category}</SelectOption>
            ))}
          </Select>
        </div>

        {/* Location Select */}
        <div>
          <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <Select 
            id="location-filter" 
            value={filters.location} 
            onChange={handleLocationChange} 
            className="border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
          >
            <SelectOption value="">All Locations</SelectOption>
            {locations.map((location) => (
              <SelectOption key={location} value={location}>{location}</SelectOption>
            ))}
          </Select>
        </div>

        {/* Date Select */}
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <Select 
            id="date-filter" 
            value={filters.dateRange} 
            onChange={handleDateRangeChange} 
            className="border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-violet-500 focus:ring-violet-500"
          >
            <SelectOption value="">Any Date</SelectOption>
            <SelectOption value="today">Today</SelectOption>
            <SelectOption value="this-week">This Week</SelectOption>
            <SelectOption value="this-month">This Month</SelectOption>
          </Select>
        </div>
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
            {filters.keyword && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                &quot;{filters.keyword}&quot;
                <button 
                  onClick={() => onFilterChange({ ...filters, keyword: '' })}
                  className="ml-2 hover:text-violet-900 dark:hover:text-violet-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300">
                {filters.category}
                <button 
                  onClick={() => onFilterChange({ ...filters, category: '' })}
                  className="ml-2 hover:text-fuchsia-900 dark:hover:text-fuchsia-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {filters.location}
                <button 
                  onClick={() => onFilterChange({ ...filters, location: '' })}
                  className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dateRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                {filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'this-week' ? 'This Week' : 'This Month'}
                <button 
                  onClick={() => onFilterChange({ ...filters, dateRange: '' })}
                  className="ml-2 hover:text-amber-900 dark:hover:text-amber-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default EventFilter;
