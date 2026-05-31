import { NextResponse } from 'next/server';
import { useQueueStore } from '@/store/queue';

export async function GET() {
  const queues = useQueueStore.getState().queues;
  return NextResponse.json(queues);
}

export async function POST(request: Request) {
  const body = await request.json();
  const queue = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  useQueueStore.getState().addQueue(queue);
  return NextResponse.json(queue, { status: 201 });
}
