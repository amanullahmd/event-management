# Pricing Components Integration Guide

This document describes how to integrate the pricing components into the event management interface.

## Components Overview

### 1. PricingRuleForm
**File:** `PricingRuleForm.tsx`

Form component for creating and updating pricing rules with conditional field visibility based on pricing type.

**Props:**
- `eventId` (string): The event ID
- `ticketTypeId` (string): The ticket type ID
- `initialRule?` (PricingRule): Optional existing pricing rule for editing
- `onSuccess` (function): Callback when form is successfully submitted
- `onError` (function): Callback when an error occurs
- `onCancel?` (function): Optional callback for cancel button

**Usage:**
```tsx
import { PricingRuleForm } from '@/components/organizer/PricingRuleForm';

<PricingRuleForm
  eventId={eventId}
  ticketTypeId={ticketTypeId}
  onSuccess={(rule) => console.log('Rule created:', rule)}
  onError={(error) => console.error('Error:', error)}
/>
```

### 2. AvailabilityStatusDisplay
**File:** `AvailabilityStatusDisplay.tsx`

Component for displaying ticket availability status with visual indicators.

**Props:**
- `status` (AvailabilityStatus): One of 'AVAILABLE', 'LOW_STOCK', 'SOLD_OUT'
- `availability` (number): Number of tickets available
- `availabilityPercentage` (number): Percentage of tickets available
- `lowStockWarning` (boolean): Whether to show low stock warning
- `quantityLimit` (number): Total quantity limit

**Usage:**
```tsx
import { AvailabilityStatusDisplay } from '@/components/organizer/AvailabilityStatusDisplay';

<AvailabilityStatusDisplay
  status="LOW_STOCK"
  availability={5}
  availabilityPercentage={8.5}
  lowStockWarning={true}
  quantityLimit={100}
/>
```

### 3. TicketSelectionComponent
**File:** `TicketSelectionComponent.tsx`

Component for attendees to select ticket types with pricing and availability information.

**Props:**
- `ticketTypes` (TicketTypeWithPricing[]): Array of ticket types with pricing info
- `selectedTicketTypeId?` (string): Currently selected ticket type ID
- `onSelect` (function): Callback when a ticket type is selected
- `isLoading?` (boolean): Loading state
- `error?` (string): Error message

**Usage:**
```tsx
import { TicketSelectionComponent } from '@/components/organizer/TicketSelectionComponent';

<TicketSelectionComponent
  ticketTypes={ticketTypes}
  selectedTicketTypeId={selectedId}
  onSelect={(ticketType) => console.log('Selected:', ticketType)}
/>
```

### 4. PricingAuditLogViewer
**File:** `PricingAuditLogViewer.tsx`

Component for displaying pricing audit logs with formatted JSONB data.

**Props:**
- `eventId` (string): The event ID
- `ticketTypeId` (string): The ticket type ID
- `isLoading?` (boolean): Loading state
- `error?` (string): Error message

**Usage:**
```tsx
import { PricingAuditLogViewer } from '@/components/organizer/PricingAuditLogViewer';

<PricingAuditLogViewer
  eventId={eventId}
  ticketTypeId={ticketTypeId}
/>
```

### 5. PricingManagementSection
**File:** `PricingManagementSection.tsx`

Integrated component that combines pricing rule management and audit logs.

**Props:**
- `eventId` (string): The event ID
- `ticketTypeId` (string): The ticket type ID
- `ticketTypeName` (string): Display name of the ticket type
- `initialRule?` (PricingRule): Optional existing pricing rule

**Usage:**
```tsx
import { PricingManagementSection } from '@/components/organizer/PricingManagementSection';

<PricingManagementSection
  eventId={eventId}
  ticketTypeId={ticketTypeId}
  ticketTypeName="VIP Tickets"
  initialRule={pricingRule}
/>
```

## Integration Points

### Event Details Page
Add pricing management to the ticket types tab:

```tsx
// In the Tickets Tab section of event details page
{activeTab === 'tickets' && (
  <div className="space-y-6">
    {/* Existing ticket types table */}
    
    {/* Add pricing management for selected ticket type */}
    {selectedTicketType && (
      <PricingManagementSection
        eventId={event.id}
        ticketTypeId={selectedTicketType.id}
        ticketTypeName={selectedTicketType.name}
        initialRule={selectedTicketType.pricingRule}
      />
    )}
  </div>
)}
```

### Ticket Type Edit Page
Add pricing form to ticket type edit page:

```tsx
import { PricingRuleForm } from '@/components/organizer/PricingRuleForm';

// In ticket type edit page
<PricingRuleForm
  eventId={eventId}
  ticketTypeId={ticketTypeId}
  initialRule={ticketType.pricingRule}
  onSuccess={handlePricingSuccess}
  onError={handlePricingError}
/>
```

### Ticket Selection (Customer View)
Add ticket selection component to event booking page:

```tsx
import { TicketSelectionComponent } from '@/components/organizer/TicketSelectionComponent';

// In event booking page
<TicketSelectionComponent
  ticketTypes={event.ticketTypes}
  selectedTicketTypeId={selectedId}
  onSelect={handleTicketSelection}
/>
```

## Type Definitions

All pricing-related types are defined in `@/lib/types/pricing.ts`:

- `PricingRuleType`: 'FREE' | 'PAID' | 'DONATION'
- `AvailabilityStatus`: 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT'
- `AuditAction`: Audit action types
- `PricingRule`: Pricing rule data structure
- `AvailabilityInfo`: Availability information
- `PricingAuditLog`: Audit log entry
- `TicketTypeWithPricing`: Ticket type with pricing information

## API Endpoints

The components interact with the following API endpoints:

- `POST /api/events/{eventId}/ticket-types/{ticketTypeId}/pricing-rules` - Create pricing rule
- `GET /api/events/{eventId}/ticket-types/{ticketTypeId}/pricing-rules` - Get pricing rule
- `PATCH /api/events/{eventId}/ticket-types/{ticketTypeId}/pricing-rules` - Update pricing rule
- `GET /api/events/{eventId}/ticket-types/{ticketTypeId}/pricing-audit-logs` - Get audit logs

## Styling

All components use Tailwind CSS with dark mode support. They follow the existing design system:

- Colors: Slate, Blue, Green, Orange, Red
- Spacing: Consistent with existing components
- Typography: Consistent font sizes and weights
- Responsive: Mobile-first design with breakpoints

## Error Handling

Components handle errors gracefully:

- Form validation errors are displayed inline
- API errors are shown in error messages
- Loading states are displayed during async operations
- User-friendly error messages are provided

## Accessibility

Components include:

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast compliance
- Focus indicators

## Testing

Each component can be tested independently:

```tsx
import { render, screen } from '@testing-library/react';
import { PricingRuleForm } from '@/components/organizer/PricingRuleForm';

test('renders pricing rule form', () => {
  render(
    <PricingRuleForm
      eventId="test-event"
      ticketTypeId="test-ticket"
      onSuccess={jest.fn()}
      onError={jest.fn()}
    />
  );
  
  expect(screen.getByText('Create Pricing Rule')).toBeInTheDocument();
});
```
