/**
 * Task queue page — ordered list of task cards with drag-to-reorder,
 * inline editing, inline task addition, and live output panel for running tasks.
 */

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { useQueueEditorStore } from '@/store/queue-editor';
import { useQueueOutputStore } from '@/store/queue-output';
import {
  TaskList,
  AddTaskInput,
  EmptyState,
  LiveOutputPanel,
  QueueTabs,
  QueueControls,
  QueueManagementView
} from '@/components/queue';
import type { TaskCard } from '@/types/taskQueue';
import type { QueueTask } from '@/types/queue';
import styles from './queue.module.css';

type Tab = 'tasks' | 'output';

export default function QueuePage() {
  const { tasks, addTask, startEditing } = useQueueEditorStore();
  const { status } = useQueueOutputStore();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  // Auto-switch to output tab when a task starts running
  useEffect(() => {
    if (status === 'running') {
      setActiveTab('output');
    }
  }, [status]);

  const handleAddTask = useCallback(() => {
    const newId = addTask();
    startEditing(newId);

    // Scroll to new editing card
    setTimeout(() => {
      const textarea = document.querySelector(`[data-testid="task-editor-textarea-${newId}"]`) as HTMLTextAreaElement | null;
      textarea?.focus();
      textarea?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, [addTask, startEditing]);

  const handleLoadTasks = useCallback((loadedTasks: QueueTask[]) => {
    const taskCards: TaskCard[] = loadedTasks.map((task) => ({
      id: task.id,
      instruction: task.prompt,
      status: task.status,
      conversationId: task.conversationId,
    }));
    useQueueEditorStore.setState({ tasks: taskCards });
    if (typeof window !== 'undefined') {
      localStorage.setItem('pi-task-queue', JSON.stringify(taskCards));
    }
  }, []);

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
            
            {/* Inline task addition input at the top of the queue list */}
            <AddTaskInput />

            {tasks.length === 0 ? (
              <EmptyState />
            ) : (
              <TaskList />
            )}
            
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
              <QueueManagementView tasks={tasks} onLoadTasks={handleLoadTasks} />
            </div>
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
