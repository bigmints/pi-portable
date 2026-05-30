/**
 * QueueControls — control bar with Run Queue, Pause after current toggle,
 * Cancel all, and Settings gear.
 */

'use client';

import { useState } from 'react';
import { Play, X, Settings, Pause, Save } from 'lucide-react';
import { useQueueEditorStore } from '@/store/queue-editor';
import { useQueueControlStore } from '@/store/queue-control';
import { wsClient } from '@/lib/ws-client';
import type { WsQueueStopFrame, WsQueueStartFrame, OnFailureAction } from '@/types/chat';
import CancelConfirmDialog from './CancelConfirmDialog';
import QueueSettingsPopover from './QueueSettingsPopover';
import SaveQueueDialog from './SaveQueueDialog';
import styles from './QueueControls.module.css';

export default function QueueControls() {
  const { tasks, updateTaskStatus } = useQueueEditorStore();
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

  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const isEmpty = tasks.length === 0;
  const isRunning = status === 'running';

  // Run Queue — sends WebSocket command and updates local state
  const handleRunQueue = () => {
    if (isEmpty || isRunning) return;
    runQueue();
    // Send all task prompts to the server first
    tasks.forEach((t) => {
      wsClient.sendQueueTask(t.id, '', t.instruction);
    });
    // Start running the queue
    wsClient.sendQueueStart(tasks[0]?.id ?? '', '', settings.onFailure);
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
    wsClient.sendQueueStop();
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

      {/* Save Queue */}
      <button
        className={styles.btn}
        disabled={isEmpty}
        onClick={() => setShowSaveDialog(true)}
        data-testid="save-queue-btn"
        aria-label="Save queue"
      >
        <Save size={16} />
        Save
      </button>

      {/* Settings gear */}
      <QueueSettingsPopover />

      {/* Cancel confirmation dialog */}
      <CancelConfirmDialog
        open={confirmCancel}
        onConfirm={handleCancelAll}
        onDismiss={dismissCancelConfirm}
      />

      {/* Save queue dialog */}
      <SaveQueueDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        tasks={tasks}
      />
    </div>
  );
}

