# Event Management Module (Frontend)

## Purpose

Provides UI components and services for event creation, editing, publishing, and management.

## Responsibilities

- Event creation and editing forms
- Event publishing workflow
- Event type selection
- Timezone selection and display
- Event status management
- Event branding customization

## Key Components

### Components
- `EventCreationForm` - Create new event
- `EventEditForm` - Edit existing event
- `PublishUnpublishButton` - Publishing controls
- `EventStatusSection` - Status display
- `EventTypeSelector` - Event type selection
- `TimezoneSelector` - Timezone picker
- `DateTimePicker` - Date/time selection

### Hooks
- `useEvent` - Event data and operations
- `useEventStatus` - Event status management
- `useTimezones` - Timezone operations

### Services
- `eventService` - Event API client
- `timezoneService` - Timezone operations

### Types
- `Event` - Event data interface
- `EventStatus` - Event status enum
- `EventType` - Event type enum

## Public API
```typescript
export { EventCreationForm, EventEditForm } from './components';
export { useEvent, useEventStatus } from './hooks';
export { eventService } from './services';
export type { Event, EventStatus, EventType } from './types';
```

## Notes

- Events must be validated before publishing
- Timezone conversions handled automatically
- Draft events can be saved and edited
- Published events have restricted editing
