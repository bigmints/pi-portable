import { NextResponse } from 'next/server';
import { triggerPush } from '@/lib/push-notifier';

export async function POST() {
  try {
    const result = await triggerPush({
      title: 'Pi Test Notification',
      body: 'Push notifications are working!',
      icon: '/icon-192.png',
      data: { type: 'test' },
    });
    return NextResponse.json({ sent: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
