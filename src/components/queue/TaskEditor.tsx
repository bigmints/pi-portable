'use client';

import { useRef, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useQueueEditorStore } from '@/store/queue-editor';
import styles from './TaskEditor.module.css';

interface TaskEditorProps {
  taskId: string;
}

export default function TaskEditor({ taskId }: TaskEditorProps) {
  const {
    draftInstruction,
    updateDraft,
    saveEditing,
    cancelEditing,
    isDirty,
  } = useQueueEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [draftInstruction]);

  // Focus textarea on mount and move cursor to end
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      saveEditing();
    }
  };

  return (
    <div
      className={styles.editorContainer}
      role="dialog"
      aria-label="Edit task prompt"
      data-testid={`task-editor-${taskId}`}
    >
      <div className={styles.header}>
        <span className={styles.title}>
          Editing Task
          {isDirty && <span className={styles.dirtyBadge} title="Unsaved changes">•</span>}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder="Enter a task instruction..."
        value={draftInstruction}
        onChange={(e) => updateDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        data-testid={`task-editor-textarea-${taskId}`}
      />

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.cancel}`}
          onClick={cancelEditing}
          type="button"
          aria-label="Cancel editing"
          data-testid={`cancel-edit-${taskId}`}
        >
          <X size={16} />
          <span>Cancel</span>
        </button>

        <button
          className={`${styles.button} ${styles.save}`}
          onClick={saveEditing}
          type="button"
          aria-label="Save changes"
          data-testid={`save-edit-${taskId}`}
        >
          <Save size={16} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
