/**
 * DELETE /api/queues/:id — remove a specific saved queue from server store.
 */

import { NextResponse } from 'next/server';
import { queuesStore } from '../store';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (queuesStore.delete(id)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
