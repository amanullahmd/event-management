/**
 * API utility for making authenticated requests with JWT token
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) {
    // If already refreshing, wait for the refresh to complete
    return refreshPromise || Promise.resolve(false);
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('auth_refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, clear tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_token_expires_at');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('auth_user_role');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return false;
      }

      const data = await response.json();
      
      // Update stored token
      localStorage.setItem('auth_token', data.accessToken);
      
      // Update token expiration time
      const expiresAt = new Date(new Date().getTime() + data.expiresIn * 1000);
      localStorage.setItem('auth_token_expires_at', expiresAt.toISOString());
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_token_expires_at');
      localStorage.removeItem('auth_user_id');
      localStorage.removeItem('auth_user_role');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Make an authenticated API request with JWT token
 */
export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/api${endpoint}`;
  
  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token and retry
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Retry the original request with new token
        const newToken = localStorage.getItem('auth_token');
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        
        if (newToken) {
          retryHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        
        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      } else {
        // Refresh failed, redirect to login
        throw new Error('Unauthorized - please log in again');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * GET request
 */
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH request
 */
export function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export function apiDelete<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}


/**
 * Event API client methods
 * Validates: Requirements 8.1, 8.2, 8.7
 */

import type { UpdateEventRequest, EventResponse, ApiErrorResponse } from '../types/event-update';

/**
 * Update an existing event with partial or complete data
 * 
 * Handles:
 * - Authentication headers (Bearer token)
 * - Error responses (400, 401, 403, 404, 409, 500)
 * - 409 Conflict responses for concurrent updates
 * 
 * @param eventId - UUID of the event to update
 * @param updateData - Partial or complete event update data
 * @returns Updated event object
 * @throws Error with specific error code for different failure scenarios
 * 
 * Validates: Requirements 8.1, 8.2, 8.7
 */
export async function updateEvent(
  eventId: string,
  updateData: UpdateEventRequest
): Promise<EventResponse> {
  try {
    const response = await apiPatch<EventResponse>(
      `/events/${eventId}`,
      updateData
    );
    return response;
  } catch (error) {
    // Parse error response to provide better error handling
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      // Handle specific error codes
      if (errorMessage.includes('409')) {
        const err = new Error('Concurrent update conflict detected');
        (err as any).errorCode = 'CONFLICT';
        throw err;
      }
      
      if (errorMessage.includes('403')) {
        const err = new Error('You do not have permission to update this event');
        (err as any).errorCode = 'FORBIDDEN';
        throw err;
      }
      
      if (errorMessage.includes('401')) {
        const err = new Error('Authentication required');
        (err as any).errorCode = 'UNAUTHORIZED';
        throw err;
      }
      
      if (errorMessage.includes('404')) {
        const err = new Error('Event not found');
        (err as any).errorCode = 'NOT_FOUND';
        throw err;
      }
      
      if (errorMessage.includes('400')) {
        const err = new Error('Validation failed');
        (err as any).errorCode = 'VALIDATION_ERROR';
        throw err;
      }
    }
    
    throw error;
  }
}
