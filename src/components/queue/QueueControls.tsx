'use client';

import { useState } from 'react';
import { useQueueStore } from '@/store/queue';
import { Plus, ListTodo } from 'lucide-react';
import { QueueForm } from './QueueForm';

export function QueueControls() {
  const [showForm, setShowForm] = useState(false);
  const queues = useQueueStore((state) => state.queues);

  if (showForm) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-left">
        <h2 className="text-lg font-semibold text-foreground mb-4">New Queue</h2>
        <QueueForm onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {queues.length} saved queue{queues.length !== 1 ? 's' : ''}
        </span>
      </div>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Queue
      </button>
    </div>
  );
}
