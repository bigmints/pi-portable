/**
 * Queue tabs — mobile tab bar to switch between tasks and output
 */

'use client';

import styles from './QueueTabs.module.css';

type Tab = 'tasks' | 'output';

interface QueueTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function QueueTabs({ active, onChange }: QueueTabsProps) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${active === 'tasks' ? styles.active : ''}`}
        onClick={() => onChange('tasks')}
      >
        Tasks
      </button>
      <button
        className={`${styles.tab} ${active === 'output' ? styles.active : ''}`}
        onClick={() => onChange('output')}
      >
        Output
      </button>
    </div>
  );
}
