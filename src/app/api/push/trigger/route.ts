import { NextRequest, NextResponse } from 'next/server';
import { triggerPush } from '@/lib/push-notifier';

export async function POST(req: NextRequest) {
  try {
    const { title, body, icon, data } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 });
    }

    const result = await triggerPush({ title, body, icon: icon || '/icon-192.png', data });
    return NextResponse.json({ sent: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
