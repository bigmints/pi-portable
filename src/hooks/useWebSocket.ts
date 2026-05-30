'use client';

import { useEffect, useCallback } from 'react';
import { wsClient } from '@/lib/ws-client';
import { useConnectionStore } from '@/store/connection';
import type { WsInboundFrame } from '@/types/chat';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (_frame: WsInboundFrame) => void;
}

export function useWebSocket({
  autoConnect = true,
  onMessage,
}: UseWebSocketOptions = {}) {
  const state = useConnectionStore((s) => s.state);

  useEffect(() => {
    if (autoConnect) {
      wsClient.connect();
    }
    return () => {
      // Don't disconnect on unmount — keep connection alive
    };
  }, [autoConnect]);

  const handleMessage = useCallback(
    (frame: WsInboundFrame) => {
      onMessage?.(frame);
    },
    [onMessage]
  );

  useEffect(() => {
    wsClient.onMessage(handleMessage);
  }, [handleMessage]);

  return {
    state,
    connect: () => wsClient.connect(),
    disconnect: () => wsClient.disconnect(),
    isConnected: state === 'connected',
  };
}
