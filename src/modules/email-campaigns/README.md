# Email Campaigns Module (Frontend)

## Purpose

Provides UI for email campaign management, template editing, and campaign analytics.

## Responsibilities

- Campaign creation and management
- Template editing
- Audience segmentation
- Campaign analytics dashboard

## Key Components

### Components
- `CampaignManagementDashboard` - Campaign overview
- Template and analytics components

### Hooks
- `useCampaigns` - Campaign operations
- `useCampaignAnalytics` - Analytics data

### Services
- `campaignService` - Campaign API client

### Types
- `Campaign` - Campaign interface
- `CampaignTemplate` - Template interface

## Public API
```typescript
export { CampaignManagementDashboard } from './components';
export { useCampaigns } from './hooks';
export { campaignService } from './services';
export type { Campaign, CampaignTemplate } from './types';
```
