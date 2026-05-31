import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model, appearance } = body;

    // In a real app, this would be saved to a database or config file.
    // For now, we'll just log it and return success.
    console.log('Saving settings:', { model, appearance });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
