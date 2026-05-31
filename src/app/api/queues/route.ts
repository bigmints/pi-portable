import { NextRequest, NextResponse } from 'next/server';
import { SavedQueue } from '@/types/queue';

const STORAGE_KEY = 'pi-queue-store';

function getStoredQueues(): SavedQueue[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
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

export async function GET() {
  const queues = getStoredQueues();
  return NextResponse.json({ queues });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, tasks, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newQueue: SavedQueue = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      name,
      description: description || '',
      tasks: tasks || [],
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ queue: newQueue }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
