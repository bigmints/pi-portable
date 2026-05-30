import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppearanceTheme = 'dark' | 'light' | 'system';
export type AppearanceFontSize = 'small' | 'medium' | 'large';
export type AppearanceDensity = 'compact' | 'comfortable';
export type AppearanceCodeFont = 'jetbrains-mono' | 'fira-code' | 'cascadia-code';

export interface AppearanceSettings {
  theme: AppearanceTheme;
  fontSize: AppearanceFontSize;
  density: AppearanceDensity;
  codeFont: AppearanceCodeFont;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'dark',
  fontSize: 'medium',
  density: 'comfortable',
  codeFont: 'jetbrains-mono',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FONT_SIZE_MAP: Record<AppearanceFontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

const CODE_FONT_MAP: Record<AppearanceCodeFont, string> = {
  'jetbrains-mono': "'JetBrains Mono', monospace",
  'fira-code': "'Fira Code', monospace",
  'cascadia-code': "'Cascadia Code', monospace",
};

function resolveTheme(theme: AppearanceTheme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function applyAppearanceToDom(settings: AppearanceSettings): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;

  // Theme
  html.setAttribute('data-theme', resolveTheme(settings.theme));

  // Font size
  html.style.setProperty('--font-size-base', FONT_SIZE_MAP[settings.fontSize]);

  // Density
  html.style.setProperty(
    '--message-density-padding',
    settings.density === 'compact' ? '0.25rem' : '0.75rem'
  );
  html.style.setProperty(
    '--message-density-gap',
    settings.density === 'compact' ? '0.5rem' : '1rem'
  );

  // Code font
  html.style.setProperty('--code-font-family', CODE_FONT_MAP[settings.codeFont]);
}

// ─── Debounced server sync ──────────────────────────────────────────────────

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function debounceSync(settings: AppearanceSettings): void {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    fetch('/api/cli-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appearance: settings }),
    }).catch(() => {
      // Silent fail — settings are persisted in localStorage
    });
    syncTimer = null;
  }, 500);
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AppearanceStoreState {
  settings: AppearanceSettings;
  setTheme: (theme: AppearanceTheme) => void;
  setFontSize: (fontSize: AppearanceFontSize) => void;
  setDensity: (density: AppearanceDensity) => void;
  setCodeFont: (codeFont: AppearanceCodeFont) => void;
  syncToServer: () => Promise<boolean>;
}

export const useAppearanceStore = create<AppearanceStoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_APPEARANCE,

      setTheme: (theme) => {
        set((state) => {
          const updated = { ...state.settings, theme };
          applyAppearanceToDom(updated);
          debounceSync(updated);
          return { settings: updated };
        });
      },

      setFontSize: (fontSize) => {
        set((state) => {
          const updated = { ...state.settings, fontSize };
          applyAppearanceToDom(updated);
          debounceSync(updated);
          return { settings: updated };
        });
      },

      setDensity: (density) => {
        set((state) => {
          const updated = { ...state.settings, density };
          applyAppearanceToDom(updated);
          debounceSync(updated);
          return { settings: updated };
        });
      },

      setCodeFont: (codeFont) => {
        set((state) => {
          const updated = { ...state.settings, codeFont };
          applyAppearanceToDom(updated);
          debounceSync(updated);
          return { settings: updated };
        });
      },

      syncToServer: async () => {
        try {
          const res = await fetch('/api/cli-config', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appearance: get().settings }),
          });
          const data = await res.json();
          return !!data.success;
        } catch {
          return false;
        }
      },
    }),
    { name: 'pi-appearance' }
  )
);

/**
 * Apply stored appearance on first load (called from AppShell or layout).
 */
export function initAppearance(): void {
  if (typeof document === 'undefined') return;
  const state = useAppearanceStore.getState();
  applyAppearanceToDom(state.settings);
}
