'use client';

import React, { useState, useEffect } from 'react';
import { format, parse, isValid, addMinutes, differenceInMinutes } from 'date-fns';

interface DateTimePickerProps {
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  onDateTimeChange: (startDate: Date, endDate: Date, timezone: string) => void;
  onError?: (error: string) => void;
  minDate?: Date;
  maxDate?: Date;
  timeInterval?: number; // in minutes, default 15
  disabled?: boolean;
}

interface DateTimePickerState {
  selectedDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  selectedTimezone: string;
  duration: string;
  errors: string[];
}

/**
 * DateTimePicker Component
 * Provides date and time selection with timezone support
 * Validates: Requirements 2.1, 2.2, 2.3, 2.8
 */
export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  startDate,
  endDate,
  timezone = 'UTC',
  onDateTimeChange,
  onError,
  minDate,
  maxDate,
  timeInterval = 15,
  disabled = false,
}) => {
  const [state, setState] = useState<DateTimePickerState>({
    selectedDate: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: startDate ? format(startDate, 'HH:mm') : '09:00',
    endTime: endDate ? format(endDate, 'HH:mm') : '10:00',
    selectedTimezone: timezone,
    duration: '',
    errors: [],
  });

  // Calculate duration whenever times change
  useEffect(() => {
    const duration = calculateDuration(state.startTime, state.endTime);
    setState(prev => ({ ...prev, duration }));
  }, [state.startTime, state.endTime]);

  // Validate and notify parent of changes
  useEffect(() => {
    const errors = validateDateTime();
    setState(prev => ({ ...prev, errors }));

    if (errors.length === 0) {
      try {
        const startDateTime = parse(
          `${state.selectedDate} ${state.startTime}`,
          'yyyy-MM-dd HH:mm',
          new Date()
        );
        const endDateTime = parse(
          `${state.selectedDate} ${state.endTime}`,
          'yyyy-MM-dd HH:mm',
          new Date()
        );

        if (isValid(startDateTime) && isValid(endDateTime)) {
          onDateTimeChange(startDateTime, endDateTime, state.selectedTimezone);
        }
      } catch (error) {
        onError?.('Invalid date/time format');
      }
    } else if (onError && errors.length > 0) {
      onError(errors[0]);
    }
  }, [state.selectedDate, state.startTime, state.endTime, state.selectedTimezone]);

  const calculateDuration = (start: string, end: string): string => {
    try {
      const startDate = parse(start, 'HH:mm', new Date());
      const endDate = parse(end, 'HH:mm', new Date());

      if (!isValid(startDate) || !isValid(endDate)) {
        return '';
      }

      const minutes = differenceInMinutes(endDate, startDate);
      if (minutes < 0) {
        return '';
      }

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (hours === 0) {
        return `${mins} minutes`;
      } else if (mins === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${mins}m`;
      }
    } catch {
      return '';
    }
  };

  const validateDateTime = (): string[] => {
    const errors: string[] = [];

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(state.selectedDate)) {
      errors.push('Invalid date format');
      return errors;
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(state.startTime)) {
      errors.push('Invalid start time format');
    }
    if (!timeRegex.test(state.endTime)) {
      errors.push('Invalid end time format');
    }

    if (errors.length > 0) {
      return errors;
    }

    // Validate start time is before end time
    const startMinutes = parseInt(state.startTime.split(':')[0]) * 60 + parseInt(state.startTime.split(':')[1]);
    const endMinutes = parseInt(state.endTime.split(':')[0]) * 60 + parseInt(state.endTime.split(':')[1]);

    if (startMinutes >= endMinutes) {
      errors.push('End time must be after start time');
    }

    // Validate time increments (15-minute intervals)
    if (startMinutes % timeInterval !== 0) {
      errors.push(`Start time must be in ${timeInterval}-minute increments`);
    }
    if (endMinutes % timeInterval !== 0) {
      errors.push(`End time must be in ${timeInterval}-minute increments`);
    }

    return errors;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, selectedDate: e.target.value }));
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, startTime: e.target.value }));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, endTime: e.target.value }));
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, selectedTimezone: e.target.value }));
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeInterval) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(
          <option key={timeStr} value={timeStr}>
            {timeStr}
          </option>
        );
      }
    }
    return options;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Date
          </label>
          <input
            type="date"
            value={state.selectedDate}
            onChange={handleDateChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Event date"
          />
        </div>

        {/* Timezone Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={state.selectedTimezone}
            onChange={handleTimezoneChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Timezone"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/Denver">America/Denver</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="Asia/Shanghai">Asia/Shanghai</option>
            <option value="Australia/Sydney">Australia/Sydney</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Time Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time
          </label>
          <select
            value={state.startTime}
            onChange={handleStartTimeChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Start time"
          >
            {generateTimeOptions()}
          </select>
        </div>

        {/* End Time Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time
          </label>
          <select
            value={state.endTime}
            onChange={handleEndTimeChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="End time"
          >
            {generateTimeOptions()}
          </select>
        </div>
      </div>

      {/* Duration Display */}
      {state.duration && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Duration:</strong> {state.duration}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {state.errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <ul className="text-sm text-red-800 space-y-1">
            {state.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-700">
          <strong>Summary:</strong> {state.selectedDate} {state.startTime} - {state.endTime} ({state.selectedTimezone})
        </p>
      </div>
    </div>
  );
};

export default DateTimePicker;
