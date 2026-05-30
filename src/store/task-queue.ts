/**
 * Task queue store — manages ordered task cards with localStorage persistence
 */

import { create } from 'zustand';
import type { TaskCard } from '@/types/taskQueue';

const STORAGE_KEY = 'pi-task-queue';

function loadTasks(): TaskCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TaskCard[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

function saveTasks(tasks: TaskCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // storage full — silently ignore
  }
}

interface TaskQueueState {
  tasks: TaskCard[];

  addTask: () => string;
  removeTask: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  updateTaskInstruction: (id: string, instruction: string) => void;
  updateTaskStatus: (id: string, status: TaskCard['status']) => void;
  clearTasks: () => void;
}

export const useTaskQueueStore = create<TaskQueueState>((set) => ({
  tasks: loadTasks(),

  addTask: () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const newTask: TaskCard = { id, instruction: '', status: 'pending' };
    set((state) => {
      const updated = [...state.tasks, newTask];
      saveTasks(updated);
      return { tasks: updated };
    });
    return id;
  },

  removeTask: (id: string) => {
    set((state) => {
      const updated = state.tasks.filter((t) => t.id !== id);
      saveTasks(updated);
      return { tasks: updated };
    });
  },

  reorderTasks: (fromIndex: number, toIndex: number) => {
    set((state) => {
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= state.tasks.length || toIndex >= state.tasks.length) {
        return state;
      }
      const updated = [...state.tasks];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      saveTasks(updated);
      return { tasks: updated };
    });
  },

  updateTaskInstruction: (id: string, instruction: string) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, instruction } : t
      );
      saveTasks(updated);
      return { tasks: updated };
    });
  },

  updateTaskStatus: (id: string, status: TaskCard['status']) => {
    set((state) => {
      const updated = state.tasks.map((t) =>
        t.id === id ? { ...t, status } : t
      );
      saveTasks(updated);
      return { tasks: updated };
    });
  },

  clearTasks: () => {
    set(() => {
      saveTasks([]);
      return { tasks: [] };
    });
  },
}));
