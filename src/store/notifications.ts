'use client';
import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'job_complete'
  | 'job_error'
  | 'task_complete'
  | 'task_failed'
  | 'queue_complete'
  | 'system'
  | 'message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number; // epoch ms
  read: boolean;
  link?: string; // deep-link to related resource (e.g., /jobs/123)
  linkLabel?: string; // e.g., "View Job"
}

interface NewNotification {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pi-notifications';

function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Notification[];
  } catch {
    // Corrupted storage
  }
  return [];
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Storage full or unavailable
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface NotificationsStore {
  notifications: Notification[];
  addNotification: (notification: NewNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: loadNotifications(),

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: Date.now(),
      read: false,
    };
    set((state) => {
      const updated = [newNotification, ...state.notifications];
      saveNotifications(updated);
      return { notifications: updated };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      saveNotifications(updated);
      return { notifications: updated };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return { notifications: updated };
    });
  },

  clearAll: () => {
    set({ notifications: [] });
    saveNotifications([]);
  },

  removeNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      saveNotifications(updated);
      return { notifications: updated };
    });
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
