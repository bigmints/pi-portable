import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './toast';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface ModelSelectorState {
  models: ModelInfo[];
  selectedModelId: string | null;
  loading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string) => Promise<void>;
}

export const useModelSelectorStore = create<ModelSelectorState>()(
  persist(
    (set, get) => ({
      models: [],
      selectedModelId: null,
      loading: false,
      error: null,

      fetchModels: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/models');
          const data = await res.json();
          const models: ModelInfo[] = data.models ?? [];
          set({
            models,
            loading: false,
            // If no selection yet, pick the first model
            selectedModelId: get().selectedModelId ?? models[0]?.id ?? null,
          });
        } catch {
          set({ error: 'Failed to fetch models', loading: false });
        }
      },

      selectModel: async (modelId: string) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/cli-config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: modelId }),
          });
          const data = await res.json();
          if (data.success) {
            set({ selectedModelId: modelId, loading: false });
            useToastStore.getState().addToast(
              `Model changed to ${get().models.find((m) => m.id === modelId)?.name ?? modelId}`,
              'success',
              3000
            );
          } else {
            set({ error: 'Failed to update model', loading: false });
          }
        } catch {
          set({ error: 'Failed to update model', loading: false });
        }
      },
    }),
    { name: 'pi-model-selector' }
  )
);
