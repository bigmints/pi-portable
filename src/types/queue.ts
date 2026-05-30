export interface SavedQueue {
  id: string;
  name: string;
  tasks: QueueTask[];
  createdAt: string;
  updatedAt: string;
}

export interface QueueTask {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  conversationId?: string;
  createdAt: string;
}
