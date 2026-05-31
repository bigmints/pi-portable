'use client';
import type { SavedQueue } from '@/types/queue';

interface QueueItemProps {
  queue: SavedQueue;
  isActive: boolean;
  onClick: () => void;
}

export function QueueItem({ queue, isActive, onClick }: QueueItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary/10 border border-primary/30'
          : 'bg-card hover:bg-accent border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{queue.name}</h3>
          {queue.description && (
            <p className="text-sm text-muted-foreground truncate">{queue.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground">{queue.tasks.length} tasks</span>
          <span className="text-xs text-muted-foreground">
            {new Date(queue.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </button>
  );
}
