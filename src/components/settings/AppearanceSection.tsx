'use client';

import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import styles from './AppearanceSection.module.css';

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function AppearanceSection() {
  const [theme, setTheme] = useState('system');
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Appearance</h2>
      <div className={styles.grid}>
        {themes.map(t => (
          <button key={t.id} className={styles.card + (theme === t.id ? ' ' + styles.active : '')} onClick={() => setTheme(t.id)}>
            <t.icon size={24} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
