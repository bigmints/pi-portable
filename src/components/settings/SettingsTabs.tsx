'use client';

import { useState } from 'react';
import { User, Terminal, Palette, Keyboard, Bell, Settings } from 'lucide-react';
import styles from './SettingsTabs.module.css';

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'cli-config', label: 'CLI Config', icon: Terminal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

export default function SettingsTabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState('account');

  return (
    <div className={styles.container}>
      <div className={styles.tabBar} role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            className={styles.tab + (active === tab.id ? ' ' + styles.active : '')}
            onClick={() => setActive(tab.id)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
