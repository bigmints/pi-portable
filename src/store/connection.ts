/**
 * Connection store — WebSocket connection state (single source of truth)
 */

import { create } from 'zustand';
import type { WsConnectionState } from '@/types/chat';

const MAX_RECONNECT_ATTEMPTS = 10;

interface ConnectionState {
  state: WsConnectionState;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  lastError: string | null;
  lastAttemptAt: Date | null;

  // Actions
  setState: (state: WsConnectionState) => void;
  setConnected: () => void;
  setReconnecting: () => void;
  setOffline: () => void;
  retryConnection: () => void;
  incrementReconnectAttempt: () => boolean;
  resetReconnectAttempts: () => void;
  setLastError: (error: string | null) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  state: 'offline',
  reconnectAttempts: 0,
  maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
  lastError: null,
  lastAttemptAt: null,

  setState: (state: WsConnectionState) => set(() => ({ state })),

  setConnected: () =>
    set(() => ({
      state: 'connected',
      reconnectAttempts: 0,
      lastError: null,
      lastAttemptAt: null,
    })),

  setReconnecting: () =>
    set((prev) => ({
      state: 'reconnecting',
      reconnectAttempts: prev.reconnectAttempts + 1,
      lastAttemptAt: new Date(),
    })),

  setOffline: () =>
    set(() => ({
      state: 'offline',
      lastAttemptAt: null,
    })),

  retryConnection: () =>
    set(() => ({
      state: 'reconnecting',
      reconnectAttempts: 1,
      lastError: null,
      lastAttemptAt: new Date(),
    })),

  incrementReconnectAttempt: () => {
    const { reconnectAttempts, maxReconnectAttempts } = get();
    const next = reconnectAttempts + 1;
    const underMax = next <= maxReconnectAttempts;
    set(() => ({
      reconnectAttempts: next,
      lastAttemptAt: new Date(),
    }));
    return underMax;
  },

  resetReconnectAttempts: () => set(() => ({ reconnectAttempts: 0 })),

  setLastError: (error: string | null) => set(() => ({ lastError: error })),
}));
