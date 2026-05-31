import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  model: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  codeTheme: string;
  isLoading: boolean;
  setModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: number) => void;
  setCodeTheme: (theme: string) => void;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      model: 'gpt-4',
      theme: 'system',
      fontSize: 14,
      codeTheme: 'github-dark',
      isLoading: false,
      setModel: (model) => set({ model }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCodeTheme: (codeTheme) => set({ codeTheme }),
      saveSettings: async () => {
        set({ isLoading: true });
        try {
          const { model, theme, fontSize, codeTheme } = get();
          const response = await fetch('/api/settings/model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              appearance: { theme, fontSize, codeTheme },
            }),
          });
          if (!response.ok) throw new Error('Failed to save settings');
        } catch (error) {
          console.error('Error saving settings:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'model-appearance-settings',
      partialize: (state) => ({
        model: state.model,
        theme: state.theme,
        fontSize: state.fontSize,
        codeTheme: state.codeTheme,
      }),
    }
  )
);
