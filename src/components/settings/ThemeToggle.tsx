'use client';

import { useModelSettingsStore } from '@/store/modelSettings';

const themes: Array<{ value: 'light' | 'dark' | 'system'; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ThemeToggle() {
  const { settings, setTheme } = useModelSettingsStore();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Theme</label>
      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              settings.theme === t.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-accent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
