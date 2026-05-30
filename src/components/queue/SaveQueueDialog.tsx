'use client';

import { useState } from 'react';
import { useSavedQueuesStore } from '@/store/saved-queues';
import { X, Save } from 'lucide-react';
import { TaskCard } from '@/types/taskQueue';
import { QueueTask } from '@/types/queue';
import styles from './SaveQueueDialog.module.css';

interface SaveQueueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskCard[];
}

export default function SaveQueueDialog({ isOpen, onClose, tasks }: SaveQueueDialogProps) {
  const [name, setName] = useState('');
  const addQueue = useSavedQueuesStore((state) => state.addQueue);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      const queueTasks: QueueTask[] = tasks.map((task) => ({
        id: task.id,
        prompt: task.instruction,
        status: task.status === 'skipped' ? 'pending' : task.status,
        conversationId: task.conversationId,
        createdAt: new Date().toISOString(),
      }));
      addQueue(name.trim(), queueTasks);
      setName('');
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Save Queue</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.body}>
          <label htmlFor="queueName">Queue name</label>
          <input
            id="queueName"
            type="text"
            placeholder="e.g., Daily tasks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <p className={styles.taskCount}>{tasks.length} tasks will be saved</p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
