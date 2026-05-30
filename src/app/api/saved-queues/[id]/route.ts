import { NextRequest, NextResponse } from 'next/server';
import { useSavedQueuesStore } from '@/store/saved-queues';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  useSavedQueuesStore.getState().deleteQueue(id);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, tasks } = await request.json();
  useSavedQueuesStore.getState().updateQueue(id, name, tasks);
  const queue = useSavedQueuesStore.getState().queues.find((q) => q.id === id);
  return NextResponse.json({ queue });
}
