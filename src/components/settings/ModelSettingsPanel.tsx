'use client';

import { useEffect } from 'react';
import { useModelSettingsStore } from '@/store/modelSettings';
import ModelSelector from './ModelSelector';
import AppearanceSettings from './AppearanceSettings';
import ThemeToggle from './ThemeToggle';

export default function ModelSettingsPanel() {
  const { loadSettings, settings } = useModelSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Model & Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Configure your AI model and customize the interface appearance.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <ModelSelector />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <ThemeToggle />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <AppearanceSettings />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Current Settings</h3>
        <pre className="overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </div>
  );
}
