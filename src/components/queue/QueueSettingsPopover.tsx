'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useQueueControlStore } from '@/store/queue-control';
import type { OnFailureAction } from '@/types/chat';
import styles from './QueueSettingsPopover.module.css';

export default function QueueSettingsPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { settings, setOnFailure, toggleAutoClear } = useQueueControlStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={styles.popover}>
      <button
        className={styles.gearBtn}
        onClick={() => setOpen(!open)}
        aria-label="Queue settings"
      >
        <Settings size={16} />
      </button>
      {open && (
        <div className={styles.dropdown}>
          <label className={styles.field}>
            On failure
            <select
              value={settings.onFailure}
              onChange={(e) => setOnFailure(e.target.value as OnFailureAction)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="pause">Pause queue</option>
              <option value="skip">Skip and continue</option>
              <option value="abort">Abort all</option>
            </select>
          </label>
          <label className={styles.field}>
            Auto-clear completed
            <input
              type="checkbox"
              checked={settings.autoClearCompleted}
              onChange={toggleAutoClear}
              onClick={(e) => e.stopPropagation()}
            />
          </label>
        </div>
      )}
    </div>
  );
}
