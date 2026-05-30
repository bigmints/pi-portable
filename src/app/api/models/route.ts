import { NextResponse } from 'next/server';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  temperature: number;
  topP: number;
}

const MOCK_MODELS: ModelConfig[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude Sonnet 3.5',
    provider: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    contextWindow: 200000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    contextWindow: 128000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    contextWindow: 200000,
    maxTokens: 8192,
    temperature: 1.0,
    topP: 1.0,
  },
  {
    id: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    contextWindow: 128000,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
  },
];

// In-memory store for selected model
const selectionStore = new Map<string, string>();

export async function GET() {
  return NextResponse.json(MOCK_MODELS);
}

export async function POST(request: Request) {
  try {
    const { modelId } = await request.json();
    if (!modelId || typeof modelId !== 'string') {
      return NextResponse.json({ error: 'Invalid modelId' }, { status: 400 });
    }

    const modelExists = MOCK_MODELS.some((m) => m.id === modelId);
    if (!modelExists) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    selectionStore.set('selectedModelId', modelId);
    return NextResponse.json({ success: true, selectedModelId: modelId });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
