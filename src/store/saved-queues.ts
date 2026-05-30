import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SavedQueue, QueueTask } from '@/types/queue';

interface SavedQueuesState {
  // New API
  queues: SavedQueue[];
  addQueue: (name: string, tasks: QueueTask[]) => SavedQueue;
  loadQueue: (id: string) => (QueueTask & { instruction: string })[] | null;
  deleteQueue: (id: string) => void;
  updateQueue: (id: string, name: string, tasks: QueueTask[]) => void;

  // Legacy API compatibility
  savedQueues: any[];
  saveQueue: (name: string, tasks: any[]) => void;
}

const addQueueInternal = (name: string, tasks: any[]) => {
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  const now = new Date().toISOString();
  
  const queueTasks: QueueTask[] = tasks.map(t => ({
    id: t.id || Math.random().toString(36).substring(2, 10),
    prompt: t.prompt || t.instruction || '',
    status: (t.status as any) === 'skipped' ? 'pending' : (t.status || 'pending'),
    conversationId: t.conversationId,
    createdAt: t.createdAt || now
  }));

  const legacyTasks = tasks.map(t => ({
    id: t.id || Math.random().toString(36).substring(2, 10),
    instruction: t.instruction || t.prompt || '',
    status: t.status || 'pending',
    conversationId: t.conversationId,
    startedAt: t.startedAt,
    completedAt: t.completedAt,
    error: t.error
  }));

  const newQueue: SavedQueue = {
    id: newId,
    name,
    tasks: queueTasks,
    createdAt: now,
    updatedAt: now
  };

  const newLegacyQueue = {
    id: newId,
    name,
    tasks: legacyTasks,
    createdAt: now,
    updatedAt: now
  };

  return { newQueue, newLegacyQueue };
};

export const useSavedQueuesStore = create<SavedQueuesState>()(
  persist(
    (set, get) => ({
      queues: [],
      savedQueues: [],
      
      addQueue: (name, tasks) => {
        const { newQueue, newLegacyQueue } = addQueueInternal(name, tasks);
        set((state) => ({
          queues: [...(state.queues || []), newQueue],
          savedQueues: [...(state.savedQueues || []), newLegacyQueue]
        }));
        return newQueue;
      },
      
      saveQueue: (name, tasks) => {
        const { newQueue, newLegacyQueue } = addQueueInternal(name, tasks);
        set((state) => ({
          queues: [...(state.queues || []), newQueue],
          savedQueues: [...(state.savedQueues || []), newLegacyQueue]
        }));
      },
      
      loadQueue: (id) => {
        const queue = get().queues?.find((q) => q.id === id);
        if (!queue) return null;
        return queue.tasks.map(t => ({
          ...t,
          instruction: t.prompt
        }));
      },
      
      deleteQueue: (id) => {
        set((state) => ({
          queues: (state.queues || []).filter((q) => q.id !== id),
          savedQueues: (state.savedQueues || []).filter((q) => q.id !== id),
        }));
      },
      
      updateQueue: (id, name, tasks) => {
        const now = new Date().toISOString();
        set((state) => ({
          queues: (state.queues || []).map((q) =>
            q.id === id
              ? {
                  ...q,
                  name,
                  tasks: tasks.map(t => ({
                    id: t.id || Math.random().toString(36).substring(2, 10),
                    prompt: t.prompt || (t as any).instruction || '',
                    status: (t.status as any) === 'skipped' ? 'pending' : (t.status || 'pending'),
                    conversationId: t.conversationId,
                    createdAt: (t as any).createdAt || now
                  })),
                  updatedAt: now
                }
              : q
          ),
          savedQueues: (state.savedQueues || []).map((q) =>
            q.id === id
              ? {
                  ...q,
                  name,
                  tasks: tasks.map(t => ({
                    id: t.id || Math.random().toString(36).substring(2, 10),
                    instruction: (t as any).instruction || t.prompt || '',
                    status: t.status || 'pending',
                    conversationId: t.conversationId,
                    startedAt: (t as any).startedAt,
                    completedAt: (t as any).completedAt,
                    error: (t as any).error
                  })),
                  updatedAt: now
                }
              : q
          ),
        }));
      },
    }),
    { name: 'pi-saved-queues' }
  )
);
