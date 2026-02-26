/**
 * WebSocket Analytics Service
 * 
 * Manages WebSocket connections for real-time analytics updates.
 * Implements automatic reconnection with exponential backoff.
 * 
 * Validates: Requirements 2.4, 2.5, 2.6, 2.7, 10.1
 */

export interface AnalyticsUpdate {
  type: 'METRICS_UPDATE' | 'ALERT' | 'INSIGHTS_UPDATE';
  eventId: string;
  data: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  eventId: string;
  onUpdate: (update: AnalyticsUpdate) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
}

export class WebSocketAnalyticsService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: AnalyticsUpdate[] = [];
  private maxQueueSize = 100;

  /**
   * Establish WebSocket connection
   */
  public connect(config: WebSocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.config = config;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}${config.url}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.subscribe(config.eventId);
          this.startHeartbeat();
          config.onConnectionChange(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const update: AnalyticsUpdate = JSON.parse(event.data);
            this.messageQueue.push(update);
            if (this.messageQueue.length > this.maxQueueSize) {
              this.messageQueue.shift();
            }
            config.onUpdate(update);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          config.onError(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.stopHeartbeat();
          config.onConnectionChange(false);
          this.attemptReconnect();
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create WebSocket');
        config.onError(error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to event analytics
   */
  private subscribe(eventId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready for subscription');
      return;
    }

    const message = {
      action: 'SUBSCRIBE',
      eventId: eventId,
      sessionId: this.generateSessionId()
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Unsubscribe from event analytics
   */
  public unsubscribe(eventId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      action: 'UNSUBSCRIBE',
      eventId: eventId,
      sessionId: this.generateSessionId()
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Start heartbeat mechanism (ping/pong every 30 seconds)
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'PING' }));
        } catch (err) {
          console.error('Failed to send heartbeat:', err);
        }
      }
    }, 30000);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      if (this.config) {
        this.config.onError(new Error('Failed to reconnect after maximum attempts'));
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.config) {
        this.connect(this.config).catch((err) => {
          console.error('Reconnection failed:', err);
        });
      }
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.messageQueue = [];
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) {
      return 'disconnected';
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }

  /**
   * Get message queue (for debugging/recovery)
   */
  public getMessageQueue(): AnalyticsUpdate[] {
    return [...this.messageQueue];
  }

  /**
   * Clear message queue
   */
  public clearMessageQueue(): void {
    this.messageQueue = [];
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let instance: WebSocketAnalyticsService | null = null;

export function getWebSocketAnalyticsService(): WebSocketAnalyticsService {
  if (!instance) {
    instance = new WebSocketAnalyticsService();
  }
  return instance;
}

export function resetWebSocketAnalyticsService(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
