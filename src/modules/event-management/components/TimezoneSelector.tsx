'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface TimezoneInfo {
  timezoneId: string;
  displayName: string;
  utcOffset: string;
  isDaylightSavingTime: boolean;
  dstStatus: string;
}

interface TimezoneSelectorProps {
  selectedTimezone?: string;
  onTimezoneChange: (timezone: string, info: TimezoneInfo) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * TimezoneSelector Component
 * Provides searchable timezone selection with timezone information display
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 */
export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  selectedTimezone = 'UTC',
  onTimezoneChange,
  onError,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timezones, setTimezones] = useState<TimezoneInfo[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<TimezoneInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch timezones from API
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/timezones');
        if (!response.ok) {
          throw new Error('Failed to fetch timezones');
        }
        const data = await response.json();
        setTimezones(data);

        // Find and set the selected timezone info
        const selected = data.find((tz: TimezoneInfo) => tz.timezoneId === selectedTimezone);
        if (selected) {
          setSelectedInfo(selected);
        }
      } catch (error) {
        onError?.('Failed to load timezones');
        console.error('Error fetching timezones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimezones();
  }, [selectedTimezone, onError]);

  // Filter timezones based on search term
  const filteredTimezones = useMemo(() => {
    if (!searchTerm.trim()) {
      return timezones;
    }

    const searchLower = searchTerm.toLowerCase();
    return timezones.filter(tz =>
      tz.timezoneId.toLowerCase().includes(searchLower) ||
      tz.displayName.toLowerCase().includes(searchLower) ||
      tz.utcOffset.includes(searchTerm)
    );
  }, [timezones, searchTerm]);

  // Group timezones by region
  const groupedTimezones = useMemo(() => {
    const groups: { [key: string]: TimezoneInfo[] } = {};

    filteredTimezones.forEach(tz => {
      const region = tz.timezoneId.split('/')[0];
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(tz);
    });

    return groups;
  }, [filteredTimezones]);

  const handleTimezoneSelect = (timezone: TimezoneInfo) => {
    setSelectedInfo(timezone);
    onTimezoneChange(timezone.timezoneId, timezone);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading timezones...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timezone Selector Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Timezone
        </label>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Timezone selector"
            aria-expanded={isOpen}
          >
            <div className="flex justify-between items-center">
              <span>
                {selectedInfo ? `${selectedInfo.displayName} (${selectedInfo.utcOffset})` : 'Select timezone'}
              </span>
              <span className="text-gray-400">▼</span>
            </div>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search by region, city, or UTC offset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search timezones"
                />
              </div>

              {/* Timezone List */}
              <div className="max-h-64 overflow-y-auto">
                {Object.entries(groupedTimezones).length === 0 ? (
                  <div className="p-3 text-center text-gray-500">
                    No timezones found
                  </div>
                ) : (
                  Object.entries(groupedTimezones).map(([region, regionTimezones]) => (
                    <div key={region}>
                      <div className="px-3 py-2 bg-gray-100 font-semibold text-sm text-gray-700 sticky top-0">
                        {region}
                      </div>
                      {regionTimezones.map(tz => (
                        <button
                          key={tz.timezoneId}
                          onClick={() => handleTimezoneSelect(tz)}
                          className={`w-full text-left px-4 py-2 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${
                            selectedInfo?.timezoneId === tz.timezoneId ? 'bg-blue-100' : ''
                          }`}
                          aria-label={`Select ${tz.displayName}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{tz.displayName}</span>
                            <span className="text-xs text-gray-500">{tz.utcOffset}</span>
                          </div>
                          {tz.isDaylightSavingTime && (
                            <div className="text-xs text-green-600">DST Active</div>
                          )}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timezone Info Display */}
      {selectedInfo && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Timezone</p>
              <p className="text-sm font-semibold text-gray-900">{selectedInfo.displayName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">UTC Offset</p>
              <p className="text-sm font-semibold text-gray-900">{selectedInfo.utcOffset}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-600">DST Status</p>
            <p className={`text-sm font-semibold ${selectedInfo.isDaylightSavingTime ? 'text-green-600' : 'text-gray-600'}`}>
              {selectedInfo.dstStatus === 'active' ? '✓ DST Active' : '✗ DST Inactive'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelector;

