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

export interface NotificationSettingsState {
  settings: NotificationSettings;
  updateSettings: (update: Partial<NotificationSettings> | ((prev: NotificationSettings) => Partial<NotificationSettings>)) => void;
  resetSettings: () => void;
  toggleChannel: (channel: keyof NotificationSettings['channels']) => void;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: true,
  frequency: 'instant',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  channels: {
    jobComplete: true,
    jobError: true,
    taskComplete: true,
    taskFailed: true,
    queueComplete: true,
    messageResponse: true,
  },
};

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_NOTIFICATION_SETTINGS,
      updateSettings: (update) =>
        set((state) => {
          const nextSettings = typeof update === 'function' ? update(state.settings) : update;
          return {
            settings: {
              ...state.settings,
              ...nextSettings,
              quietHours: nextSettings.quietHours
                ? { ...state.settings.quietHours, ...nextSettings.quietHours }
                : state.settings.quietHours,
              channels: nextSettings.channels
                ? { ...state.settings.channels, ...nextSettings.channels }
                : state.settings.channels,
            },
          };
        }),
      resetSettings: () => set({ settings: DEFAULT_NOTIFICATION_SETTINGS }),
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
    {
      name: 'pi-notification-settings',
    }
  )
);
