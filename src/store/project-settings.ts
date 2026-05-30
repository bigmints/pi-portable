/**
 * Project Settings store — manages editing state for a single project's settings
 */

import { create } from 'zustand';
import type { Project } from '@/types/projects';

export interface EnvVar {
  key: string;
  value: string;
}

export interface ProjectSettingsState {
  // Current project being edited
  project: Project | null;
  // Form fields
  description: string;
  envVars: EnvVar[];
  ignorePatterns: string[];
  // UI state
  unsavedChanges: boolean;
  isDeleting: boolean;
  deleteConfirmValue: string;

  // Actions
  setProject: (project: Project | null) => void;
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

export const useProjectSettingsStore = create<ProjectSettingsState>((set, get) => ({
  project: null,
  description: '',
  envVars: [],
  ignorePatterns: [],
  unsavedChanges: false,
  isDeleting: false,
  deleteConfirmValue: '',

  setProject: (project: Project | null) => {
    if (!project) {
      set(() => ({
        project: null,
        description: '',
        envVars: [],
        ignorePatterns: [],
        unsavedChanges: false,
        isDeleting: false,
        deleteConfirmValue: '',
      }));
      return;
    }
    set(() => ({
      project,
      description: project.description ?? '',
      envVars: project.envVars
        ? Object.entries(project.envVars).map(([key, value]) => ({ key, value }))
        : [],
      ignorePatterns: project.ignorePatterns ?? [],
      unsavedChanges: false,
      isDeleting: false,
      deleteConfirmValue: '',
    }));
  },

  updateDescription: (value: string) => {
    set(() => ({ description: value, unsavedChanges: true }));
  },

  addEnvVar: () => {
    const state = get();
    set(() => ({
      envVars: [...state.envVars, { key: '', value: '' }],
      unsavedChanges: true,
    }));
  },

  removeEnvVar: (index: number) => {
    const state = get();
    set(() => ({
      envVars: state.envVars.filter((_, i) => i !== index),
      unsavedChanges: true,
    }));
  },

  updateEnvVar: (index: number, key: string, value: string) => {
    const state = get();
    const updated = [...state.envVars];
    updated[index] = { key, value };
    set(() => ({ envVars: updated, unsavedChanges: true }));
  },

  addIgnorePattern: (pattern: string) => {
    const state = get();
    const trimmed = pattern.trim();
    if (!trimmed || state.ignorePatterns.includes(trimmed)) {
      return;
    }
    set(() => ({
      ignorePatterns: [...state.ignorePatterns, trimmed],
      unsavedChanges: true,
    }));
  },

  removeIgnorePattern: (index: number) => {
    const state = get();
    set(() => ({
      ignorePatterns: state.ignorePatterns.filter((_, i) => i !== index),
      unsavedChanges: true,
    }));
  },

  markUnsaved: () => {
    set(() => ({ unsavedChanges: true }));
  },

  clearUnsaved: () => {
    set(() => ({ unsavedChanges: false }));
  },

  setIsDeleting: (isDeleting: boolean) => {
    set(() => ({ isDeleting }));
  },

  setDeleteConfirmValue: (value: string) => {
    set(() => ({ deleteConfirmValue: value }));
  },

  reset: () => {
    set(() => ({
      project: null,
      description: '',
      envVars: [],
      ignorePatterns: [],
      unsavedChanges: false,
      isDeleting: false,
      deleteConfirmValue: '',
    }));
  },
}));
