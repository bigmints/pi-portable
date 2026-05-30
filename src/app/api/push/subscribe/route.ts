import { NextRequest, NextResponse } from 'next/server';

// In production, store subscriptions in a database
const subscriptions: Map<string, unknown> = new Map();

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    const key = subscription.endpoint;
    subscriptions.set(key, subscription);
    return NextResponse.json({ saved: true, count: subscriptions.size });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
