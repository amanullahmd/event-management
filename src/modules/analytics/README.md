# Analytics Module (Frontend)

## Purpose

Provides analytics dashboards, real-time metrics, and data visualization components.

## Responsibilities

- Referral analytics dashboard
- Event recommendations display
- Check-in analytics and live metrics
- Real-time WebSocket updates

## Key Components

### Components
- `LiveAttendanceDashboard` - Real-time check-in metrics
- `RealTimeInsightsPanel` - Live analytics
- `ReferralAnalyticsDashboard` - Referral metrics
- `PersonalizedFeedComponent` - Recommendations

### Hooks
- `useAnalytics` - Analytics data
- `useWebSocketAnalytics` - Real-time updates
- `useRecommendations` - Personalized recommendations

### Services
- `analyticsService` - Analytics API
- `WebSocketAnalyticsService` - WebSocket client

### Types
- `AnalyticsData` - Analytics interface
- `Recommendation` - Recommendation interface

## Public API
```typescript
export { LiveAttendanceDashboard, RealTimeInsightsPanel } from './components';
export { useAnalytics, useWebSocketAnalytics } from './hooks';
export { analyticsService } from './services';
export type { AnalyticsData, Recommendation } from './types';
```
