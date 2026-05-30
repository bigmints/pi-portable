/**
 * SaveQueuePopover — inline popover to name and save the current queue.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import type { TaskCard } from '@/types/taskQueue';
import { useSavedQueuesStore } from '@/store/saved-queues';
import styles from './SaveQueuePopover.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  currentTasks: TaskCard[];
}

export default function SaveQueuePopover({ open, onClose, currentTasks }: Props) {
  const [name, setName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const saveQueue = useSavedQueuesStore((s) => s.saveQueue);

  const handleSave = () => {
    if (name.trim()) {
      saveQueue(name.trim(), currentTasks);
      onClose();
    }
  };

  return (
    <div className={styles.popover} ref={ref}>
      <div className={styles.header}>
        <span>Save Queue</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <input
        className={styles.input}
        placeholder="Queue name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        autoFocus
      />
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!name.trim()}
        >
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
}
