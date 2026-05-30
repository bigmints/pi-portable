/**
 * File Viewer Store — manages file viewer state (open/close, view mode, file data)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'full' | 'diff';

export interface ViewerFile {
  path: string;
  content: string;
  language: string;
  originalContent?: string;
  size?: number;
  lastModified?: string;
}

export interface FileViewerState {
  isOpen: boolean;
  file: ViewerFile | null;
  viewMode: ViewMode;

  // Actions
  openFile: (file: ViewerFile) => void;
  closeFile: () => void;
  setViewMode: (mode: ViewMode) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  file: null,
  viewMode: 'full' as ViewMode,
};

export const useFileViewerStore = create<FileViewerState>()(
  persist(
    (set) => ({
      ...initialState,

      openFile: (file) =>
        set({
          isOpen: true,
          file,
          viewMode: file.originalContent ? 'diff' : 'full',
        }),
      closeFile: () => set({ isOpen: false, file: null, viewMode: 'full' }),
      setViewMode: (mode) => set({ viewMode: mode }),
      reset: () => set(initialState),
    }),
    {
      name: 'pi-file-viewer',
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    }
  )
);
