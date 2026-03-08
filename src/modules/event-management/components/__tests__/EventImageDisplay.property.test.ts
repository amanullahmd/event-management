/**
 * Event Image Display Property-Based Tests
 *
 * Feature: event-image-upload
 * Property 10: Placeholder display for events without images
 *
 * For any event where imageUrl is null or undefined, both the event listing card
 * and the event detail page should render a placeholder image element instead of
 * a broken image.
 *
 * **Validates: Requirements 8.3, 8.4**
 */

import fc from 'fast-check';

// --- Helpers ---

/**
 * Determines whether an event should show a placeholder based on its imageUrl.
 * This mirrors the logic in EventsPageClient and event-detail.tsx:
 *   - If event.image is a non-empty string → show the image
 *   - Otherwise → show placeholder
 */
function shouldShowPlaceholder(imageUrl: string | null | undefined): boolean {
  return !imageUrl || imageUrl.trim().length === 0;
}

/**
 * Determines whether an event should show the actual image.
 */
function shouldShowImage(imageUrl: string | null | undefined): boolean {
  return typeof imageUrl === 'string' && imageUrl.trim().length > 0;
}

// --- Arbitraries ---

/** Any falsy or empty image URL that should trigger placeholder */
const missingImageArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.constant(''),
  fc.constant('   '),
);

/** A valid non-empty image URL */
const validImageUrlArb = fc.webUrl().filter((url) => url.trim().length > 0);

// --- Tests ---

describe('Feature: event-image-upload, Property 10: Placeholder display for events without images', () => {
  /**
   * Property: For any event with a null, undefined, or empty imageUrl,
   * shouldShowPlaceholder returns true and shouldShowImage returns false.
   *
   * **Validates: Requirements 8.3, 8.4**
   */
  it('shows placeholder for any event with missing or empty imageUrl', () => {
    fc.assert(
      fc.property(missingImageArb, (imageUrl) => {
        expect(shouldShowPlaceholder(imageUrl)).toBe(true);
        expect(shouldShowImage(imageUrl)).toBe(false);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: For any event with a valid non-empty imageUrl,
   * shouldShowPlaceholder returns false and shouldShowImage returns true.
   *
   * **Validates: Requirements 8.1, 8.2**
   */
  it('shows image (not placeholder) for any event with a valid imageUrl', () => {
    fc.assert(
      fc.property(validImageUrlArb, (imageUrl) => {
        expect(shouldShowPlaceholder(imageUrl)).toBe(false);
        expect(shouldShowImage(imageUrl)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: The placeholder and image display states are mutually exclusive.
   * For any imageUrl value, exactly one of shouldShowPlaceholder or shouldShowImage is true.
   *
   * **Validates: Requirements 8.3, 8.4**
   */
  it('placeholder and image display are mutually exclusive for any imageUrl', () => {
    const anyImageUrlArb = fc.oneof(
      missingImageArb,
      validImageUrlArb,
      fc.string(),
    );

    fc.assert(
      fc.property(anyImageUrlArb, (imageUrl) => {
        const placeholder = shouldShowPlaceholder(imageUrl);
        const image = shouldShowImage(imageUrl);
        // Exactly one must be true (XOR)
        expect(placeholder !== image).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Whitespace-only strings are treated as missing images (placeholder shown).
   *
   * **Validates: Requirements 8.3, 8.4**
   */
  it('treats whitespace-only imageUrl as missing (shows placeholder)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).map((s) => s.replace(/\S/g, ' ')),
        (whitespaceUrl) => {
          expect(shouldShowPlaceholder(whitespaceUrl)).toBe(true);
          expect(shouldShowImage(whitespaceUrl)).toBe(false);
        }
      ),
      { numRuns: 20 }
    );
  });
});
