import { create } from 'zustand';

export interface NotificationPreferences {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  doNotDisturb: boolean;
  dndStartHour: number;
  dndEndHour: number;
  batchNotifications: boolean;
  showBadge: boolean;
  jobNotifications: boolean;
  queueNotifications: boolean;
  messageNotifications: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  desktopNotifications: true,
  doNotDisturb: false,
  dndStartHour: 22,
  dndEndHour: 8,
  batchNotifications: false,
  showBadge: true,
  jobNotifications: true,
  queueNotifications: true,
  messageNotifications: true,
};

interface NotificationSettingsState {
  preferences: NotificationPreferences;
  setPreference: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
  resetToDefaults: () => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>((set) => ({
  preferences: (() => {
    try {
      const saved = localStorage.getItem('pi-notification-settings');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  })(),
  setPreference: (key, value) => set((state) => {
    const newPrefs = { ...state.preferences, [key]: value };
    localStorage.setItem('pi-notification-settings', JSON.stringify(newPrefs));
    return { preferences: newPrefs };
  }),
  resetToDefaults: () => set(() => {
    localStorage.setItem('pi-notification-settings', JSON.stringify(DEFAULT_PREFERENCES));
    return { preferences: DEFAULT_PREFERENCES };
  }),
}));
