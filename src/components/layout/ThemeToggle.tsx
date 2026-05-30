'use client';
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore, ThemeMode } from "@/store/theme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { mode, cycleMode } = useThemeStore();
  const icon = mode === "dark" ? <Moon size={18} /> : mode === "light" ? <Sun size={18} /> : <Monitor size={18} />;
  const label: Record<ThemeMode, string> = { dark: "Dark mode", light: "Light mode", system: "System theme" };
  return (
    <button className={styles.btn} onClick={cycleMode} aria-label={label[mode]}>
      {icon}
    </button>
  );
}
