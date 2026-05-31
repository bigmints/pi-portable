import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedQueue, QueueTask } from '@/types/queue';

interface QueueStore {
  queues: SavedQueue[];
  activeQueueId: string | null;
  addQueue: (_queue: SavedQueue) => void;
  updateQueue: (_id: string, _updates: Partial<SavedQueue>) => void;
  deleteQueue: (_id: string) => void;
  setActiveQueue: (_id: string | null) => void;
  addTask: (_queueId: string, _task: Omit<QueueTask, 'id' | 'createdAt'>) => void;
  updateTask: (_queueId: string, _taskId: string, _updates: Partial<QueueTask>) => void;
  deleteTask: (_queueId: string, _taskId: string) => void;
}

export const useQueueStore = create<QueueStore>()(
  persist(
    (set) => ({
      queues: [],
      activeQueueId: null,
      addQueue: (queue) => set((state) => ({
        queues: [...state.queues, queue],
      })),
      updateQueue: (id, updates) => set((state) => ({
        queues: state.queues.map((q) =>
          q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
        ),
      })),
      deleteQueue: (id) => set((state) => ({
        queues: state.queues.filter((q) => q.id !== id),
        activeQueueId: state.activeQueueId === id ? null : state.activeQueueId,
      })),
      setActiveQueue: (id) => set({ activeQueueId: id }),
      addTask: (queueId, task) => set((state) => ({
        queues: state.queues.map((q) =>
          q.id === queueId
            ? { ...q, tasks: [...q.tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() }
            : q
        ),
      })),
      updateTask: (queueId, taskId, updates) => set((state) => ({
        queues: state.queues.map((q) =>
          q.id === queueId
            ? { ...q, tasks: q.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t), updatedAt: new Date().toISOString() }
            : q
        ),
      })),
      deleteTask: (queueId, taskId) => set((state) => ({
        queues: state.queues.map((q) =>
          q.id === queueId ? { ...q, tasks: q.tasks.filter((t) => t.id !== taskId), updatedAt: new Date().toISOString() } : q
        ),
      })),
    }),
    { name: 'pi-queues' }
  )
);
