'use client';

import { useState } from 'react';
import { Bell, Volume2 } from 'lucide-react';
import styles from './NotificationsSection.module.css';

export default function NotificationsSection() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Notifications</h2>
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.label}><Bell size={16} /><span>Push Notifications</span></div>
          <button className={styles.toggle + (pushEnabled ? ' ' + styles.on : '')} onClick={() => setPushEnabled(!pushEnabled)} role="switch" aria-checked={pushEnabled}>
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.row}>
          <div className={styles.label}><Volume2 size={16} /><span>Sound</span></div>
          <button className={styles.toggle + (soundEnabled ? ' ' + styles.on : '')} onClick={() => setSoundEnabled(!soundEnabled)} role="switch" aria-checked={soundEnabled}>
            <span className={styles.toggleKnob} />
          </button>
        </div>
      </div>
    </div>
  );
}
