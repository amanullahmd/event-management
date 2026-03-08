/**
 * ImageUploadArea Property-Based Tests
 *
 * Feature: event-image-upload
 * Property 9: Client-side file validation
 *
 * For any file selected in the frontend ImageUploadArea component, if the file's
 * type is not in ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] or its
 * size exceeds 5 MB, the component should display an error message and should not
 * trigger an API call.
 *
 * **Validates: Requirements 6.4, 6.5**
 */

import fc from 'fast-check';
import { validateFile } from '../ImageUploadArea';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '../../types/image-upload';

// --- Arbitraries ---

const VALID_TYPES: readonly string[] = ALLOWED_IMAGE_TYPES;

const INVALID_TYPES = [
  'application/pdf',
  'text/plain',
  'text/html',
  'application/json',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'video/mp4',
  'audio/mpeg',
  'application/octet-stream',
  'application/zip',
  'text/css',
  'text/javascript',
];

const validTypeArb = fc.constantFrom(...VALID_TYPES);

const invalidTypeArb = fc.oneof(
  fc.constantFrom(...INVALID_TYPES),
  fc.string({ minLength: 1, maxLength: 50 }).filter(
    (s) => !VALID_TYPES.includes(s)
  )
);

/** File size that is within the 5 MB limit (1 byte to 5 MB inclusive) */
const validSizeArb = fc.integer({ min: 1, max: MAX_IMAGE_SIZE_BYTES });

/** File size that exceeds the 5 MB limit */
const oversizedArb = fc.integer({ min: MAX_IMAGE_SIZE_BYTES + 1, max: MAX_IMAGE_SIZE_BYTES * 3 });

/** Any valid file size including 0 */
const anySizeArb = fc.integer({ min: 0, max: MAX_IMAGE_SIZE_BYTES * 3 });

/**
 * Helper to create a File object with a given type and size.
 * We create a Blob of the specified size and wrap it as a File.
 */
function createFile(type: string, size: number, name = 'test-file'): File {
  // Create a buffer of the desired size (content doesn't matter for validation)
  const buffer = new ArrayBuffer(size);
  const blob = new Blob([buffer], { type });
  return new File([blob], name, { type });
}

// --- Tests ---

describe('Feature: event-image-upload, Property 9: Client-side file validation', () => {
  /**
   * Property: For any file with a valid type and size ≤ 5 MB,
   * validateFile should return null (no error).
   *
   * **Validates: Requirements 6.4, 6.5**
   */
  it('returns null for any file with a valid type and size within limit', () => {
    fc.assert(
      fc.property(validTypeArb, validSizeArb, (type, size) => {
        const file = createFile(type, size);
        const result = validateFile(file);
        expect(result).toBeNull();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any file with an invalid type (regardless of size),
   * validateFile should return a non-null error message.
   *
   * **Validates: Requirements 6.5**
   */
  it('returns an error message for any file with an invalid type', () => {
    fc.assert(
      fc.property(invalidTypeArb, anySizeArb, (type, size) => {
        const file = createFile(type, size);
        const result = validateFile(file);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
        expect(result!.length).toBeGreaterThan(0);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any file with a valid type but size exceeding 5 MB,
   * validateFile should return a non-null error message about file size.
   *
   * **Validates: Requirements 6.4**
   */
  it('returns an error message for any file exceeding 5 MB', () => {
    fc.assert(
      fc.property(validTypeArb, oversizedArb, (type, size) => {
        const file = createFile(type, size);
        const result = validateFile(file);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
        expect(result!.toLowerCase()).toContain('size');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any file with an invalid type AND oversized,
   * validateFile should return a non-null error message (type check runs first).
   *
   * **Validates: Requirements 6.4, 6.5**
   */
  it('returns an error for files that are both invalid type and oversized', () => {
    fc.assert(
      fc.property(invalidTypeArb, oversizedArb, (type, size) => {
        const file = createFile(type, size);
        const result = validateFile(file);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: A file at exactly 5 MB with a valid type should pass validation.
   *
   * **Validates: Requirements 6.4**
   */
  it('accepts a file at exactly the 5 MB boundary for any valid type', () => {
    fc.assert(
      fc.property(validTypeArb, (type) => {
        const file = createFile(type, MAX_IMAGE_SIZE_BYTES);
        const result = validateFile(file);
        expect(result).toBeNull();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: A file at exactly 5 MB + 1 byte with a valid type should fail validation.
   *
   * **Validates: Requirements 6.4**
   */
  it('rejects a file at 5 MB + 1 byte for any valid type', () => {
    fc.assert(
      fc.property(validTypeArb, (type) => {
        const file = createFile(type, MAX_IMAGE_SIZE_BYTES + 1);
        const result = validateFile(file);
        expect(result).not.toBeNull();
      }),
      { numRuns: 20 }
    );
  });
});
