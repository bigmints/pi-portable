'use client';
import { useQueueStore } from '@/store/queue';
import { QueueItem } from './QueueItem';

export function QueueList() {
  const { queues, activeQueueId, setActiveQueue } = useQueueStore();

  if (queues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-muted-foreground mb-2">No saved queues yet</div>
        <p className="text-sm text-muted-foreground">Create a queue to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queues.map((queue) => (
        <QueueItem
          key={queue.id}
          queue={queue}
          isActive={queue.id === activeQueueId}
          onClick={() => setActiveQueue(queue.id)}
        />
      ))}
    </div>
  );
}
