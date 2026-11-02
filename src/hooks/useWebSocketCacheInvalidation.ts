import {useEffect, useRef, useState} from "react";
import {QueryClient} from "@tanstack/react-query";

export interface WebSocketMessage {
  type: string;
  cacheType?: string;
  cacheKeys?: string[];
  invalidateAll?: boolean;
  forceRefresh?: boolean;

  [key: string]: unknown;
}

export interface WebSocketOptions {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onInvalidate?: () => void;
}

export function useWebSocketCacheInvalidation(queryClient: QueryClient, options: WebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const handleCacheInvalidation = (message: WebSocketMessage) => {
    if (message.invalidateAll) {
      queryClient.clear();
    } else if (message.cacheKeys && message.cacheKeys.length > 0) {
      message.cacheKeys.forEach((key) => {
        queryClient.invalidateQueries({queryKey: [key]});
        queryClient.removeQueries({queryKey: [key]});
      });
    } else if (message.cacheType) {
      queryClient.invalidateQueries({queryKey: [message.cacheType]});
      queryClient.removeQueries({queryKey: [message.cacheType]});
    }

    if (message.forceRefresh) {
      const delay = Math.random() * 5000;
      setTimeout(() => {
        queryClient.refetchQueries();
      }, delay);
    }

    const currentOptions = optionsRef.current;
    if (currentOptions.onInvalidate) {
      currentOptions.onInvalidate();
    }
  };

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const currentOptions = optionsRef.current;

    try {
      const socket = new WebSocket(currentOptions.url);

      socket.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const wrapper = JSON.parse(event.data);

          if (wrapper.type === "cache-invalidate") {
            let message: WebSocketMessage;
            if (typeof wrapper.content === "string") {
              message = JSON.parse(wrapper.content);
            } else {
              message = wrapper.content || wrapper;
            }
            handleCacheInvalidation(message);
          }
        } catch {
          // ignore parse errors
        }
      };

      socket.onerror = (_event) => {
        setError(new Error("WebSocket 连接错误"));
      };

      socket.onclose = (event) => {
        setIsConnected(false);

        if (event.code !== 1000 && reconnectAttemptsRef.current < (currentOptions.maxReconnectAttempts || 10)) {
          reconnectAttemptsRef.current++;
          const delay = (currentOptions.reconnectDelay || 3000) * reconnectAttemptsRef.current;

          reconnectTimerRef.current = setTimeout(() => {
            if (connectRef.current) {
              connectRef.current();
            }
          }, delay);
        }
      };

      socketRef.current = socket;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("WebSocket 连接失败"));
    }
  };

  const disconnect = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close(1000, "主动断开");
      socketRef.current = null;
    }

    setIsConnected(false);
  };

  useEffect(() => {
    connectRef.current = connect;
    setTimeout(() => {
      connect();
    }, 0);

    return () => {
      disconnect();
    };
  }, []);

  return {isConnected, error, disconnect, reconnect: connect};
}