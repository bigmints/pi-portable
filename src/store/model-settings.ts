import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  temperature: number;
  topP: number;
}

export interface AppearanceSettings {
  fontSize: 'small' | 'medium' | 'large';
  codeTheme: 'github-dark' | 'github-light' | 'monokai' | 'nord';
  lineHeights: 'compact' | 'comfortable' | 'spacious';
}

export interface ModelSettingsState {
  selectedModel: ModelConfig | null;
  appearance: AppearanceSettings;
  models: ModelConfig[];
  setSelectedModel: (model: ModelConfig) => void;
  updateAppearance: (appearance: Partial<AppearanceSettings>) => void;
  setModels: (models: ModelConfig[]) => void;
  resetToDefaults: () => void;
}

const DEFAULT_MODEL: ModelConfig = {
  id: 'claude-3-5-sonnet',
  name: 'Claude Sonnet 3.5',
  provider: 'Anthropic',
  contextWindow: 200000,
  maxTokens: 8192,
  temperature: 0.7,
  topP: 0.95,
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  fontSize: 'medium',
  codeTheme: 'github-dark',
  lineHeights: 'comfortable',
};

const MOCK_MODELS: ModelConfig[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude Sonnet 3.5',
    provider: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    contextWindow: 200000,
    maxTokens: 8192,
    temperature: 1.0,
    topP: 1.0,
  },
  {
    id: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    contextWindow: 128000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
];

export const useModelSettingsStore = create<ModelSettingsState>()(
  persist(
    (set) => ({
      selectedModel: DEFAULT_MODEL,
      appearance: DEFAULT_APPEARANCE,
      models: MOCK_MODELS,
      setSelectedModel: (model) => set({ selectedModel: model }),
      updateAppearance: (newAppearance) =>
        set((state) => ({
          appearance: { ...state.appearance, ...newAppearance },
        })),
      setModels: (models) => set({ models }),
      resetToDefaults: () =>
        set({
          selectedModel: DEFAULT_MODEL,
          appearance: DEFAULT_APPEARANCE,
        }),
    }),
    {
      name: 'pi-model-settings',
    }
  )
);
