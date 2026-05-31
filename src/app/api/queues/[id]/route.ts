import { NextRequest, NextResponse } from 'next/server';
import { SavedQueue } from '@/types/queue';

function getStoredQueues(): SavedQueue[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('pi-queue-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.state?.queues || [];
      }
    } catch {
      // ignore
    }
  }
  return [];
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const queues = getStoredQueues();
  const queue = queues.find((q) => q.id === params.id);

  if (!queue) {
    return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
  }

  return NextResponse.json({ queue });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const queues = getStoredQueues();
    const index = queues.findIndex((q) => q.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    const updated: SavedQueue = {
      ...queues[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ queue: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const queues = getStoredQueues();
  const index = queues.findIndex((q) => q.id === params.id);

  if (index === -1) {
    return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
  }

  const deleted = queues[index];
  return NextResponse.json({ queue: deleted });
}
