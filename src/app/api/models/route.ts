import { NextResponse } from 'next/server';

export interface ModelPricingData {
  id: string;
  name: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  // Also provide old keys for compatibility if needed
  model?: string;
  prompt_price_per_1m?: number;
  completion_price_per_1m?: number;
}

const MODELS: ModelPricingData[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    model: 'gpt-4o',
    prompt_price_per_1m: 2.50,
    completion_price_per_1m: 10.00,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    model: 'claude-3.5-sonnet',
    prompt_price_per_1m: 3.00,
    completion_price_per_1m: 15.00,
  },
  {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    model: 'gemini-2.0-pro',
    prompt_price_per_1m: 1.25,
    completion_price_per_1m: 5.00,
  },
  {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    inputPricePerMillion: 2.66,
    outputPricePerMillion: 2.66,
    model: 'llama-3.1-405b',
    prompt_price_per_1m: 2.66,
    completion_price_per_1m: 2.66,
  },
];

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({ models: MODELS });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
