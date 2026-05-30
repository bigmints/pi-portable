/**
 * Empty state shown when the task queue has no tasks
 */

'use client';

import { ListTodo } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.emptyState} data-testid="empty-state">
      <div className={styles.icon}>
        <ListTodo size={48} strokeWidth={1} />
      </div>
      <p>Add tasks to run autonomously while you step away</p>
    </div>
  );
}
