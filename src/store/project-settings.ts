/* eslint-disable no-unused-vars */
/**
 * Project Settings store — manages editing state for a project's settings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectSettings {
  name: string;
  description: string;
  directory: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  isDrawerOpen: boolean;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface ProjectSettingsState extends ProjectSettings {
  // Required Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  resetSettings: () => void;

  // Backward compatibility fields for compilation of unused files
  project: any | null;
  envVars: EnvVar[];
  ignorePatterns: string[];
  unsavedChanges: boolean;
  isDeleting: boolean;
  deleteConfirmValue: string;

  setProject: (project: any | null) => void;
  updateDescription: (value: string) => void;
  addEnvVar: () => void;
  removeEnvVar: (index: number) => void;
  updateEnvVar: (index: number, key: string, value: string) => void;
  addIgnorePattern: (pattern: string) => void;
  removeIgnorePattern: (index: number) => void;
  markUnsaved: () => void;
  clearUnsaved: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
  setDeleteConfirmValue: (value: string) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: ProjectSettings = {
  name: '',
  description: '',
  directory: '',
  model: 'default',
  temperature: 0.7,
  systemPrompt: '',
  isDrawerOpen: false,
};

export const useProjectSettingsStore = create<ProjectSettingsState>()(
  persist(
    (set, get) => ({
      // State
      ...DEFAULT_SETTINGS,

      // Backward compatibility state
      project: null,
      envVars: [],
      ignorePatterns: [],
      unsavedChanges: false,
      isDeleting: false,
      deleteConfirmValue: '',

      // Required Actions
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),

      // Backward compatibility actions
      setProject: (project) => {
        if (!project) {
          set({
            project: null,
            envVars: [],
            ignorePatterns: [],
            unsavedChanges: false,
            isDeleting: false,
            deleteConfirmValue: '',
          });
          return;
        }
        set({
          project,
          description: project.description ?? '',
          envVars: project.envVars
            ? Object.entries(project.envVars).map(([key, value]) => ({ key, value: String(value) }))
            : [],
          ignorePatterns: project.ignorePatterns ?? [],
          unsavedChanges: false,
          isDeleting: false,
          deleteConfirmValue: '',
        });
      },
      updateDescription: (value) => set({ description: value, unsavedChanges: true }),
      addEnvVar: () => set((state) => ({ envVars: [...state.envVars, { key: '', value: '' }], unsavedChanges: true })),
      removeEnvVar: (index) => set((state) => ({ envVars: state.envVars.filter((_, i) => i !== index), unsavedChanges: true })),
      updateEnvVar: (index, key, value) => set((state) => {
        const updated = [...state.envVars];
        updated[index] = { key, value };
        return { envVars: updated, unsavedChanges: true };
      }),
      addIgnorePattern: (pattern) => {
        const trimmed = pattern.trim();
        if (!trimmed || get().ignorePatterns.includes(trimmed)) return;
        set((state) => ({ ignorePatterns: [...state.ignorePatterns, trimmed], unsavedChanges: true }));
      },
      removeIgnorePattern: (index) => set((state) => ({ ignorePatterns: state.ignorePatterns.filter((_, i) => i !== index), unsavedChanges: true })),
      markUnsaved: () => set({ unsavedChanges: true }),
      clearUnsaved: () => set({ unsavedChanges: false }),
      setIsDeleting: (isDeleting) => set({ isDeleting }),
      setDeleteConfirmValue: (value) => set({ deleteConfirmValue: value }),
      reset: () => set({
        project: null,
        description: '',
        envVars: [],
        ignorePatterns: [],
        unsavedChanges: false,
        isDeleting: false,
        deleteConfirmValue: '',
      }),
    }),
    {
      name: 'pi-project-settings',
      partialize: (state) => ({
        name: state.name,
        description: state.description,
        directory: state.directory,
        model: state.model,
        temperature: state.temperature,
        systemPrompt: state.systemPrompt,
        isDrawerOpen: state.isDrawerOpen,
      }),
    }
  )
);
