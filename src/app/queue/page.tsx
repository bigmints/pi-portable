/**
 * Task queue page — ordered list of task cards with drag-to-reorder
 * and live output panel for running tasks
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskQueueStore } from '@/store/task-queue';
import { useQueueOutputStore } from '@/store/queue-output';
import TaskQueueList from '@/components/queue/TaskQueueList';
import EmptyState from '@/components/queue/EmptyState';
import LiveOutputPanel from '@/components/queue/LiveOutputPanel';
import QueueTabs from '@/components/queue/QueueTabs';
import QueueControls from '@/components/queue/QueueControls';
import styles from './queue.module.css';

type Tab = 'tasks' | 'output';

export default function QueuePage() {
  const { tasks, addTask } = useTaskQueueStore();
  const { status } = useQueueOutputStore();
  const newTaskRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  // Auto-switch to output tab when a task starts running
  useEffect(() => {
    if (status === 'running') {
      setActiveTab('output');
    }
  }, [status]);

  // After adding a task, focus its textarea
  const prevTaskCount = useRef(tasks.length);

  useEffect(() => {
    if (tasks.length > prevTaskCount.current && tasks.length > 0) {
      const lastTask = tasks[tasks.length - 1];
      if (lastTask && newTaskRef.current) {
        newTaskRef.current.focus();
      }
    }
    prevTaskCount.current = tasks.length;
  }, [tasks]);

  const handleAddTask = useCallback(() => {
    const newId = addTask();
    setTimeout(() => {
      const textarea = document.querySelector(`[data-testid="task-textarea-${newId}"]`) as HTMLTextAreaElement | null;
      textarea?.focus();
    }, 50);
  }, [addTask]);

  const showOutputPanel = status !== 'idle';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>
          Task Queue
          <span className={styles.taskCount}>
            {tasks.length > 0 ? ` · ${tasks.length} task${tasks.length === 1 ? '' : 's'}` : ''}
          </span>
        </h1>
      </div>

      {/* Mobile tabs */}
      <QueueTabs active={activeTab} onChange={setActiveTab} />

      <div className={styles.content}>
        {/* Desktop: side-by-side layout */}
        {/* Mobile: tab-based layout */}
        <div className={styles.layout}>
          <div className={`${styles.editorPane} ${activeTab === 'tasks' ? styles.visible : ''}`}>
            <QueueControls />
            {tasks.length === 0 ? (
              <EmptyState />
            ) : (
              <TaskQueueList />
            )}
          </div>

          {showOutputPanel && (
            <div className={`${styles.outputPane} ${activeTab === 'output' ? styles.visible : ''}`}>
              <LiveOutputPanel />
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.addButton} onClick={handleAddTask} data-testid="add-task-button">
          <Plus size={16} />
          Add task
        </button>
      </div>
    </div>
  );
}
