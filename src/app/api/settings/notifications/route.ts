import { NextResponse } from 'next/server';

const settingsMap = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = request.headers.get('cookie')?.includes('pi_session') ? 'user' : 'anon';
    settingsMap.set(session, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
