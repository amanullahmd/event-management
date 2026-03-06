# Ticket Management Module (Frontend)

## Purpose

Provides UI for ticket type management, pricing configuration, and ticket operations.

## Responsibilities

- Ticket type creation and editing
- Pricing rule configuration
- Ticket selection and display
- Ticket audit log viewing

## Key Components

### Components
- `TicketTypeList` - Display ticket types
- `TicketTypeDetails` - Ticket type details
- `TicketSelectionComponent` - Ticket selection UI
- `PricingRuleForm` - Pricing configuration
- `PricingManagementSection` - Pricing overview
- `PricingAuditLogViewer` - Audit history

### Hooks
- `useTicketTypes` - Ticket type operations
- `usePricingRules` - Pricing operations

### Services
- `ticketTypeService` - Ticket type API
- `pricingService` - Pricing API

### Types
- `TicketType` - Ticket type interface
- `PricingRule` - Pricing rule interface

## Public API
```typescript
export { TicketTypeList, PricingRuleForm } from './components';
export { useTicketTypes, usePricingRules } from './hooks';
export { ticketTypeService } from './services';
export type { TicketType, PricingRule } from './types';
```

## Notes

- Pricing rules support time-based and quantity discounts
- Ticket types can have capacity limits
- Audit logs track all pricing changes
