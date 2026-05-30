/**
 * Queue editor store — manages task CRUD, inline editing state, draft persistence,
 * and synchronizes changes with the wsClient queue methods.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaskCard } from '@/types/taskQueue';
import { wsClient } from '@/lib/ws-client';
import { useQueueControlStore } from './queue-control';

export interface QueueEditorState {
  tasks: TaskCard[];
  editingTaskId: string | null;
  draftInstruction: string;
  isDirty: boolean;

  // Task CRUD Actions
  addTask: (instruction?: string) => string;
  removeTask: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  updateTaskInstruction: (id: string, instruction: string) => void;
  updateTaskStatus: (id: string, status: TaskCard['status']) => void;
  clearTasks: () => void;
  setTasks: (tasks: TaskCard[]) => void;

  // Inline Editing Actions
  startEditing: (id: string) => boolean; // Returns true if edit started successfully (or no dirty drafts)
  updateDraft: (instruction: string) => void;
  saveEditing: () => void;
  cancelEditing: () => void;
}

export const useQueueEditorStore = create<QueueEditorState>()(
  persist(
    (set, get) => ({
      tasks: [],
      editingTaskId: null,
      draftInstruction: '',
      isDirty: false,

      addTask: (instruction = '') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const newTask: TaskCard = { id, instruction, status: 'pending' };
        
        set((state) => {
          const updated = [...state.tasks, newTask];
          return { tasks: updated };
        });

        // Sync with WebSocket if queue is running
        const controlStore = useQueueControlStore.getState();
        if (controlStore.status === 'running') {
          wsClient.sendQueueTask(id, '', instruction);
        }

        return id;
      },

      removeTask: (id: string) => {
        const { editingTaskId } = get();
        
        set((state) => {
          const updated = state.tasks.filter((t) => t.id !== id);
          return {
            tasks: updated,
            ...(editingTaskId === id ? { editingTaskId: null, draftInstruction: '', isDirty: false } : {}),
          };
        });

        // Emit WebSocket remove event
        wsClient.send({ type: 'queue_task_remove', taskId: id });

        // If the cancelled task was currently running, we may want to stop the queue
        const controlStore = useQueueControlStore.getState();
        if (controlStore.status === 'running') {
          // Check if there are no more tasks running
          const hasRunningTask = get().tasks.some(t => t.status === 'running');
          if (!hasRunningTask) {
            // Optional: trigger stop or skip if needed
          }
        }
      },

      reorderTasks: (fromIndex: number, toIndex: number) => {
        set((state) => {
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= state.tasks.length ||
            toIndex >= state.tasks.length
          ) {
            return state;
          }
          const updated = [...state.tasks];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          return { tasks: updated };
        });

        // Trigger sync of reordered tasks to WS if running
        const { tasks } = get();
        const controlStore = useQueueControlStore.getState();
        if (controlStore.status === 'running') {
          // Re-send tasks in new order to let the server know about position changes
          tasks.forEach((task, idx) => {
            wsClient.send({
              type: 'queue_task_position',
              taskId: task.id,
              position: idx + 1,
              total: tasks.length,
            });
          });
        }
      },

      updateTaskInstruction: (id: string, instruction: string) => {
        set((state) => {
          const updated = state.tasks.map((t) =>
            t.id === id ? { ...t, instruction } : t
          );
          return { tasks: updated };
        });

        // Sync change with WebSocket
        wsClient.sendQueueTask(id, '', instruction);
      },

      updateTaskStatus: (id: string, status: TaskCard['status']) => {
        set((state) => {
          const updated = state.tasks.map((t) =>
            t.id === id ? { ...t, status } : t
          );
          return { tasks: updated };
        });
      },

      clearTasks: () => {
        set(() => ({
          tasks: [],
          editingTaskId: null,
          draftInstruction: '',
          isDirty: false,
        }));
      },

      setTasks: (tasks: TaskCard[]) => {
        set(() => ({ tasks }));
      },

      startEditing: (id: string) => {
        const { editingTaskId, isDirty, tasks } = get();
        
        // Unsaved changes warning checks
        if (isDirty && editingTaskId !== id) {
          const confirmDiscard = typeof window !== 'undefined' 
            ? window.confirm('You have unsaved changes. Do you want to discard them?')
            : true;
          
          if (!confirmDiscard) {
            return false;
          }
        }

        const task = tasks.find((t) => t.id === id);
        if (!task) return false;

        set({
          editingTaskId: id,
          draftInstruction: task.instruction,
          isDirty: false,
        });

        return true;
      },

      updateDraft: (instruction: string) => {
        const { editingTaskId, tasks } = get();
        if (!editingTaskId) return;

        const originalTask = tasks.find((t) => t.id === editingTaskId);
        const originalVal = originalTask ? originalTask.instruction : '';

        set({
          draftInstruction: instruction,
          isDirty: instruction !== originalVal,
        });
      },

      saveEditing: () => {
        const { editingTaskId, draftInstruction, tasks } = get();
        if (!editingTaskId) return;

        set((state) => {
          const updated = state.tasks.map((t) =>
            t.id === editingTaskId ? { ...t, instruction: draftInstruction } : t
          );
          return {
            tasks: updated,
            editingTaskId: null,
            draftInstruction: '',
            isDirty: false,
          };
        });

        // Sync the finalized prompt to WebSocket
        wsClient.sendQueueTask(editingTaskId, '', draftInstruction);
      },

      cancelEditing: () => {
        const { isDirty } = get();
        if (isDirty) {
          const confirmDiscard = typeof window !== 'undefined'
            ? window.confirm('Discard unsaved changes?')
            : true;
          
          if (!confirmDiscard) return;
        }

        set({
          editingTaskId: null,
          draftInstruction: '',
          isDirty: false,
        });
      },
    }),
    {
      name: 'pi-task-queue-editor',
      getStorage: () => localStorage,
    }
  )
);
