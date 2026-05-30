'use client';

import { Bell } from 'lucide-react';
import styles from './NotificationToggle.module.css';

interface NotificationToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

export default function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <Bell size={16} className={styles.icon} />
        <div>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </div>
      </div>
      <button
        className={`${styles.toggle} ${checked ? styles.checked : ''}`}
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}
