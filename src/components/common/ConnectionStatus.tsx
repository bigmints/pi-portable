'use client';
import { useConnectionStore } from '@/store/connection';
import { wsClient } from '@/lib/ws-client';
import { cn } from '@/lib/utils';

export default function ConnectionStatus() {
  const state = useConnectionStore((s) => s.state);
  const attempts = useConnectionStore((s) => s.reconnectAttempts);
  const max = useConnectionStore((s) => s.maxReconnectAttempts);

  if (state === 'connected') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Connected
      </div>
    );
  }

  if (state === 'reconnecting') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
        <span className="h-3 w-3 animate-spin rounded-full border border-amber-500 border-t-transparent" />
        {attempts}/{max}
      </div>
    );
  }

  return (
    <button
      onClick={() => wsClient.retry()}
      className="flex items-center gap-1.5 text-xs text-red-400 font-medium hover:text-red-300 transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Offline · Retry
    </button>
  );
}
