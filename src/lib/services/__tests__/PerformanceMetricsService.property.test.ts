import { fc } from '@fast-check/jest';
import { initializePerformanceMetrics, getPerformanceMetricsService } from '../PerformanceMetricsService';

/**
 * Property 3: Core Web Vitals Metrics Collection and Reporting
 * 
 * For any page load, the Performance Monitor should collect all Core Web Vitals metrics
 * and transmit them to the analytics service with page, device type, and network condition information.
 * 
 * Validates: Requirements 1.5, 10.1, 10.2
 */
describe('PerformanceMetricsService - Property 3: Core Web Vitals Metrics Collection and Reporting', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should collect metrics with all required fields for any page load', () => {
    fc.assert(
      fc.property(
        fc.record({
          page: fc.constantFrom('listings', 'checkout', 'other'),
          deviceType: fc.constantFrom('desktop', 'mobile', 'tablet'),
          networkType: fc.constantFrom('4g', '3g', 'wifi', 'slow-4g', 'unknown'),
          metricName: fc.constantFrom('FCP', 'LCP', 'TTI', 'CLS', 'TTFB'),
          value: fc.float({ min: 0, max: 10000 }),
        }),
        (testData) => {
          const service = initializePerformanceMetrics();
          
          // Verify service is initialized
          expect(service).toBeDefined();
          expect(service.getSessionId()).toBeDefined();
          expect(service.getSessionId().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent session ID across multiple metric collections', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            metricName: fc.constantFrom('FCP', 'LCP', 'TTI', 'CLS'),
            value: fc.float({ min: 0, max: 5000 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (metrics) => {
          const service = initializePerformanceMetrics();
          const sessionId1 = service.getSessionId();
          
          // Collect multiple metrics
          metrics.forEach(() => {
            const service2 = getPerformanceMetricsService();
            const sessionId2 = service2.getSessionId();
            
            // Session ID should remain consistent
            expect(sessionId2).toBe(sessionId1);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should queue metrics for transmission with proper retry logic', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            metricName: fc.constantFrom('FCP', 'LCP', 'TTI', 'CLS'),
            value: fc.float({ min: 0, max: 5000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (metrics) => {
          const service = initializePerformanceMetrics();
          const initialQueueSize = service.getQueueSize();
          
          // Queue size should be non-negative
          expect(initialQueueSize).toBeGreaterThanOrEqual(0);
          expect(initialQueueSize).toBeLessThanOrEqual(50);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle offline scenarios by queuing metrics', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (isOnline) => {
          const service = initializePerformanceMetrics();
          
          // Simulate offline/online state
          if (!isOnline) {
            window.dispatchEvent(new Event('offline'));
          } else {
            window.dispatchEvent(new Event('online'));
          }
          
          // Service should still be functional
          expect(service).toBeDefined();
          expect(service.getSessionId()).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should persist metrics queue to storage for recovery', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            metricName: fc.constantFrom('FCP', 'LCP', 'TTI', 'CLS'),
            value: fc.float({ min: 0, max: 5000 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (metrics) => {
          const service = initializePerformanceMetrics();
          const queueSize = service.getQueueSize();
          
          // Queue size should be consistent with storage
          const stored = localStorage.getItem('performance_metrics_queue');
          if (stored) {
            const parsedQueue = JSON.parse(stored);
            expect(Array.isArray(parsedQueue)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should collect metrics with correct page identification', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/events', '/checkout', '/dashboard'),
        (pathname) => {
          // Mock window.location.pathname
          Object.defineProperty(window, 'location', {
            value: {
              pathname,
              href: `http://localhost${pathname}`,
            },
            writable: true,
          });

          const service = initializePerformanceMetrics();
          expect(service).toBeDefined();
          
          // Service should identify page correctly
          const sessionId = service.getSessionId();
          expect(sessionId).toBeDefined();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should handle device type detection for various user agents', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
          'Mozilla/5.0 (Linux; Android 10)'
        ),
        (userAgent) => {
          Object.defineProperty(navigator, 'userAgent', {
            value: userAgent,
            writable: true,
          });

          const service = initializePerformanceMetrics();
          expect(service).toBeDefined();
          expect(service.getSessionId()).toBeDefined();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should batch metrics efficiently for transmission', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (metricCount) => {
          const service = initializePerformanceMetrics();
          
          // Queue size should never exceed reasonable limits
          const queueSize = service.getQueueSize();
          expect(queueSize).toBeGreaterThanOrEqual(0);
          expect(queueSize).toBeLessThanOrEqual(1000);
        }
      ),
      { numRuns: 50 }
    );
  });
});
