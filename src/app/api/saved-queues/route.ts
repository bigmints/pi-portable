import { NextRequest, NextResponse } from 'next/server';
import { useSavedQueuesStore } from '@/store/saved-queues';

export async function GET() {
  const queues = useSavedQueuesStore.getState().queues;
  return NextResponse.json({ queues });
}

export async function POST(request: NextRequest) {
  const { name, tasks } = await request.json();
  if (!name || !tasks) {
    return NextResponse.json({ error: 'Name and tasks are required' }, { status: 400 });
  }
  const queue = useSavedQueuesStore.getState().addQueue(name, tasks);
  return NextResponse.json({ queue }, { status: 201 });
}
