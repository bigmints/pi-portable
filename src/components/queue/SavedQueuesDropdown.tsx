/**
 * SavedQueuesDropdown — dropdown to browse and load saved queue templates.
 */

'use client';

import { useState } from 'react';
import { Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { TaskCard } from '@/types/taskQueue';
import { useSavedQueuesStore } from '@/store/saved-queues';
import styles from './SavedQueuesDropdown.module.css';

interface Props {
  onLoad: (tasks: TaskCard[]) => void;
  hasUnsavedTasks: boolean;
  onConfirmLoad: (queueId: string) => void;
}

export default function SavedQueuesDropdown({ onLoad, hasUnsavedTasks, onConfirmLoad }: Props) {
  const [open, setOpen] = useState(false);
  const savedQueues = useSavedQueuesStore((s) => s.savedQueues);
  const deleteQueue = useSavedQueuesStore((s) => s.deleteQueue);
  const loadQueue = useSavedQueuesStore((s) => s.loadQueue);

  const handleLoad = (id: string) => {
    const tasks = loadQueue(id);
    if (!tasks) return;
    if (hasUnsavedTasks) {
      onConfirmLoad(id);
    } else {
      onLoad(tasks);
    }
    setOpen(false);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleBtn}
        onClick={() => setOpen(!open)}
        aria-label="Saved queues"
      >
        <Save size={14} />
        <span>Saved</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && savedQueues.length > 0 && (
        <div className={styles.dropdown}>
          {savedQueues.map((q) => (
            <div key={q.id} className={styles.item}>
              <button
                className={styles.loadBtn}
                onClick={() => handleLoad(q.id)}
              >
                <span className={styles.itemName}>{q.name}</span>
                <span className={styles.taskCount}>
                  {q.tasks.length} task{q.tasks.length !== 1 ? 's' : ''}
                </span>
              </button>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQueue(q.id);
                }}
                aria-label={`Delete ${q.name}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && savedQueues.length === 0 && (
        <div className={styles.empty}>No saved queues</div>
      )}
    </div>
  );
}
