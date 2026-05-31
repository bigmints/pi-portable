'use client';

import { QueueList } from '@/components/queue/QueueList';
import { QueueControls } from '@/components/queue/QueueControls';

export default function QueuePage() {
  return (
    <div className="flex flex-col min-h-full bg-background text-left">
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-foreground">Saved Queues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and manage your task queues
          </p>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <QueueControls />
        <QueueList />
      </div>
    </div>
  );
}
