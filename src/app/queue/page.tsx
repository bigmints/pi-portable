'use client';
import { useQueueStore } from '@/store/queue';
import { QueueList } from '@/components/queue/QueueList';
import { QueueControls } from '@/components/queue/QueueControls';

export default function QueuePage() {
  const { activeQueueId, queues, deleteQueue } = useQueueStore();
  const activeQueue = queues.find((q) => q.id === activeQueueId);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Saved Queues</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your task queues</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <QueueControls />
        <div className="mt-4">
          <QueueList />
        </div>
      </div>

      {activeQueue && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">{activeQueue.name}</h2>
            <button
              onClick={() => deleteQueue(activeQueue.id)}
              className="text-sm text-destructive hover:underline"
            >
              Delete
            </button>
          </div>
          <div className="space-y-2">
            {activeQueue.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks in this queue</p>
            ) : (
              activeQueue.tasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-card border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      task.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      task.status === 'running' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
