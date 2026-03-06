/**
 * Shared Common Module Public API
 * 
 * This module provides shared utilities, components, hooks, and types used across all modules.
 */

// Utils
export * from './utils/api';
export * from './utils/cn';
export * from './utils/error-formatter';

// Services
export * from './services/apiService';

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  ValidationError,
  FormError,
  LoadingState,
  AuthState,
  CartItem,
  CartState,
} from './types/api';

