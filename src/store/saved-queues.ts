/**
 * Saved queues store — persists named queue templates to localStorage
 * and syncs to POST /api/queues for cross-device access.
 */

import { create } from 'zustand';
import type { TaskCard, QueueTaskStatus } from '@/types/taskQueue';

export interface SavedQueue {
  id: string;
  name: string;
  tasks: TaskCard[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'pi-saved-queues';

function loadFromStorage(): SavedQueue[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedQueue[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

function saveToStorage(queues: SavedQueue[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
  } catch {
    // storage full — silently ignore
  }
}

interface SavedQueuesState {
  savedQueues: SavedQueue[];

  saveQueue: (name: string, tasks: TaskCard[]) => SavedQueue | null;
  loadQueue: (id: string) => TaskCard[] | null;
  deleteQueue: (id: string) => void;
  syncToServer: () => Promise<void>;
  pullFromServer: () => Promise<void>;
}

export const useSavedQueuesStore = create<SavedQueuesState>((set, get) => ({
  savedQueues: loadFromStorage(),

  saveQueue: (name: string, tasks: TaskCard[]) => {
    const queues = get().savedQueues;
    const now = new Date().toISOString();
    const existingIdx = queues.findIndex((q) => q.name === name);

    // Deep-clone tasks so the saved copy is independent
    const clonedTasks: TaskCard[] = tasks.map((t) => ({ ...t, status: 'pending' as QueueTaskStatus }));

    if (existingIdx >= 0) {
      // Update existing queue
      const updated = [...queues];
      updated[existingIdx] = {
        ...updated[existingIdx],
        name,
        tasks: clonedTasks,
        updatedAt: now,
      };
      saveToStorage(updated);
      set({ savedQueues: updated });
      get().syncToServer().catch(() => {});
      return updated[existingIdx];
    }

    // Create new queue
    const newQueue: SavedQueue = {
      id: crypto.randomUUID(),
      name,
      tasks: clonedTasks,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...queues, newQueue];
    saveToStorage(updated);
    set({ savedQueues: updated });
    get().syncToServer().catch(() => {});
    return newQueue;
  },

  loadQueue: (id: string) => {
    const queue = get().savedQueues.find((q) => q.id === id);
    return queue ? queue.tasks : null;
  },

  deleteQueue: (id: string) => {
    const queues = get().savedQueues.filter((q) => q.id !== id);
    saveToStorage(queues);
    set({ savedQueues: queues });
    get().syncToServer().catch(() => {});
  },

  syncToServer: async () => {
    try {
      await fetch('/api/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queues: get().savedQueues }),
      });
    } catch {
      // Server sync failure is non-fatal
    }
  },

  pullFromServer: async () => {
    try {
      const res = await fetch('/api/queues');
      if (!res.ok) return;
      const data = await res.json();
      if (data.queues && Array.isArray(data.queues)) {
        const local = get().savedQueues;
        const serverMap = new Map(data.queues.map((q: SavedQueue) => [q.id, q]));
        const merged = local.map((q) => serverMap.get(q.id) ?? q);
        for (const sq of data.queues) {
          if (!local.find((q) => q.id === sq.id)) {
            merged.push(sq);
          }
        }
        saveToStorage(merged);
        set({ savedQueues: merged });
      }
    } catch {
      // Server pull failure is non-fatal
    }
  },
}));
