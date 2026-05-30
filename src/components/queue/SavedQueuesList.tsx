'use client';

import { useSavedQueuesStore } from '@/store/saved-queues';
import { Trash2, Upload, Clock } from 'lucide-react';
import { QueueTask } from '@/types/queue';
import styles from './SavedQueuesList.module.css';

interface SavedQueuesListProps {
  onLoad: (tasks: QueueTask[]) => void;
}

export default function SavedQueuesList({ onLoad }: SavedQueuesListProps) {
  const { queues, deleteQueue } = useSavedQueuesStore();

  const handleLoad = (queueId: string) => {
    const tasks = useSavedQueuesStore.getState().loadQueue(queueId);
    if (tasks) {
      onLoad(tasks);
    }
  };

  if (queues.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Clock size={24} />
        <p>No saved queues yet</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {queues.map((queue) => (
        <div key={queue.id} className={styles.queueItem}>
          <div className={styles.queueInfo}>
            <span className={styles.queueName}>{queue.name}</span>
            <span className={styles.queueMeta}>
              {queue.tasks.length} tasks • {new Date(queue.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className={styles.queueActions}>
            <button
              className={styles.loadButton}
              onClick={() => handleLoad(queue.id)}
              title="Load queue"
            >
              <Upload size={16} />
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => deleteQueue(queue.id)}
              title="Delete queue"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
