'use client';

import { useModelSettingsStore } from '@/store/modelSettings';

export default function AppearanceSettings() {
  const { settings, setFontSize, setShowLineNumbers, setWrapCode } = useModelSettingsStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Appearance</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Font Size</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(Math.max(10, settings.fontSize - 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-sm text-foreground hover:bg-accent"
              aria-label="Decrease font size"
            >
              −
            </button>
            <span className="w-8 text-center text-sm text-foreground">{settings.fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, settings.fontSize + 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-sm text-foreground hover:bg-accent"
              aria-label="Increase font size"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Show Line Numbers</label>
          <button
            role="switch"
            aria-checked={settings.showLineNumbers}
            onClick={() => setShowLineNumbers(!settings.showLineNumbers)}
            className={`inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
              settings.showLineNumbers
                ? 'border-primary bg-primary'
                : 'border-border bg-background'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 translate-x-1 rounded-full bg-background transition-transform ${
                settings.showLineNumbers ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-foreground">Wrap Code Blocks</label>
          <button
            role="switch"
            aria-checked={settings.wrapCode}
            onClick={() => setWrapCode(!settings.wrapCode)}
            className={`inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
              settings.wrapCode
                ? 'border-primary bg-primary'
                : 'border-border bg-background'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 translate-x-1 rounded-full bg-background transition-transform ${
                settings.wrapCode ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
