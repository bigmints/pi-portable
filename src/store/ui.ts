/**
 * UI store — sidebar open/close state for desktop and mobile
 */

import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  settingsOpen: boolean;
  setSidebarOpen: (_open: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (_open: boolean) => void;
  toggleMobileSidebar: () => void;
  setSettingsOpen: (_open: boolean) => void;
  toggleSettings: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  settingsOpen: false,
  setSidebarOpen: (open: boolean) => set(() => ({ sidebarOpen: open })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileSidebarOpen: (open: boolean) => set(() => ({ mobileSidebarOpen: open })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setSettingsOpen: (open: boolean) => set(() => ({ settingsOpen: open })),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
}));
