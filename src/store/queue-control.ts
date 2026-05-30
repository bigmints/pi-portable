/**
 * Queue control store — manages run controls, pause-after-current, settings, and cancel confirmation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueueTask, QueueTaskStatus, OnFailureAction } from '@/types/chat';

export type QueueStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface QueueSettings {
  onFailure: OnFailureAction;
  autoClearCompleted: boolean;
}

const DEFAULT_SETTINGS: QueueSettings = {
  onFailure: 'pause',
  autoClearCompleted: false,
};

interface QueueControlState {
  status: QueueStatus;
  pauseAfterCurrent: boolean;
  settings: QueueSettings;
  confirmCancel: boolean;

  // Actions
  runQueue: () => void;
  togglePauseAfterCurrent: () => void;
  cancelAll: () => void;
  dismissCancelConfirm: () => void;
  setOnFailure: (mode: OnFailureAction) => void;
  toggleAutoClear: () => void;
  setStatus: (status: QueueStatus) => void;
  markPendingAsCancelled: (tasks: QueueTask[]) => QueueTask[];
}

export const useQueueControlStore = create<QueueControlState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      pauseAfterCurrent: false,
      settings: DEFAULT_SETTINGS,
      confirmCancel: false,

      runQueue: () => {
        set({ status: 'running' });
      },

      togglePauseAfterCurrent: () => {
        set((s) => ({ pauseAfterCurrent: !s.pauseAfterCurrent }));
      },

      cancelAll: () => {
        set({ status: 'cancelled', confirmCancel: true });
      },

      dismissCancelConfirm: () => {
        set({ confirmCancel: false });
      },

      setOnFailure: (mode: OnFailureAction) => {
        set((s) => ({ settings: { ...s.settings, onFailure: mode } }));
      },

      toggleAutoClear: () => {
        set((s) => ({ settings: { ...s.settings, autoClearCompleted: !s.settings.autoClearCompleted } }));
      },

      setStatus: (status: QueueStatus) => {
        set({ status });
      },

      markPendingAsCancelled: (tasks: QueueTask[]) => {
        return tasks.map((t) =>
          t.status === 'pending' ? { ...t, status: 'skipped' as QueueTaskStatus } : t
        );
      },
    }),
    {
      name: 'pi-queue-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
