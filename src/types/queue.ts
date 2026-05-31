export type QueueStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface QueueTask {
  id: string;
  title: string;
  description: string;
  status: QueueStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedQueue {
  id: string;
  name: string;
  description: string;
  tasks: QueueTask[];
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStoreState {
  queues: SavedQueue[];
  loading: boolean;
  error: string | null;
  addQueue: (_queue: Omit<SavedQueue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQueue: (_id: string, _updates: Partial<SavedQueue>) => void;
  deleteQueue: (_id: string) => void;
  addTask: (_queueId: string, _task: Omit<QueueTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (_queueId: string, _taskId: string, _updates: Partial<QueueTask>) => void;
  deleteTask: (_queueId: string, _taskId: string) => void;
  clearError: () => void;
}
