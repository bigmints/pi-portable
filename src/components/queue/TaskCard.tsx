/**
 * Single task card with drag handle, position badge, editable instruction, status chip, and remove button
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { GripVertical, X } from 'lucide-react';
import type { TaskCard as TaskCardType } from '@/types/taskQueue';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: TaskCardType;
  index: number;
  total: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  onRemove: (id: string) => void;
  onUpdateInstruction: (id: string, instruction: string) => void;
  onStatusChange: (id: string, status: TaskCardType['status']) => void;
  onFocus?: (id: string) => void;
  draggedIndex: number | null;
  dropIndex: number | null;
}

const STATUS_LABELS: Record<TaskCardType['status'], string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Done',
  failed: 'Failed',
  skipped: 'Skipped',
};

export default function TaskCard({
  task,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onUpdateInstruction,
  onStatusChange,
  onFocus,
  draggedIndex,
  dropIndex,
}: TaskCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const isDragged = draggedIndex === index;
  const isDropTarget = dropIndex === index;

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    // Wait for animation to complete before actually removing
    setTimeout(() => {
      onRemove(task.id);
    }, 300);
  }, [task.id, onRemove]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [task.instruction]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(index);
  };

  return (
    <div
      className={`${styles.card} ${isRemoving ? styles.removing : ''} ${isDragged ? styles.dragging : ''} ${isDropTarget ? styles['drag-over'] : ''}`}
      draggable={!isRemoving}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      data-testid={`task-card-${task.id}`}
    >
      {/* Drag handle */}
      <div className={styles.dragHandle} title="Drag to reorder">
        <GripVertical size={16} />
      </div>

      {/* Position badge */}
      <div className={styles.positionBadge} aria-label={`Position ${index + 1}`}>
        {index + 1}
      </div>

      {/* Editable instruction */}
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder="Enter a task instruction..."
        value={task.instruction}
        onChange={(e) => onUpdateInstruction(task.id, e.target.value)}
        onFocus={() => onFocus?.(task.id)}
        rows={1}
        data-testid={`task-textarea-${task.id}`}
      />

      {/* Status chip */}
      <span className={`${styles.statusChip} ${styles['statusChip--' + task.status]}`} title={task.status}>
        {STATUS_LABELS[task.status]}
      </span>

      {/* Remove button */}
      <button
        className={styles.removeBtn}
        onClick={handleRemove}
        aria-label="Remove task"
        data-testid={`remove-task-${task.id}`}
      >
        <X size={16} />
      </button>
    </div>
  );
}
