'use client';

import { useState } from 'react';
import SavedQueuesList from './SavedQueuesList';
import SaveQueueDialog from './SaveQueueDialog';
import { Save } from 'lucide-react';
import { TaskCard } from '@/types/taskQueue';
import { QueueTask } from '@/types/queue';
import styles from './QueueManagementView.module.css';

interface QueueManagementViewProps {
  tasks: TaskCard[];
  onLoadTasks: (tasks: QueueTask[]) => void;
}

export default function QueueManagementView({ tasks, onLoadTasks }: QueueManagementViewProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Saved Queues</h2>
        <button
          className={styles.saveButton}
          onClick={() => setShowSaveDialog(true)}
          disabled={tasks.length === 0}
        >
          <Save size={16} />
          Save Current Queue
        </button>
      </div>
      <SavedQueuesList onLoad={onLoadTasks} />
      <SaveQueueDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        tasks={tasks}
      />
    </div>
  );
}
