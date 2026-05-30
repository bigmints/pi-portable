import { NextResponse } from 'next/server';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
}

const MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', contextWindow: 128000 },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', contextWindow: 200000 },
  { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', provider: 'Google', contextWindow: 1048576 },
  { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', contextWindow: 128000 },
];

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ models: MODELS });
}
