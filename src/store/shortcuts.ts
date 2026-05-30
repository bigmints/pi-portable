/**
 * Shortcuts store — command palette and shortcuts panel state
 */

import { create } from 'zustand';

export type Platform = 'mac' | 'windows' | 'linux';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'mac';
  if (navigator.userAgent.includes('Mac OS')) return 'mac';
  if (navigator.userAgent.includes('Windows')) return 'windows';
  return 'linux';
}

interface ShortcutsState {
  commandPaletteOpen: boolean;
  shortcutsPanelOpen: boolean;
  platform: Platform;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  openShortcutsPanel: () => void;
  closeShortcutsPanel: () => void;
  toggleShortcutsPanel: () => void;

  getModifierLabel: () => string;
}

export const useShortcutsStore = create<ShortcutsState>((set, get) => ({
  commandPaletteOpen: false,
  shortcutsPanelOpen: false,
  platform: detectPlatform(),

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  openShortcutsPanel: () => set({ shortcutsPanelOpen: true }),
  closeShortcutsPanel: () => set({ shortcutsPanelOpen: false }),
  toggleShortcutsPanel: () =>
    set((state) => ({ shortcutsPanelOpen: !state.shortcutsPanelOpen })),

  getModifierLabel: (): string => {
    const { platform } = get();
    return platform === 'mac' ? '⌘' : 'Ctrl';
  },
}));
