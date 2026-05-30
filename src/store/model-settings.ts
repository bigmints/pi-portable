import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface ModelSettingsState extends ModelSettings {
  updateModel: (model: string) => void;
  updateTemperature: (temperature: number) => void;
  updateMaxTokens: (maxTokens: number) => void;
  updateSystemPrompt: (systemPrompt: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: ModelSettings = {
  model: 'default',
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: '',
};

export const useModelSettingsStore = create<ModelSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateModel: (model) => set({ model }),
      updateTemperature: (temperature) => set({ temperature }),
      updateMaxTokens: (maxTokens) => set({ maxTokens }),
      updateSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'pi-model-settings',
    }
  )
);
