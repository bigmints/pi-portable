'use client';

import { useState } from 'react';
import { Bug } from 'lucide-react';
import styles from './DebugModeToggle.module.css';

export default function DebugModeToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <Bug size={16} className={styles.icon} />
        <span className={styles.label}>Debug Mode</span>
      </div>
      <button
        className={`${styles.toggle} ${enabled ? styles.checked : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}
