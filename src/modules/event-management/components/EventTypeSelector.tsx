'use client';

import React from 'react';

export type EventType = 'ONLINE' | 'IN_PERSON' | 'HYBRID';

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
  disabled?: boolean;
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; description: string }[] = [
  {
    value: 'ONLINE',
    label: 'Online',
    description: 'Event conducted entirely through a digital platform',
  },
  {
    value: 'IN_PERSON',
    label: 'In-Person',
    description: 'Event held at a specific physical location',
  },
  {
    value: 'HYBRID',
    label: 'Hybrid',
    description: 'Event combining both online and in-person components',
  },
];

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <fieldset disabled={disabled}>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Event Type *
        </legend>
        <div className="space-y-2">
          {EVENT_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="eventType"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value as EventType)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                aria-label={option.label}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default EventTypeSelector;

