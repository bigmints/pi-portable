import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'toggle';
  value: string;
  description: string;
}

interface CliConfigState {
  fields: ConfigField[];
  originalFields: ConfigField[];
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  updateField: (key: string, value: string) => void;
  saveConfig: () => Promise<boolean>;
  resetChanges: () => void;
}

export const useCliConfigStore = create<CliConfigState>()(
  persist(
    (set, get) => ({
      fields: [],
      originalFields: [],
      loading: false,
      error: null,
      fetchConfig: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch('/api/cli-config');
          const data = await res.json();
          set({ fields: data.fields, originalFields: data.fields, loading: false });
        } catch (err) {
          set({ error: 'Failed to fetch config', loading: false });
        }
      },
      updateField: (key, value) => {
        set({ fields: get().fields.map(f => (f.key === key ? { ...f, value } : f)) });
      },
      saveConfig: async () => {
        try {
          const res = await fetch('/api/cli-config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().fields),
          });
          const data = await res.json();
          if (data.success) {
            set({ originalFields: get().fields });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      resetChanges: () => {
        set({ fields: get().originalFields });
      },
    }),
    { name: 'pi-cli-config' }
  )
);
