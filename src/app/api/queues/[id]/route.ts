import { NextResponse } from 'next/server';
import { useQueueStore } from '@/store/queue';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const queue = useQueueStore.getState().queues.find((q) => q.id === params.id);
  if (!queue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(queue);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const updates = await request.json();
  useQueueStore.getState().updateQueue(params.id, updates);
  const queue = useQueueStore.getState().queues.find((q) => q.id === params.id);
  return NextResponse.json(queue);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  useQueueStore.getState().deleteQueue(params.id);
  return NextResponse.json({ success: true });
}
