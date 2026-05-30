import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: "dark" | "light";
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

function resolveTheme(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: ((typeof window !== "undefined" ? (localStorage.getItem("pi-theme") as ThemeMode) : "system") || "system"),
  resolvedTheme: "light",
  setMode: (mode) => {
    set({ mode, resolvedTheme: resolveTheme(mode) });
    if (typeof window !== "undefined") {
      localStorage.setItem("pi-theme", mode);
      document.documentElement.setAttribute("data-theme", resolveTheme(mode));
    }
  },
  cycleMode: () => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const current = useThemeStore.getState().mode;
    const next = order[(order.indexOf(current) + 1) % 3];
    useThemeStore.getState().setMode(next);
  },
}));
