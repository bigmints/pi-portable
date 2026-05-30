import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History — pi',
  description: 'Conversation history',
};

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your past pi conversations</p>
      </div>
      <p className="text-muted-foreground text-sm">No conversations yet. Start a chat to see history here.</p>
    </div>
  );
}
