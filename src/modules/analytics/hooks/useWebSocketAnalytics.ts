import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getWebSocketAnalyticsService,
  AnalyticsUpdate,
  WebSocketConfig
} from '../services/WebSocketAnalyticsService';

interface UseWebSocketAnalyticsOptions {
  eventId: string;
  url?: string;
  onUpdate?: (update: AnalyticsUpdate) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

/**
 * Custom hook for WebSocket analytics connection
 * 
 * Validates: Requirements 2.4, 2.5, 2.6, 2.7, 10.1
 */
export function useWebSocketAnalytics(options: UseWebSocketAnalyticsOptions) {
  const {
    eventId,
    url = '/ws/analytics',
    onUpdate,
    onError,
    autoConnect = true
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>(
    'disconnected'
  );
  const [error, setError] = useState<Error | null>(null);
  const serviceRef = useRef(getWebSocketAnalyticsService());

  const handleUpdate = useCallback(
    (update: AnalyticsUpdate) => {
      if (onUpdate) {
        onUpdate(update);
      }
    },
    [onUpdate]
  );

  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      if (onError) {
        onError(err);
      }
    },
    [onError]
  );

  const handleConnectionChange = useCallback((connected: boolean) => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
    if (connected) {
      setError(null);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      const service = serviceRef.current;
      const config: WebSocketConfig = {
        url,
        eventId,
        onUpdate: handleUpdate,
        onError: handleError,
        onConnectionChange: handleConnectionChange
      };
      await service.connect(config);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      setConnectionStatus('disconnected');
    }
  }, [eventId, url, handleUpdate, handleError, handleConnectionChange]);

  const disconnect = useCallback(() => {
    const service = serviceRef.current;
    service.disconnect();
    setConnectionStatus('disconnected');
  }, []);

  const isConnected = useCallback(() => {
    return serviceRef.current.isConnected();
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connectionStatus,
    error,
    connect,
    disconnect,
    isConnected,
    service: serviceRef.current
  };
}

