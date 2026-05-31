import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SavedQueue, QueueStoreState, QueueTask } from '@/types/queue';

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
const now = () => new Date().toISOString();

export const useQueueStore = create<QueueStoreState>()(
  persist(
    (set, _get) => ({
      queues: [],
      loading: false,
      error: null,

      addQueue: (queue) => {
        const newQueue: SavedQueue = {
          ...queue,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ queues: [...state.queues, newQueue] }));
      },

      updateQueue: (id, updates) => {
        set((state) => ({
          queues: state.queues.map((q) =>
            q.id === id ? { ...q, ...updates, updatedAt: now() } : q
          ),
        }));
      },

      deleteQueue: (id) => {
        set((state) => ({ queues: state.queues.filter((q) => q.id !== id) }));
      },

      addTask: (queueId, task) => {
        const newTask: QueueTask = {
          ...task,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({
          queues: state.queues.map((q) =>
            q.id === queueId ? { ...q, tasks: [...q.tasks, newTask], updatedAt: now() } : q
          ),
        }));
      },

      updateTask: (queueId, taskId, updates) => {
        set((state) => ({
          queues: state.queues.map((q) =>
            q.id === queueId
              ? {
                  ...q,
                  tasks: q.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updates, updatedAt: now() } : t
                  ),
                  updatedAt: now(),
                }
              : q
          ),
        }));
      },

      deleteTask: (queueId, taskId) => {
        set((state) => ({
          queues: state.queues.map((q) =>
            q.id === queueId
              ? { ...q, tasks: q.tasks.filter((t) => t.id !== taskId), updatedAt: now() }
              : q
          ),
        }));
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'pi-queue-store' }
  )
);
