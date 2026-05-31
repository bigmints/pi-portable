'use client';

import { useModelSettingsStore } from '@/store/modelSettings';

export default function ModelSelector() {
  const { settings, setModel, availableModels } = useModelSettingsStore();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Model</label>
      <select
        value={settings.model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {availableModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Select the AI model for chat responses. Changes apply to new conversations.
      </p>
    </div>
  );
}
