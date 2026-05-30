'use client';

import { useState, useRef } from 'react';
import { GripVertical, Trash2, AlertTriangle, X } from 'lucide-react';
import { useQueueEditorStore } from '@/store/queue-editor';
import TaskEditor from './TaskEditor';
import type { TaskCard } from '@/types/taskQueue';
import styles from './TaskList.module.css';

const STATUS_LABELS: Record<TaskCard['status'], string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Done',
  failed: 'Failed',
  skipped: 'Skipped',
};

export default function TaskList() {
  const {
    tasks,
    editingTaskId,
    startEditing,
    removeTask,
    reorderTasks,
  } = useQueueEditorStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (index: number, e: React.DragEvent) => {
    if (editingTaskId) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDropIndex(index);
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderTasks(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
  };

  // Mobile Touch Reordering
  const touchStartY = useRef<number>(0);
  const touchStartIndex = useRef<number>(-1);
  const touchCurrentIndex = useRef<number>(-1);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (editingTaskId) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartIndex.current = index;
    touchCurrentIndex.current = index;
  };

  const handleTouchMove = (index: number, e: React.TouchEvent) => {
    if (touchStartIndex.current === -1) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    // Approximate card height including spacing
    const cardHeight = 85; 
    const offset = Math.round(deltaY / cardHeight);
    let target = touchStartIndex.current + offset;
    target = Math.max(0, Math.min(tasks.length - 1, target));
    
    if (target !== touchCurrentIndex.current) {
      touchCurrentIndex.current = target;
      setDropIndex(target);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartIndex.current !== -1 && touchCurrentIndex.current !== -1) {
      if (touchStartIndex.current !== touchCurrentIndex.current) {
        reorderTasks(touchStartIndex.current, touchCurrentIndex.current);
      }
    }
    touchStartIndex.current = -1;
    touchCurrentIndex.current = -1;
    setDropIndex(null);
  };

  // Delete Action Confirmers
  const triggerDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      removeTask(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const activeDeleteTask = tasks.find((t) => t.id === confirmDeleteId);

  return (
    <div className={styles.container}>
      <div className={styles.list} data-testid="task-queue-list">
        {tasks.map((task, index) => {
          const isEditing = editingTaskId === task.id;
          const isDragged = draggedIndex === index;
          const isDropTarget = dropIndex === index;

          if (isEditing) {
            return (
              <div key={task.id} className={styles.editingWrapper} data-testid={`task-card-${task.id}`}>
                <TaskEditor taskId={task.id} />
              </div>
            );
          }

          return (
            <div
              key={task.id}
              className={`${styles.card} ${isDragged ? styles.dragging : ''} ${isDropTarget ? styles.dropTarget : ''}`}
              draggable={!editingTaskId}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDrop={(e) => handleDrop(index, e)}
              onDragEnd={handleDragEnd}
              data-testid={`task-card-${task.id}`}
            >
              {/* Drag Handle */}
              <div
                className={styles.dragHandle}
                title="Drag to reorder"
                onTouchStart={(e) => handleTouchStart(index, e)}
                onTouchMove={(e) => handleTouchMove(index, e)}
                onTouchEnd={handleTouchEnd}
              >
                <GripVertical size={16} />
              </div>

              {/* Position Badge */}
              <div className={styles.positionBadge} aria-label={`Position ${index + 1}`}>
                {index + 1}
              </div>

              {/* Prompt Text (Click to enter edit mode) */}
              <div
                className={styles.promptContent}
                onClick={() => startEditing(task.id)}
                title="Click to edit task"
                data-testid={`task-prompt-click-${task.id}`}
              >
                {task.instruction || <span className={styles.emptyPrompt}>Empty task prompt. Click to edit...</span>}
              </div>

              {/* Status Chip */}
              <span className={`${styles.statusChip} ${styles['statusChip--' + task.status]}`} title={task.status}>
                {STATUS_LABELS[task.status]}
              </span>

              {/* Trash/Remove Button */}
              <button
                className={styles.removeBtn}
                onClick={(e) => triggerDelete(task.id, e)}
                aria-label="Remove task"
                data-testid={`remove-task-${task.id}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Responsive Confirmation Modal / Bottom Sheet */}
      {confirmDeleteId && activeDeleteTask && (
        <div className={styles.modalOverlay} onClick={cancelDelete} data-testid="delete-confirm-overlay">
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <AlertTriangle className={styles.warnIcon} size={24} />
              <h3>Delete Task</h3>
              <button className={styles.closeBtn} onClick={cancelDelete} aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete this task from the queue?</p>
              <div className={styles.previewPrompt}>
                &ldquo;{activeDeleteTask.instruction || '(Empty prompt)'}&rdquo;
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={`${styles.modalBtn} ${styles.cancelBtn}`} onClick={cancelDelete}>
                Cancel
              </button>
              <button
                className={`${styles.modalBtn} ${styles.deleteBtn}`}
                onClick={confirmDelete}
                data-testid="confirm-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
