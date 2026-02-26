let getCLS: any, getFID: any, getFCP: any, getLCP: any, getTTFB: any;

try {
  const webVitals = require('web-vitals');
  getCLS = webVitals.getCLS;
  getFID = webVitals.getFID;
  getFCP = webVitals.getFCP;
  getLCP = webVitals.getLCP;
  getTTFB = webVitals.getTTFB;
} catch (e) {
  // web-vitals not available, use no-op functions
  getCLS = (callback: any) => {};
  getFID = (callback: any) => {};
  getFCP = (callback: any) => {};
  getLCP = (callback: any) => {};
  getTTFB = (callback: any) => {};
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  page: string;
  deviceType: string;
  networkType: string;
  userAgent: string;
  timestamp: string;
  sessionId: string;
}

export interface MetricsQueueItem {
  metric: PerformanceMetric;
  retryCount: number;
  lastRetryTime?: number;
}

const METRICS_QUEUE_KEY = 'performance_metrics_queue';
const SESSION_ID_KEY = 'performance_session_id';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const BATCH_SIZE = 10;
const BATCH_TIMEOUT_MS = 5000;

class PerformanceMetricsService {
  private metricsQueue: MetricsQueueItem[] = [];
  private sessionId: string;
  private batchTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.loadQueueFromStorage();
    this.setupEventListeners();
    this.startCollectingMetrics();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startCollectingMetrics(): void {
    // Collect Core Web Vitals
    getCLS((metric: any) => this.recordMetric('CLS', metric.value, 'score'));
    getFID((metric: any) => this.recordMetric('FID', metric.value, 'ms'));
    getFCP((metric: any) => this.recordMetric('FCP', metric.value, 'ms'));
    getLCP((metric: any) => this.recordMetric('LCP', metric.value, 'ms'));
    getTTFB((metric: any) => this.recordMetric('TTFB', metric.value, 'ms'));
  }

  private recordMetric(name: string, value: number, unit: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      page: this.getCurrentPage(),
      deviceType: this.getDeviceType(),
      networkType: this.getNetworkType(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.addToQueue(metric);
  }

  private addToQueue(metric: PerformanceMetric): void {
    const queueItem: MetricsQueueItem = {
      metric,
      retryCount: 0,
    };

    this.metricsQueue.push(queueItem);
    this.saveQueueToStorage();

    // Schedule batch processing
    this.scheduleBatchProcessing();
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, BATCH_TIMEOUT_MS);

    // Process immediately if batch is full
    if (this.metricsQueue.length >= BATCH_SIZE) {
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }
      this.processBatch();
    }
  }

  private processBatch(): void {
    if (this.metricsQueue.length === 0) {
      return;
    }

    const batch = this.metricsQueue.splice(0, BATCH_SIZE);
    this.saveQueueToStorage();

    if (this.isOnline) {
      this.sendBatch(batch);
    }
  }

  private sendBatch(batch: MetricsQueueItem[]): void {
    const metrics = batch.map((item) => item.metric);

    navigator.sendBeacon(
      '/api/metrics/batch',
      JSON.stringify({
        metrics,
        timestamp: new Date().toISOString(),
      })
    );

    // Fallback to fetch if sendBeacon is not available
    if (!navigator.sendBeacon) {
      fetch('/api/metrics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send metrics batch:', error);
        // Re-queue failed items
        this.metricsQueue.unshift(...batch);
        this.saveQueueToStorage();
      });
    }
  }

  private processQueue(): void {
    while (this.metricsQueue.length > 0 && this.isOnline) {
      const batch = this.metricsQueue.splice(0, BATCH_SIZE);
      this.saveQueueToStorage();
      this.sendBatch(batch);
    }
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(METRICS_QUEUE_KEY, JSON.stringify(this.metricsQueue));
    } catch (error) {
      console.error('Failed to save metrics queue to storage:', error);
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(METRICS_QUEUE_KEY);
      if (stored) {
        this.metricsQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load metrics queue from storage:', error);
      this.metricsQueue = [];
    }
  }

  private getCurrentPage(): string {
    const pathname = window.location.pathname;
    if (pathname.includes('/checkout')) return 'checkout';
    if (pathname.includes('/events')) return 'listings';
    return 'other';
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
      return /ipad/i.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  private getNetworkType(): string {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!connection) {
      return 'unknown';
    }

    const effectiveType = connection.effectiveType;
    return effectiveType || 'unknown';
  }

  public getQueueSize(): number {
    return this.metricsQueue.length;
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton instance
let instance: PerformanceMetricsService | null = null;

export function initializePerformanceMetrics(): PerformanceMetricsService {
  if (!instance) {
    instance = new PerformanceMetricsService();
  }
  return instance;
}

export function getPerformanceMetricsService(): PerformanceMetricsService {
  if (!instance) {
    instance = new PerformanceMetricsService();
  }
  return instance;
}
