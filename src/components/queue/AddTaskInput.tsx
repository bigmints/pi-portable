'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useQueueEditorStore } from '@/store/queue-editor';
import styles from './AddTaskInput.module.css';

export default function AddTaskInput() {
  const { addTask } = useQueueEditorStore();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    addTask(value.trim());
    setValue('');

    // Smooth scroll to the newly added task card
    setTimeout(() => {
      const listEl = document.querySelector('[data-testid="task-queue-list"]');
      if (listEl) {
        const cards = listEl.querySelectorAll('[data-testid^="task-card-"]');
        if (cards.length > 0) {
          const lastCard = cards[cards.length - 1];
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit} data-testid="add-task-form">
      <input
        type="text"
        className={styles.input}
        placeholder="Add task prompt..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        data-testid="add-task-input"
      />
      <button
        type="submit"
        className={styles.button}
        disabled={!value.trim()}
        aria-label="Add Task"
        data-testid="add-task-submit"
      >
        <Plus size={20} />
      </button>
    </form>
  );
}
