import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete('pi_session');
  return NextResponse.json({ success: true, message: 'Session cleared' });
}
