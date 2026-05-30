import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const results: Array<{ id: string; url: string; filename: string; size: number }> = [];

  for (const [key, value] of formData.entries()) {
    if (key === 'files' || key.startsWith('files')) {
      if (value instanceof File) {
        const id = crypto.randomUUID();
        results.push({
          id,
          url: `/uploads/${id}`,
          filename: value.name,
          size: value.size,
        });
      }
    }
  }

  return NextResponse.json({ files: results });
}
