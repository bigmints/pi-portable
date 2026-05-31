'use client';

import { useState } from 'react';
import { useQueueStore } from '@/store/queue';
import { Plus, X } from 'lucide-react';

interface QueueFormProps {
  onCancel: () => void;
}

export function QueueForm({ onCancel }: QueueFormProps) {
  const addQueue = useQueueStore((state) => state.addQueue);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addQueue({
      name: name.trim(),
      description: description.trim(),
      tasks: tasks.map((title, i) => ({
        id: `temp-${i}`,
        title,
        description: '',
        status: 'pending',
        priority: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      status: 'pending',
    });
    onCancel();
  };

  const addTask = () => {
    if (taskTitle.trim()) {
      setTasks([...tasks, taskTitle.trim()]);
      setTaskTitle('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Queue name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Optional description"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Tasks</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add a task"
          />
          <button
            type="button"
            onClick={addTask}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {tasks.length > 0 && (
          <ul className="mt-2 space-y-1">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{task}</span>
                <button
                  type="button"
                  onClick={() => removeTask(i)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Create Queue
        </button>
      </div>
    </form>
  );
}
