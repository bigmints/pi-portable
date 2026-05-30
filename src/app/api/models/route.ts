import { NextResponse } from 'next/server';

export async function GET() {
  const models = [
    {
      model: 'claude-3-opus',
      inputCostPerToken: 0.000015,
      outputCostPerToken: 0.000075,
      prompt_price_per_1m: 15.0,
      completion_price_per_1m: 75.0,
    },
    {
      model: 'gpt-4',
      inputCostPerToken: 0.00003,
      outputCostPerToken: 0.00006,
      prompt_price_per_1m: 30.0,
      completion_price_per_1m: 60.0,
    },
    {
      model: 'llama-3.1',
      inputCostPerToken: 0.000001,
      outputCostPerToken: 0.000003,
      prompt_price_per_1m: 1.0,
      completion_price_per_1m: 3.0,
    },
  ];

  return NextResponse.json({ models });
}
