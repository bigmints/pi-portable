/**
 * API routes for saved queues — POST to sync, GET to retrieve.
 */

import { NextResponse } from 'next/server';
import { queuesStore } from './store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.queues || !Array.isArray(body.queues)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    for (const q of body.queues) {
      queuesStore.set(q.id, q);
    }
    return NextResponse.json({ ok: true, count: queuesStore.size });
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 400 });
  }
}

export async function GET() {
  const queues = Array.from(queuesStore.values());
  return NextResponse.json({ queues });
}
