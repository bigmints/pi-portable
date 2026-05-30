import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  frequency: 'instant' | 'batched' | 'digest';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  channels: {
    jobComplete: boolean;
    jobError: boolean;
    taskComplete: boolean;
    taskFailed: boolean;
    queueComplete: boolean;
    messageResponse: boolean;
  };
}

export const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: false,
  frequency: 'instant',
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  channels: {
    jobComplete: true,
    jobError: true,
    taskComplete: true,
    taskFailed: true,
    queueComplete: true,
    messageResponse: true,
  },
};

interface NotificationSettingsState {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
  toggleChannel: (channel: keyof NotificationSettings['channels']) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      toggleChannel: (channel) =>
        set((state) => ({
          settings: {
            ...state.settings,
            channels: {
              ...state.settings.channels,
              [channel]: !state.settings.channels[channel],
            },
          },
        })),
    }),
    { name: 'pi-notification-settings' }
  )
);
