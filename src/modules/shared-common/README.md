# Shared Common Module (Frontend)

## Purpose

Provides shared utilities, common components, hooks, and types used across all frontend modules.

## Responsibilities

- Common UI components
- Shared utility functions
- Common React hooks
- Shared TypeScript types
- API client utilities

## Key Components

### Components
- Common form components
- Loading indicators
- Error boundaries
- Modal dialogs

### Hooks
- `useDebounce` - Debounce values
- `useLocalStorage` - Local storage hook
- `useMediaQuery` - Responsive design
- `usePagination` - Pagination logic

### Utils
- `formatDate` - Date formatting
- `formatCurrency` - Currency formatting
- `validateEmail` - Email validation
- `apiClient` - HTTP client wrapper

### Types
- `ApiResponse` - Standard API response
- `PaginatedResponse` - Paginated data
- `ErrorResponse` - Error format

## Module Boundaries

### Dependencies
- None (foundation module)

### Allowed to be Used By
- All modules

## Public API
```typescript
export { LoadingSpinner, ErrorBoundary } from './components';
export { useDebounce, useLocalStorage } from './hooks';
export { formatDate, formatCurrency, apiClient } from './utils';
export type { ApiResponse, PaginatedResponse } from './types';
```

## Notes

- Keep this module lightweight
- Only include truly shared functionality
- Avoid module-specific logic
- Changes affect all modules
