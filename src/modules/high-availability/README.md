# High Availability Module (Frontend)

## Purpose

Provides UI for system health monitoring, metrics dashboards, and alert management.

## Responsibilities

- Health status display
- Monitoring dashboards
- Alert configuration
- System metrics visualization

## Key Components

### Components
- Health monitoring components
- Metrics dashboards
- Alert management UI

### Hooks
- `useHealthStatus` - Health check data
- `useSystemMetrics` - System metrics

### Services
- `monitoringService` - Monitoring API

### Types
- `HealthStatus` - Health interface
- `SystemMetrics` - Metrics interface

## Public API
```typescript
export { useHealthStatus, useSystemMetrics } from './hooks';
export { monitoringService } from './services';
export type { HealthStatus, SystemMetrics } from './types';
```
