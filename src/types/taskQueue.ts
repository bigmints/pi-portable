/**
 * Task queue types — standalone task cards and queue run state
 */

// ─── Task status ─────────────────────────────────────────────────────────────

export type QueueTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// ─── On-failure behavior ─────────────────────────────────────────────────────

export type OnFailureAction = 'pause' | 'skip' | 'abort';

// ─── Queue task ───────────────────────────────────────────────────────────────

export interface QueueTask {
  id: string;
  prompt: string;
  status: QueueTaskStatus;
  conversationId?: string;  // linked conversation
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

// ─── Queue run state ─────────────────────────────────────────────────────────

export interface QueueRun {
  isActive: boolean;
  currentIndex: number;  // which task is currently running
  completedCount: number;
  failedCount: number;
  lockedProjectId: string | null;  // project locked at start
  onFailure: OnFailureAction;
  startedAt?: number;
  completedAt?: number;
}

// ─── Legacy alias (keep backward compat) ─────────────────────────────────────

export type TaskStatus = QueueTaskStatus;

/**
 * Saved queue — persisted template of tasks that can be loaded and re-run
 */
export interface SavedQueue {
  id: string;
  name: string;
  tasks: TaskCard[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskCard {
  id: string;
  instruction: string;
  status: TaskStatus;
  conversationId?: string;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}
