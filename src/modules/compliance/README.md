# Compliance Module (Frontend)

## Purpose

Provides UI for GDPR compliance, consent management, and data export/deletion.

## Responsibilities

- Consent management UI
- Data export requests
- Account deletion workflow
- Compliance dashboards

## Key Components

### Components
- `ConsentManagement` - Manage consent preferences
- `ConsentAuditTrailViewer` - View consent history
- `DataMinimizationDashboard` - Data overview
- `AdminComplianceView` - Admin compliance tools

### Hooks
- `useConsent` - Consent operations
- `useDataExport` - Data export requests

### Services
- `complianceService` - Compliance API

### Types
- `ConsentPreferences` - Consent interface
- `DataExportRequest` - Export request interface

## Public API
```typescript
export { ConsentManagement, DataMinimizationDashboard } from './components';
export { useConsent, useDataExport } from './hooks';
export { complianceService } from './services';
export type { ConsentPreferences, DataExportRequest } from './types';
```
