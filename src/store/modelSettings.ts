import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelSettings {
  model: string;
  fontSize: number;
  theme: 'light' | 'dark' | 'system';
  codeTheme: string;
  showLineNumbers: boolean;
  wrapCode: boolean;
}

interface ModelSettingsState {
  settings: ModelSettings;
  isLoading: boolean;
  availableModels: string[];
  setModel: (model: string) => void;
  setFontSize: (fontSize: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCodeTheme: (codeTheme: string) => void;
  setShowLineNumbers: (showLineNumbers: boolean) => void;
  setWrapCode: (wrapCode: boolean) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const defaultSettings: ModelSettings = {
  model: 'claude-sonnet',
  fontSize: 14,
  theme: 'system',
  codeTheme: 'github-dark',
  showLineNumbers: true,
  wrapCode: false,
};

export const useModelSettingsStore = create<ModelSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      availableModels: ['claude-sonnet', 'claude-opus', 'gpt-4', 'gpt-4o', 'gemini-pro'],

      setModel: (model) => set((s) => ({ settings: { ...s.settings, model } })),
      setFontSize: (fontSize) => set((s) => ({ settings: { ...s.settings, fontSize } })),
      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setCodeTheme: (codeTheme) => set((s) => ({ settings: { ...s.settings, codeTheme } })),
      setShowLineNumbers: (showLineNumbers) => set((s) => ({ settings: { ...s.settings, showLineNumbers } })),
      setWrapCode: (wrapCode) => set((s) => ({ settings: { ...s.settings, wrapCode } })),

      loadSettings: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/model-settings');
          if (res.ok) {
            const data = await res.json();
            set({ settings: data });
          }
        } catch (_e) {
          // Use persisted defaults
        } finally {
          set({ isLoading: false });
        }
      },

      saveSettings: async () => {
        const { settings } = get();
        try {
          await fetch('/api/model-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
          });
        } catch (_e) {
          // Persisted locally via middleware
        }
      },
    }),
    { name: 'model-settings-storage' }
  )
);
