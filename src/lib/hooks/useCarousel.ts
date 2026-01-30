/**
 * useCarousel Hook
 * 
 * A custom hook for managing carousel scroll state and navigation.
 * Provides smooth scrolling, boundary detection, and touch gesture support.
 * 
 * @example
 * ```tsx
 * const { containerRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useCarousel({
 *   itemWidth: 300,
 *   gap: 16
 * });
 * ```
 * 
 * Requirements: 12.3, 12.4, 12.5, 12.6, 12.7
 */
import { useRef, useState, useCallback, useEffect } from 'react';

export interface UseCarouselOptions {
  /** Width of each item in pixels (used for scroll amount calculation) */
  itemWidth?: number;
  /** Gap between items in pixels */
  gap?: number;
  /** Number of items to scroll at once */
  scrollItems?: number;
}

export interface UseCarouselReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the carousel can scroll left (not at start) */
  canScrollLeft: boolean;
  /** Whether the carousel can scroll right (not at end) */
  canScrollRight: boolean;
  /** Function to scroll the carousel left */
  scrollLeft: () => void;
  /** Function to scroll the carousel right */
  scrollRight: () => void;
}

/**
 * Custom hook for carousel scroll management
 * 
 * @param options - Configuration options for the carousel
 * @returns Object containing ref, scroll state, and scroll functions
 */
export function useCarousel(options: UseCarouselOptions = {}): UseCarouselReturn {
  const { itemWidth = 300, gap = 16, scrollItems = 1 } = options;
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /**
   * Updates the scroll state based on current scroll position
   * Determines if arrows should be visible
   */
  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Can scroll left if not at the start (with small threshold for floating point)
    setCanScrollLeft(scrollLeft > 1);
    
    // Can scroll right if not at the end (with small threshold for floating point)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  /**
   * Scrolls the carousel left by the configured amount
   * Uses smooth scrolling behavior
   * Validates: Requirements 12.3
   */
  const scrollLeftFn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = (itemWidth + gap) * scrollItems;
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }, [itemWidth, gap, scrollItems]);

  /**
   * Scrolls the carousel right by the configured amount
   * Uses smooth scrolling behavior
   * Validates: Requirements 12.4
   */
  const scrollRightFn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = (itemWidth + gap) * scrollItems;
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }, [itemWidth, gap, scrollItems]);

  /**
   * Set up scroll event listener and initial state
   * Also handles resize events to recalculate scroll boundaries
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial state update
    updateScrollState();

    // Listen for scroll events
    container.addEventListener('scroll', updateScrollState, { passive: true });

    // Listen for resize events to recalculate boundaries
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft: scrollLeftFn,
    scrollRight: scrollRightFn
  };
}

export default useCarousel;
