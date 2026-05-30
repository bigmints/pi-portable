import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  jobComplete: boolean;
  jobError: boolean;
  taskComplete: boolean;
  taskFailed: boolean;
  queueComplete: boolean;
  soundEffects: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  jobComplete: true,
  jobError: true,
  taskComplete: true,
  taskFailed: true,
  queueComplete: true,
  soundEffects: true,
};

interface NotificationSettingsStore {
  settings: NotificationSettings;
  toggleSetting: (key: keyof NotificationSettings) => void;
  resetSettings: () => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      toggleSetting: (key) =>
        set((state) => {
          const newSettings = { ...state.settings, [key]: !state.settings[key] };
          fetch('/api/settings/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings),
          }).catch(() => {});
          return { settings: newSettings };
        }),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'pi-notification-settings' }
  )
);
