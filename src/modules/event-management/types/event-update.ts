/**
 * Event update type definitions for the Event Management & Ticketing System
 * Validates: Requirements 14.1, 14.2, 8.7
 */

/**
 * Request body for updating an existing event
 * All fields are optional to support partial updates
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventType?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  onlineLink?: string;
  capacity?: number;
  tags?: string[];
  notes?: string;
  updatedAt?: string | Date;
  categoryId?: string | null;
}

/**
 * Response object for successful event update
 * Includes all event fields with timestamps
 */
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  eventType: string;
  startDate: string | Date;
  endDate: string | Date;
  location: string;
  onlineLink?: string;
  capacity: number;
  tags: string[];
  notes?: string;
  status: 'draft' | 'published';
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Field-level validation error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validation error response for failed updates
 */
export interface ValidationErrorResponse {
  errorCode: string;
  message: string;
  timestamp?: string | Date;
  errors?: FieldError[];
}

/**
 * Conflict error response for concurrent updates
 */
export interface ConflictErrorResponse {
  errorCode: string;
  message: string;
  currentVersion?: {
    updatedAt: string | Date;
    title?: string;
  };
}

/**
 * Generic error response
 */
export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp?: string | Date;
}

/**
 * Union type for all possible error responses
 */
export type ApiErrorResponse = ValidationErrorResponse | ConflictErrorResponse | ErrorResponse;

/**
 * Type guard to check if response is a validation error
 */
export function isValidationError(error: ApiErrorResponse): error is ValidationErrorResponse {
  return error.errorCode === 'VALIDATION_ERROR' && 'errors' in error;
}

/**
 * Type guard to check if response is a conflict error
 */
export function isConflictError(error: ApiErrorResponse): error is ConflictErrorResponse {
  return error.errorCode === 'CONFLICT' && 'currentVersion' in error;
}

/**
 * Type guard to check if response is an authorization error
 */
export function isAuthorizationError(error: ApiErrorResponse): boolean {
  return error.errorCode === 'FORBIDDEN' || error.errorCode === 'UNAUTHORIZED';
}

/**
 * Type guard to check if response is a not found error
 */
export function isNotFoundError(error: ApiErrorResponse): boolean {
  return error.errorCode === 'NOT_FOUND';
}

