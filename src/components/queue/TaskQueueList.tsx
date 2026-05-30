/**
 * Task queue list — renders ordered task cards with HTML5 drag-and-drop reordering
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import TaskCard from './TaskCard';
import { useTaskQueueStore } from '@/store/task-queue';
import type { TaskCard as TaskCardType } from '@/types/taskQueue';
import styles from './TaskQueueList.module.css';

export default function TaskQueueList() {
  const { tasks, reorderTasks, removeTask, updateTaskInstruction, updateTaskStatus } = useTaskQueueStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement | null>>(new Map());

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
    setDropIndex(null);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDropIndex(index);
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        reorderTasks(draggedIndex, targetIndex);
      }
      setDraggedIndex(null);
      setDropIndex(null);
    },
    [draggedIndex, reorderTasks]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropIndex(null);
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      removeTask(id);
    },
    [removeTask]
  );

  const handleUpdateInstruction = useCallback(
    (id: string, instruction: string) => {
      updateTaskInstruction(id, instruction);
    },
    [updateTaskInstruction]
  );

  const handleStatusChange = useCallback(
    (id: string, status: TaskCardType['status']) => {
      updateTaskStatus(id, status);
    },
    [updateTaskStatus]
  );

  const handleFocus = useCallback((id: string) => {
    // Track focused textarea id for external consumers
    textareaRefs.current.set(id, textareaRefs.current.get(id) ?? null);
  }, []);

  return (
    <div className={styles.list} data-testid="task-queue-list">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          index={index}
          total={tasks.length}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onRemove={handleRemove}
          onUpdateInstruction={handleUpdateInstruction}
          onStatusChange={handleStatusChange}
          onFocus={handleFocus}
          draggedIndex={draggedIndex}
          dropIndex={dropIndex}
        />
      ))}
    </div>
  );
}
