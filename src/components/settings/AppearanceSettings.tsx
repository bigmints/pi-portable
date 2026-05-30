'use client';

import { useState } from 'react';
import { Sun, Moon, Monitor, Type, LayoutGrid, Code } from 'lucide-react';
import { useAppearanceStore, type AppearanceTheme, type AppearanceFontSize, type AppearanceDensity, type AppearanceCodeFont } from '@/store/appearance';
import styles from './AppearanceSettings.module.css';

const THEMES: { id: AppearanceTheme; label: string; icon: typeof Sun }[] = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
];

const FONT_SIZES: { id: AppearanceFontSize; label: string; value: string }[] = [
  { id: 'small', label: 'Small', value: '14px' },
  { id: 'medium', label: 'Medium', value: '16px' },
  { id: 'large', label: 'Large', value: '18px' },
];

const DENSITIES: { id: AppearanceDensity; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
];

const CODE_FONTS: { id: AppearanceCodeFont; label: string }[] = [
  { id: 'jetbrains-mono', label: 'JetBrains Mono' },
  { id: 'fira-code', label: 'Fira Code' },
  { id: 'cascadia-code', label: 'Cascadia Code' },
];

export default function AppearanceSettings() {
  const { settings, setTheme, setFontSize, setDensity, setCodeFont } = useAppearanceStore();

  return (
    <div className={styles.container}>
      {/* Theme */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <PaletteIcon />
          <span>Theme</span>
        </div>
        <div className={styles.segmentedControl}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.segmentButton} ${settings.theme === t.id ? styles.active : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <t.icon size={14} strokeWidth={1.5} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <Type size={16} strokeWidth={1.5} />
          <span>Font Size</span>
        </div>
        <div className={styles.segmentedControl}>
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.id}
              type="button"
              className={`${styles.segmentButton} ${settings.fontSize === fs.id ? styles.active : ''}`}
              onClick={() => setFontSize(fs.id)}
              style={{ fontSize: fs.id === 'small' ? '12px' : fs.id === 'large' ? '16px' : '14px' }}
            >
              <span>{fs.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <LayoutGrid size={16} strokeWidth={1.5} />
          <span>Density</span>
        </div>
        <div className={styles.segmentedControl}>
          {DENSITIES.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`${styles.segmentButton} ${settings.density === d.id ? styles.active : ''}`}
              onClick={() => setDensity(d.id)}
            >
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Font */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <Code size={16} strokeWidth={1.5} />
          <span>Code Font</span>
        </div>
        <select
          className={styles.codeFontSelect}
          value={settings.codeFont}
          onChange={(e) => setCodeFont(e.target.value as AppearanceCodeFont)}
        >
          {CODE_FONTS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="2" fill="currentColor" />
      <circle cx="8" cy="14" r="2" fill="currentColor" />
      <circle cx="16" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}
