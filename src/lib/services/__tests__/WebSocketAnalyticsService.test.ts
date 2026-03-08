import {
  WebSocketAnalyticsService,
  getWebSocketAnalyticsService,
  resetWebSocketAnalyticsService
} from '../WebSocketAnalyticsService';

// Mock WebSocket
class MockWebSocket {
  readyState = WebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;

  send = jest.fn();
  close = jest.fn();

  constructor(url: string) {
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen();
      }
    }, 10);
  }
}

// Replace global WebSocket
(global as any).WebSocket = MockWebSocket;

describe('WebSocketAnalyticsService', () => {
  let service: WebSocketAnalyticsService;

  beforeEach(() => {
    resetWebSocketAnalyticsService();
    service = new WebSocketAnalyticsService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    service.disconnect();
  });

  describe('Connection Management', () => {
    it('should establish WebSocket connection', async () => {
      const onUpdate = jest.fn();
      const onError = jest.fn();
      const onConnectionChange = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate,
        onError,
        onConnectionChange
      });

      jest.runAllTimers();

      expect(onConnectionChange).toHaveBeenCalledWith(true);
    });

    it('should handle connection errors', async () => {
      const onError = jest.fn();
      const onConnectionChange = jest.fn();

      // Mock WebSocket error
      (global as any).WebSocket = class {
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Connection failed'));
            }
          }, 10);
        }
        onopen: (() => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onclose: (() => void) | null = null;
        onmessage: ((event: any) => void) | null = null;
        send = jest.fn();
        close = jest.fn();
      };

      try {
        await service.connect({
          url: '/ws/analytics',
          eventId: 'test-event-1',
          onUpdate: jest.fn(),
          onError,
          onConnectionChange
        });
      } catch (err) {
        // Expected
      }

      jest.runAllTimers();
    });

    it('should disconnect gracefully', async () => {
      const onConnectionChange = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange
      });

      jest.runAllTimers();

      service.disconnect();

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('Message Handling', () => {
    it('should handle incoming messages', async () => {
      const onUpdate = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate,
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      // Simulate incoming message
      const mockWs = (service as any).ws;
      if (mockWs && mockWs.onmessage) {
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'METRICS_UPDATE',
            eventId: 'test-event-1',
            data: { checkedInCount: 100 },
            timestamp: new Date().toISOString()
          })
        });
      }

      expect(onUpdate).toHaveBeenCalled();
    });

    it('should queue messages when queue is not full', async () => {
      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      const mockWs = (service as any).ws;
      if (mockWs && mockWs.onmessage) {
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'METRICS_UPDATE',
            eventId: 'test-event-1',
            data: { checkedInCount: 100 },
            timestamp: new Date().toISOString()
          })
        });
      }

      const queue = service.getMessageQueue();
      expect(queue.length).toBeGreaterThan(0);
    });

    it('should handle malformed messages', async () => {
      const onUpdate = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate,
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      const mockWs = (service as any).ws;
      if (mockWs && mockWs.onmessage) {
        mockWs.onmessage({
          data: 'invalid json'
        });
      }

      // Should not throw, just log error
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on disconnect', async () => {
      const onConnectionChange = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange
      });

      jest.runAllTimers();

      // Simulate disconnect
      const mockWs = (service as any).ws;
      if (mockWs && mockWs.onclose) {
        mockWs.onclose();
      }

      jest.runAllTimers();

      // Should attempt reconnection
      expect(onConnectionChange).toHaveBeenCalledWith(false);
    });

    it('should use exponential backoff for reconnection', async () => {
      const onConnectionChange = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange
      });

      jest.runAllTimers();

      // Simulate disconnect
      const mockWs = (service as any).ws;
      if (mockWs && mockWs.onclose) {
        mockWs.onclose();
      }

      // Check reconnect delay increases
      const initialDelay = (service as any).reconnectDelay;
      expect(initialDelay).toBe(1000);
    });

    it('should stop reconnecting after max attempts', async () => {
      const onError = jest.fn();

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError,
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      // Simulate multiple disconnects
      for (let i = 0; i < 11; i++) {
        const mockWs = (service as any).ws;
        if (mockWs && mockWs.onclose) {
          mockWs.onclose();
        }
        jest.runAllTimers();
      }

      // Should have called onError after max attempts
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Heartbeat Mechanism', () => {
    it('should send heartbeat messages', async () => {
      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      const mockWs = (service as any).ws;
      jest.advanceTimersByTime(30000); // 30 seconds

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'PING' }));
    });

    it('should stop heartbeat on disconnect', async () => {
      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      service.disconnect();

      const mockWs = (service as any).ws;
      jest.advanceTimersByTime(30000);

      // Should not send heartbeat after disconnect
      expect(mockWs.send).not.toHaveBeenCalledWith(JSON.stringify({ type: 'PING' }));
    });
  });

  describe('Connection Status', () => {
    it('should report connection status correctly', async () => {
      expect(service.getConnectionStatus()).toBe('disconnected');

      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      expect(service.getConnectionStatus()).toBe('connected');
      expect(service.isConnected()).toBe(true);

      service.disconnect();

      expect(service.getConnectionStatus()).toBe('disconnected');
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('Message Queue', () => {
    it('should manage message queue', async () => {
      await service.connect({
        url: '/ws/analytics',
        eventId: 'test-event-1',
        onUpdate: jest.fn(),
        onError: jest.fn(),
        onConnectionChange: jest.fn()
      });

      jest.runAllTimers();

      expect(service.getMessageQueue().length).toBe(0);

      service.clearMessageQueue();

      expect(service.getMessageQueue().length).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = getWebSocketAnalyticsService();
      const instance2 = getWebSocketAnalyticsService();

      expect(instance1).toBe(instance2);
    });

    it('should reset singleton', () => {
      const instance1 = getWebSocketAnalyticsService();
      resetWebSocketAnalyticsService();
      const instance2 = getWebSocketAnalyticsService();

      expect(instance1).not.toBe(instance2);
    });
  });
});

