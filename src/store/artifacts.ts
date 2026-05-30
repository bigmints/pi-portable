/**
 * Artifacts store — manages flat artifact inventory across all jobs
 * with sorting, filtering, and display preferences.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useJobsStore } from './jobs';
import type { Artifact } from '@/types/chat';

export type ArtifactAction = 'created' | 'modified' | 'read' | 'deleted';

export type SortField = 'name' | 'action' | 'size' | 'date';
export type SortDirection = 'asc' | 'desc';

export interface ArtifactsState {
  // Data
  artifacts: Artifact[];

  // Sort
  sortBy: SortField;
  sortDirection: SortDirection;

  // Filters
  filterActions: ArtifactAction[];
  filterExtensions: string[];

  // Display
  showJobColumn: boolean;

  // Actions
  syncFromJobs: () => void;
  setSortBy: (field: SortField) => void;
  toggleSortDirection: (field?: SortField) => void;
  setFilterActions: (actions: ArtifactAction[]) => void;
  toggleFilterAction: (action: ArtifactAction) => void;
  setFilterExtensions: (extensions: string[]) => void;
  toggleFilterExtension: (extension: string) => void;
  toggleJobColumn: () => void;

  // Computed
  getFilteredAndSortedArtifacts: () => Artifact[];
  getAvailableExtensions: () => string[];
  getArtifactCount: () => number;
  getFilteredCount: () => number;
}

const defaultPrefs = {
  sortBy: 'date' as SortField,
  sortDirection: 'desc' as SortDirection,
  filterActions: [] as ArtifactAction[],
  filterExtensions: [] as string[],
  showJobColumn: false,
};

/**
 * Extract file extension without the leading dot
 */
function getExtension(path: string): string {
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Format file size in human-readable form
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * Sort artifacts by field and direction
 */
function getSortedArtifacts(
  artifacts: Artifact[],
  sortBy: SortField,
  direction: SortDirection
): Artifact[] {
  const sorted = [...artifacts].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.path.localeCompare(b.path);
        break;
      case 'action':
        comparison = a.action.localeCompare(b.action);
        break;
      case 'size':
        comparison = (a.size ?? 0) - (b.size ?? 0);
        break;
      case 'date': {
        const dateA = a.timestamp ?? 0;
        const dateB = b.timestamp ?? 0;
        comparison = dateA - dateB;
        break;
      }
    }
    return direction === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

/**
 * Filter artifacts by action types and file extensions
 */
function getFilteredArtifacts(
  artifacts: Artifact[],
  filterActions: ArtifactAction[],
  filterExtensions: string[]
): Artifact[] {
  return artifacts.filter((a) => {
    if (filterActions.length > 0 && !filterActions.includes(a.action)) return false;
    const ext = getExtension(a.path);
    if (filterExtensions.length > 0 && !filterExtensions.includes(ext)) return false;
    return true;
  });
}

/**
 * Normalize an artifact from the jobs store format to the artifacts tab format
 */
function normalizeArtifact(artifact: Artifact, jobId?: string): Artifact {
  const extension = getExtension(artifact.path);
  const timestamp = artifact.timestamp ?? Date.now();
  const isoDate = new Date(timestamp).toISOString();
  return {
    ...artifact,
    extension,
    createdAt: isoDate,
    updatedAt: isoDate,
    jobId,
  } as Artifact;
}

export const useArtifactsStore = create<ArtifactsState>()(
  persist(
    (set, get) => ({
      ...defaultPrefs,
      artifacts: [],

      // Sync artifacts from jobs store
      syncFromJobs: () => {
        const jobs = useJobsStore.getState().getAllJobs();
        const artifacts: Artifact[] = [];
        for (const job of jobs) {
          if (job.artifacts) {
            for (const artifact of job.artifacts) {
              artifacts.push(normalizeArtifact(artifact, job.id));
            }
          }
        }
        set({ artifacts });
      },

      // Sort
      setSortBy: (field) => set({ sortBy: field }),
      toggleSortDirection: (field) => {
        if (field) {
          set((s) => ({
            sortBy: field,
            sortDirection: s.sortBy === field && s.sortDirection === 'asc' ? 'desc' : 'asc',
          }));
        } else {
          set((s) => ({ sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' }));
        }
      },

      // Filters
      setFilterActions: (actions) => set({ filterActions: actions }),
      toggleFilterAction: (action) =>
        set((s) => ({
          filterActions: s.filterActions.includes(action)
            ? s.filterActions.filter((a) => a !== action)
            : [...s.filterActions, action],
        })),
      setFilterExtensions: (extensions) => set({ filterExtensions: extensions }),
      toggleFilterExtension: (extension) =>
        set((s) => ({
          filterExtensions: s.filterExtensions.includes(extension)
            ? s.filterExtensions.filter((e) => e !== extension)
            : [...s.filterExtensions, extension],
        })),

      // Display
      toggleJobColumn: () =>
        set((s) => ({ showJobColumn: !s.showJobColumn })),

      // Computed
      getFilteredAndSortedArtifacts: () => {
        const { artifacts, filterActions, filterExtensions, sortBy, sortDirection } = get();
        const filtered = getFilteredArtifacts(artifacts, filterActions, filterExtensions);
        return getSortedArtifacts(filtered, sortBy, sortDirection);
      },

      getAvailableExtensions: () => {
        const { artifacts } = get();
        const exts = new Set<string>();
        for (const a of artifacts) {
          const ext = getExtension(a.path);
          if (ext) exts.add(ext);
        }
        return Array.from(exts).sort();
      },

      getArtifactCount: () => get().artifacts.length,
      getFilteredCount: () => get().getFilteredAndSortedArtifacts().length,
    }),
    {
      name: 'pi-artifacts',
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
        filterActions: state.filterActions,
        filterExtensions: state.filterExtensions,
        showJobColumn: state.showJobColumn,
      }),
    }
  )
);
