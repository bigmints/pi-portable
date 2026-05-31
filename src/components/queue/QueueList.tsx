'use client';

import { useQueueStore } from '@/store/queue';
import { QueueItem } from './QueueItem';

export function QueueList() {
  const queues = useQueueStore((state) => state.queues);

  if (queues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-lg mb-2">No saved queues</div>
        <p className="text-sm text-muted-foreground">
          Create a queue to organize your tasks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queues.map((queue) => (
        <QueueItem key={queue.id} queue={queue} />
      ))}
    </div>
  );
}
