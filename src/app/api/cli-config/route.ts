import { NextResponse } from 'next/server';

const MOCK_FIELDS = [
  { key: 'model', label: 'Model', type: 'text' as const, value: 'claude-3.5-sonnet', description: 'AI model to use for responses' },
  { key: 'temperature', label: 'Temperature', type: 'number' as const, value: '0.7', description: 'Creativity level (0-1)' },
  { key: 'maxTokens', label: 'Max Tokens', type: 'number' as const, value: '4096', description: 'Maximum response length' },
  { key: 'streaming', label: 'Streaming', type: 'toggle' as const, value: 'true', description: 'Stream responses in real-time' },
  { key: 'systemPrompt', label: 'System Prompt', type: 'text' as const, value: 'You are Pi, an AI assistant.', description: 'Custom system instructions' },
  { key: 'autoSave', label: 'Auto-Save', type: 'toggle' as const, value: 'true', description: 'Automatically save conversations' },
];

export async function GET() {
  return NextResponse.json({ fields: MOCK_FIELDS });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  // Accept model, appearance, or field-level updates
  const merged = { ...body };
  if (body.model) {
    merged.model = body.model;
  }
  if (body.appearance) {
    merged.appearance = body.appearance;
  }
  // Merge field-level updates
  if (Array.isArray(body.fields)) {
    merged.fields = body.fields;
  }
  return NextResponse.json({ success: true, ...merged });
}
