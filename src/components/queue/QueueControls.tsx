/**
 * QueueControls — control bar with Run Queue, Pause after current toggle,
 * Cancel all, and Settings gear.
 */

'use client';

import { Play, X, Settings, Pause } from 'lucide-react';
import { useTaskQueueStore } from '@/store/task-queue';
import { useQueueControlStore } from '@/store/queue-control';
import { wsClient } from '@/lib/ws-client';
import type { WsQueueStopFrame, WsQueueStartFrame, OnFailureAction } from '@/types/chat';
import CancelConfirmDialog from './CancelConfirmDialog';
import QueueSettingsPopover from './QueueSettingsPopover';
import styles from './QueueControls.module.css';

export default function QueueControls() {
  const { tasks, updateTaskStatus } = useTaskQueueStore();
  const {
    status,
    pauseAfterCurrent,
    confirmCancel,
    settings,
    runQueue,
    togglePauseAfterCurrent,
    cancelAll,
    dismissCancelConfirm,
    setStatus,
  } = useQueueControlStore();

  const isEmpty = tasks.length === 0;
  const isRunning = status === 'running';

  // Run Queue — sends WebSocket command and updates local state
  const handleRunQueue = () => {
    if (isEmpty || isRunning) return;
    runQueue();
    const frame: WsQueueStartFrame = {
      type: 'queue_start',
      taskId: tasks[0]?.id ?? '',
      projectId: '',
      onFailure: settings.onFailure,
    };
    wsClient.sendRaw(frame as unknown as Record<string, unknown>);
  };

  // Cancel All — marks all pending tasks as cancelled, stops run
  const handleCancelAll = () => {
    tasks.forEach((t) => {
      if (t.status === 'pending') {
        updateTaskStatus(t.id, 'skipped');
      }
    });
    setStatus('idle');
    dismissCancelConfirm();
    const stopFrame: WsQueueStopFrame = { type: 'queue_stop' };
    wsClient.sendRaw(stopFrame as unknown as Record<string, unknown>);
  };

  return (
    <div className={`${styles.controls} ${isEmpty ? styles.disabled : ''}`}>
      {/* Run Queue */}
      <button
        className={`${styles.btn} ${styles.primary}`}
        disabled={isEmpty || isRunning}
        onClick={handleRunQueue}
        data-testid="run-queue-btn"
        aria-label="Run queue"
      >
        <Play size={16} />
        Run Queue
      </button>

      {/* Pause after current toggle */}
      <button
        className={`${styles.btn} ${styles.toggle} ${pauseAfterCurrent ? styles.active : ''}`}
        disabled={isEmpty}
        onClick={togglePauseAfterCurrent}
        data-testid="pause-after-current-btn"
        aria-pressed={pauseAfterCurrent}
        aria-label={pauseAfterCurrent ? 'Resuming' : 'Pause after current'}
      >
        <Pause size={14} />
        {pauseAfterCurrent ? 'Resuming' : 'Pause after current'}
      </button>

      {/* Cancel all */}
      <button
        className={`${styles.btn} ${styles.danger}`}
        disabled={isEmpty || status === 'idle'}
        onClick={cancelAll}
        data-testid="cancel-all-btn"
        aria-label="Cancel all"
      >
        <X size={16} />
        Cancel all
      </button>

      {/* Settings gear */}
      <QueueSettingsPopover />

      {/* Cancel confirmation dialog */}
      <CancelConfirmDialog
        open={confirmCancel}
        onConfirm={handleCancelAll}
        onDismiss={dismissCancelConfirm}
      />
    </div>
  );
}
