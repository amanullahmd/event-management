/**
 * Asset Optimizer Service
 * Handles lazy loading, resource hints, and asset optimization
 */

export interface LazyLoadConfig {
  threshold?: number;
  rootMargin?: string;
}

export interface ResourceHint {
  rel: 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload';
  href: string;
  as?: string;
  crossorigin?: boolean;
}

export class AssetOptimizerService {
  private static observer: IntersectionObserver | null = null;
  private static resourceHints: Set<string> = new Set();

  /**
   * Initialize lazy loading for images
   */
  static initializeLazyLoading(config: LazyLoadConfig = {}): void {
    const { threshold = 0.1, rootMargin = '50px' } = config;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              this.observer?.unobserve(img);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach((img) => {
      this.observer?.observe(img);
    });
  }

  /**
   * Add resource hint to page
   */
  static addResourceHint(hint: ResourceHint): void {
    const hintKey = `${hint.rel}:${hint.href}`;

    if (this.resourceHints.has(hintKey)) {
      return; // Already added
    }

    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;

    if (hint.as) {
      link.setAttribute('as', hint.as);
    }

    if (hint.crossorigin) {
      link.setAttribute('crossorigin', 'anonymous');
    }

    document.head.appendChild(link);
    this.resourceHints.add(hintKey);
  }

  /**
   * Prefetch next page resources
   */
  static prefetchNextPageResources(nextPageUrl: string): void {
    this.addResourceHint({
      rel: 'prefetch',
      href: nextPageUrl,
    });
  }

  /**
   * Preconnect to critical third-party origins
   */
  static preconnectToOrigin(origin: string): void {
    this.addResourceHint({
      rel: 'preconnect',
      href: origin,
      crossorigin: true,
    });
  }

  /**
   * DNS prefetch for third-party domains
   */
  static dnsPrefetch(domain: string): void {
    this.addResourceHint({
      rel: 'dns-prefetch',
      href: `//${domain}`,
    });
  }

  /**
   * Preload critical resources
   */
  static preloadResource(href: string, as: string): void {
    this.addResourceHint({
      rel: 'preload',
      href,
      as,
    });
  }

  /**
   * Defer non-critical JavaScript
   */
  static deferNonCriticalScripts(): void {
    document.querySelectorAll('script[data-defer]').forEach((script) => {
      const newScript = document.createElement('script');
      newScript.src = script.getAttribute('src') || '';
      newScript.async = true;

      // Load after page is interactive
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(newScript);
        });
      } else {
        document.body.appendChild(newScript);
      }
    });
  }

  /**
   * Measure Time to Interactive improvement
   */
  static measureTTIImprovement(): Promise<number> {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
          observer.disconnect();
        });

        try {
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // longtask not supported
          resolve(0);
        }
      } else {
        resolve(0);
      }
    });
  }

  /**
   * Cleanup lazy loading observer
   */
  static cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
