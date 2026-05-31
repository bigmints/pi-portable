import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const settings = {
    model: 'claude-sonnet',
    fontSize: 14,
    theme: 'system',
    codeTheme: 'github-dark',
    showLineNumbers: true,
    wrapCode: false,
  };
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = {
      model: body.model ?? 'claude-sonnet',
      fontSize: body.fontSize ?? 14,
      theme: body.theme ?? 'system',
      codeTheme: body.codeTheme ?? 'github-dark',
      showLineNumbers: body.showLineNumbers ?? true,
      wrapCode: body.wrapCode ?? false,
    };
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
