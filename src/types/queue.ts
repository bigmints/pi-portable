export interface QueueTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface SavedQueue {
  id: string;
  name: string;
  description?: string;
  tasks: QueueTask[];
  createdAt: string;
  updatedAt: string;
}

export type QueueStatus = 'active' | 'archived' | 'completed';
