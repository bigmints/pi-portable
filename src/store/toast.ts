/**
 * Toast store — in-app toast notification system (single source of truth)
 */

import { create } from 'zustand';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  queue: Toast[];
  nextId: number;

  addToast: (message: string, variant?: ToastVariant, duration?: number, action?: ToastAction) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;

let autoDismissTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  queue: [],
  nextId: 0,

  addToast: (message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION, action?: ToastAction) => {
    const state = get();
    const id = `toast-${state.nextId}-${Date.now()}`;
    const newToast: Toast = {
      id,
      message,
      variant,
      duration,
      createdAt: Date.now(),
      action,
    };

    if (state.toasts.length < MAX_VISIBLE) {
      // Add to visible toasts
      set((prev) => ({
        toasts: [...prev.toasts, newToast],
        nextId: prev.nextId + 1,
      }));

      // Set auto-dismiss timer
      autoDismissTimers[id] = setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    } else {
      // Queue the toast
      set((prev) => ({
        queue: [...prev.queue, newToast],
        nextId: prev.nextId + 1,
      }));
    }
  },

  dismissToast: (id: string) => {
    // Clear auto-dismiss timer
    if (autoDismissTimers[id]) {
      clearTimeout(autoDismissTimers[id]);
      delete autoDismissTimers[id];
    }

    const state = get();
    const remaining = state.toasts.filter((t) => t.id !== id);

    // Pull next from queue if available
    if (state.queue.length > 0 && remaining.length < MAX_VISIBLE) {
      const nextToast = state.queue[0];
      const remainingQueue = state.queue.slice(1);

      set((prev) => ({
        toasts: [...remaining, nextToast],
        queue: remainingQueue,
      }));

      // Set auto-dismiss timer for the promoted toast
      autoDismissTimers[nextToast.id] = setTimeout(() => {
        get().dismissToast(nextToast.id);
      }, nextToast.duration);
    } else {
      set(() => ({
        toasts: remaining,
      }));
    }
  },

  clearToasts: () => {
    // Clear all auto-dismiss timers
    Object.values(autoDismissTimers).forEach(clearTimeout);
    autoDismissTimers = {};

    set(() => ({
      toasts: [],
      queue: [],
    }));
  },
}));

/**
 * Convenience hook — returns a simple `toast` object with named methods
 */
export function useToast() {
  const { addToast, dismissToast, clearToasts } = useToastStore();

  return {
    info: (message: string, duration?: number, action?: ToastAction) => addToast(message, 'info', duration, action),
    success: (message: string, duration?: number, action?: ToastAction) => addToast(message, 'success', duration, action),
    warning: (message: string, duration?: number, action?: ToastAction) => addToast(message, 'warning', duration, action),
    error: (message: string, duration?: number, action?: ToastAction) => addToast(message, 'error', duration, action),
    dismiss: dismissToast,
    clear: clearToasts,
  };
}
