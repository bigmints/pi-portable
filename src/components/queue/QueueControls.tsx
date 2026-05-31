'use client';
import { useState } from 'react';
import { useQueueStore } from '@/store/queue';
import { QueueForm } from './QueueForm';
import type { SavedQueue } from '@/types/queue';

export function QueueControls() {
  const [showForm, setShowForm] = useState(false);
  const { queues } = useQueueStore();

  const handleCreated = (queue: SavedQueue) => {
    useQueueStore.getState().setActiveQueue(queue.id);
  };

  if (showForm) {
    return <QueueForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">{queues.length} queue{queues.length !== 1 ? 's' : ''}</div>
      <button
        onClick={() => setShowForm(true)}
        className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        New Queue
      </button>
    </div>
  );
}
