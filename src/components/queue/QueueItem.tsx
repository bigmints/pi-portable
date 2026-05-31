'use client';

import { SavedQueue } from '@/types/queue';
import { useQueueStore } from '@/store/queue';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface QueueItemProps {
  queue: SavedQueue;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  running: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

export function QueueItem({ queue }: QueueItemProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteQueue = useQueueStore((state) => state.deleteQueue);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="text-left">
            <h3 className="font-medium text-foreground">{queue.name}</h3>
            {queue.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{queue.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[queue.status] || statusColors.pending}`}>
            {queue.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {queue.tasks.length} tasks
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteQueue(queue.id);
            }}
            className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </button>
      {expanded && queue.tasks.length > 0 && (
        <div className="px-4 pb-4 border-t border-border">
          {queue.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-foreground">{task.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status] || statusColors.pending}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
