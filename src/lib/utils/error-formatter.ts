/**
 * Error message formatting utilities for API responses
 */

export interface ApiErrorResponse {
  errorCode?: string;
  message?: string;
  missingFields?: string[];
  fieldErrors?: Record<string, string>;
  [key: string]: any;
}

/**
 * Parse API error response and extract user-friendly message
 * Hides technical details and displays specific field names for validation errors
 */
export const formatErrorMessage = (error: any): string => {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;

    // Handle validation errors with missing fields
    if (apiError.errorCode === 'VALIDATION_ERROR' && apiError.missingFields) {
      const fields = apiError.missingFields.join(', ');
      return `Event cannot be published due to missing required fields: ${fields}`;
    }

    // Handle field-specific validation errors
    if (apiError.fieldErrors && Object.keys(apiError.fieldErrors).length > 0) {
      const fieldMessages = Object.entries(apiError.fieldErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join('; ');
      return fieldMessages;
    }

    // Handle conflict errors (concurrent updates)
    if (apiError.errorCode === 'CONFLICT') {
      if (apiError.message?.includes('modified by another user')) {
        return 'Event was modified by another user. Please refresh and try again.';
      }
      return apiError.message || 'This action cannot be completed at this time.';
    }

    // Handle authorization errors
    if (apiError.errorCode === 'FORBIDDEN') {
      return 'You do not have permission to perform this action.';
    }

    // Handle not found errors
    if (apiError.errorCode === 'NOT_FOUND') {
      return 'Event not found.';
    }

    // Handle unauthorized errors
    if (apiError.errorCode === 'UNAUTHORIZED') {
      return 'Authentication required. Please log in again.';
    }

    // Use provided message if available
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Fallback error message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a conflict error (concurrent update)
 */
export const isConflictError = (error: any): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    return apiError.errorCode === 'CONFLICT';
  }
  return false;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    return apiError.errorCode === 'VALIDATION_ERROR';
  }
  return false;
};

/**
 * Extract field errors from API response
 */
export const extractFieldErrors = (error: any): Record<string, string> => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    if (apiError.fieldErrors) {
      return apiError.fieldErrors;
    }
  }
  return {};
};
