/**
 * Image upload type definitions for the Event Management & Ticketing System
 * Validates: Requirements 6.3, 6.4, 6.5
 */

/**
 * Response from the image upload API endpoint
 */
export interface ImageUploadResponse {
  id: string;
  url: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  originalFilename: string;
  createdAt: string;
}

/**
 * Validation error for image upload operations
 */
export interface ImageValidationError {
  field: string;
  message: string;
}

/**
 * Allowed MIME types for event image uploads
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

/**
 * Maximum image file size in bytes (5 MB)
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Human-readable label for the maximum image file size
 */
export const MAX_IMAGE_SIZE_LABEL = '5 MB';
