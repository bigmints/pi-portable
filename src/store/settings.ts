import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light' | 'system';

export type CodeTheme =
  | 'vitesse-dark'
  | 'github-dark'
  | 'monokai-sublime'
  | 'one-dark'
  | 'github';

export interface NotificationSettings {
  jobCompletion: boolean;
  jobFailure: boolean;
  sound: boolean;
  desktop: boolean;
  haptics: boolean;
}

export interface ConnectionSettings {
  autoConnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export interface ChatSettings {
  fontSize: number;
  codeTheme: CodeTheme;
  markdownEnabled: boolean;
  autoScroll: boolean;
}

export interface DataSettings {
  autoSave: boolean;
  maxHistory: number;
}

export interface AppSettings {
  theme: ThemeMode;
  notifications: NotificationSettings;
  connection: ConnectionSettings;
  chat: ChatSettings;
  data: DataSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  notifications: {
    jobCompletion: true,
    jobFailure: true,
    sound: false,
    desktop: false,
    haptics: true,
  },
  connection: {
    autoConnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
  chat: {
    fontSize: 15,
    codeTheme: 'vitesse-dark',
    markdownEnabled: true,
    autoScroll: true,
  },
  data: {
    autoSave: true,
    maxHistory: 100,
  },
};

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pi-app-settings';

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppSettings>;
      return deepMerge(DEFAULT_SETTINGS, parsed);
    }
  } catch {
    // Corrupted storage
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable
  }
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as any;
  for (const key of Object.keys(source) as (keyof T)[]) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (
      srcVal &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal, srcVal as any);
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface SettingsStoreState {
  settings: AppSettings;
  setTheme: (_theme: ThemeMode) => void;
  setNotification: (_key: keyof NotificationSettings, _value: boolean) => void;
  setConnection: (_key: keyof ConnectionSettings, _value: any) => void;
  setChat: (_key: keyof ChatSettings, _value: any) => void;
  setData: (_key: keyof DataSettings, _value: any) => void;
  resetSettings: () => void;
  clearAllData: () => void;
  applyTheme: (_theme?: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: loadSettings(),

  setTheme: (theme) => {
    set((state) => {
      const updated = { ...state.settings, theme };
      saveSettings(updated);
      return { settings: updated };
    });
    get().applyTheme(theme);
  },

  setNotification: (key, value) => {
    set((state) => {
      const updated = {
        ...state.settings,
        notifications: { ...state.settings.notifications, [key]: value },
      };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  setConnection: (key, value) => {
    set((state) => {
      const updated = {
        ...state.settings,
        connection: { ...state.settings.connection, [key]: value },
      };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  setChat: (key, value) => {
    set((state) => {
      const updated = {
        ...state.settings,
        chat: { ...state.settings.chat, [key]: value },
      };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  setData: (key, value) => {
    set((state) => {
      const updated = {
        ...state.settings,
        data: { ...state.settings.data, [key]: value },
      };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    saveSettings(DEFAULT_SETTINGS);
    get().applyTheme(DEFAULT_SETTINGS.theme);
  },

  clearAllData: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  },

  applyTheme: (theme) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const t = theme ?? get().settings.theme;
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', t);
    }
  },
}));
