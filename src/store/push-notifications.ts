'use client';
import { create } from 'zustand';

export type PermissionState = 'default' | 'granted' | 'denied' | 'prompted';

interface PushNotificationState {
  permissionState: PermissionState;
  subscription: PushSubscription | null;
  hasPrompted: boolean;
  setPermissionState: (state: PermissionState) => void;
  setSubscription: (sub: PushSubscription | null) => void;
  markPrompted: () => void;
  clearSubscription: () => void;
  init: () => void;
}

export const usePushNotificationsStore = create<PushNotificationState>((set, get) => ({
  permissionState: 'default',
  subscription: null,
  hasPrompted: false,
  setPermissionState: (state) => {
    set({ permissionState: state });
    localStorage.setItem('pi-push-permission', state);
  },
  setSubscription: (sub) => set({ subscription: sub }),
  markPrompted: () => {
    set({ hasPrompted: true });
    localStorage.setItem('pi-push-prompted', 'true');
  },
  clearSubscription: () => set({ subscription: null }),
  init: () => {
    const saved = localStorage.getItem('pi-push-permission');
    const prompted = localStorage.getItem('pi-push-prompted');
    if (saved && ['granted', 'denied', 'prompted'].includes(saved)) {
      set({ permissionState: saved as PermissionState, hasPrompted: !!prompted });
    }
    if (Notification && Notification.permission === 'granted') {
      set({ permissionState: 'granted' });
    } else if (Notification && Notification.permission === 'denied') {
      set({ permissionState: 'denied' });
    }
  },
}));
