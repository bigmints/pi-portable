import { create } from 'zustand';
import type {
  PwaInstallStatus,
  PwaInstallPrompt,
  PwaCapabilities,
  ServiceWorkerStatus,
  PwaNotificationSettings,
  SyncQueueItem,
} from '@/types/pwa';

interface PwaStoreState {
  installStatus: PwaInstallStatus;
  capabilities: PwaCapabilities;
  deferredPrompt: PwaInstallPrompt | null;
  isOnline: boolean;
  isMobile: boolean;
  swStatus: ServiceWorkerStatus;
  notifications: PwaNotificationSettings;
  syncQueue: SyncQueueItem[];
  setInstallStatus: (status: PwaInstallStatus) => void;
  setCapabilities: (capabilities: PwaCapabilities) => void;
  setDeferredPrompt: (prompt: PwaInstallPrompt | null) => void;
  setIsOnline: (online: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
  setSwStatus: (status: ServiceWorkerStatus) => void;
  setNotificationSettings: (settings: PwaNotificationSettings) => void;
  addToSyncQueue: (item: SyncQueueItem) => void;
  removeFromSyncQueue: (id: string) => void;
  clearSyncQueue: () => void;
  reset: () => void;
}

const DEFAULT_CAPABILITIES: PwaCapabilities = {
  installable: false,
  displayMode: 'browser',
  offlineCapable: false,
  touchCapable: false,
};

const DEFAULT_SW_STATUS: ServiceWorkerStatus = {
  registered: false,
  version: null,
  updating: false,
  message: 'Checking...',
};

const DEFAULT_NOTIFICATIONS: PwaNotificationSettings = {
  enabled: false,
  permission: 'default',
  jobCompletion: true,
  jobFailure: true,
  sound: false,
  desktop: false,
};

export const usePwaStore = create<PwaStoreState>((set) => ({
  installStatus: 'not-supported',
  capabilities: DEFAULT_CAPABILITIES,
  deferredPrompt: null,
  isOnline: true,
  isMobile: false,
  swStatus: DEFAULT_SW_STATUS,
  notifications: DEFAULT_NOTIFICATIONS,
  syncQueue: [],

  setInstallStatus: (status) => set({ installStatus: status }),
  setCapabilities: (capabilities) => set({ capabilities }),
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  setIsOnline: (online) => set({ isOnline: online }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  setSwStatus: (status) => set({ swStatus: status }),
  setNotificationSettings: (settings) => set({ notifications: settings }),
  addToSyncQueue: (item) =>
    set((state) => ({ syncQueue: [...state.syncQueue, item] })),
  removeFromSyncQueue: (id) =>
    set((state) => ({
      syncQueue: state.syncQueue.filter((item) => item.id !== id),
    })),
  clearSyncQueue: () => set({ syncQueue: [] }),

  reset: () =>
    set({
      installStatus: 'not-supported',
      capabilities: DEFAULT_CAPABILITIES,
      deferredPrompt: null,
      isOnline: true,
      isMobile: false,
      swStatus: DEFAULT_SW_STATUS,
      notifications: DEFAULT_NOTIFICATIONS,
      syncQueue: [],
    }),
}));
