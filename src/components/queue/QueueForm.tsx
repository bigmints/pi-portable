'use client';
import { useState } from 'react';
import { useQueueStore } from '@/store/queue';
import type { SavedQueue } from '@/types/queue';

interface QueueFormProps {
  onCreated?: (queue: SavedQueue) => void;
  onCancel: () => void;
}

export function QueueForm({ onCreated, onCancel }: QueueFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const addQueue = useQueueStore((s) => s.addQueue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const queue: SavedQueue = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || undefined,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addQueue(queue);
    onCreated?.(queue);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="queue-name" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="queue-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Queue"
          className="w-full px-3 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label htmlFor="queue-desc" className="block text-sm font-medium mb-1">Description</label>
        <input
          id="queue-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="w-full px-3 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Create Queue
        </button>
      </div>
    </form>
  );
}
