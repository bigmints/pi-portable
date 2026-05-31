'use client';

import { useEffect, useState } from 'react';
import { formatCost, formatTokenCount } from '@/lib/format';

interface ModelPricingData {
  id: string;
  name: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
}

interface CostTooltipProps {
  tokens?: number;
  modelId?: string;
}

const LOCAL_PRICING: Record<string, ModelPricingData> = {
  'gpt-4o': { id: 'gpt-4o', name: 'GPT-4o', inputPricePerMillion: 2.50, outputPricePerMillion: 10.00 },
  'claude-3.5-sonnet': { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
  'gemini-2.0-pro': { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', inputPricePerMillion: 1.25, outputPricePerMillion: 5.00 },
  'llama-3.1-405b': { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', inputPricePerMillion: 2.66, outputPricePerMillion: 2.66 },
};

export default function CostTooltip({ tokens, modelId }: CostTooltipProps) {
  const [pricing, setPricing] = useState<ModelPricingData | null>(null);

  useEffect(() => {
    if (!modelId) return;
    
    // Fetch pricing table from endpoint
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        const found = data.models?.find((m: ModelPricingData) => m.id === modelId);
        if (found) {
          setPricing({
            id: found.id,
            name: found.name,
            inputPricePerMillion: found.inputPricePerMillion,
            outputPricePerMillion: found.outputPricePerMillion,
          });
        }
      })
      .catch((_err) => {
        // Fallback to local pricing
        if (LOCAL_PRICING[modelId]) {
          setPricing(LOCAL_PRICING[modelId]);
        }
      });
  }, [modelId]);

  if (tokens === undefined || tokens <= 0 || !modelId) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  // Use pricing from state or fallback
  const activePricing = pricing || LOCAL_PRICING[modelId] || {
    id: modelId,
    name: modelId,
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 8.00,
  };

  // Estimate a 75% input, 25% output token split
  const inputTokens = Math.round(tokens * 0.75);
  const outputTokens = tokens - inputTokens;

  const inputCost = (inputTokens / 1_000_000) * activePricing.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * activePricing.outputPricePerMillion;
  const totalCost = inputCost + outputCost;

  return (
    <div className="relative group inline-block">
      <span className="cursor-help border-b border-dotted border-muted-foreground/60 hover:text-foreground transition-colors tabular-nums font-medium">
        {formatCost(totalCost)}
      </span>

      {/* Tooltip content */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 hidden group-hover:block z-50 bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-lg text-xs leading-relaxed transition-all">
        <div className="font-semibold text-foreground border-b border-border pb-1.5 mb-2 flex items-center justify-between">
          <span>Cost Breakdown</span>
          <span className="text-muted-foreground font-normal text-[10px]">{activePricing.name}</span>
        </div>
        
        <div className="space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prompt (75%):</span>
            <span className="text-foreground">{formatTokenCount(inputTokens)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-2 border-l border-border/80">
            <span>Price per 1M:</span>
            <span>${activePricing.inputPricePerMillion.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-2 border-l border-border/80">
            <span>Subtotal:</span>
            <span>{formatCost(inputCost)}</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-muted-foreground">Completion (25%):</span>
            <span className="text-foreground">{formatTokenCount(outputTokens)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-2 border-l border-border/80">
            <span>Price per 1M:</span>
            <span>${activePricing.outputPricePerMillion.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-2 border-l border-border/80">
            <span>Subtotal:</span>
            <span>{formatCost(outputCost)}</span>
          </div>

          <div className="border-t border-border pt-1.5 mt-2 flex justify-between font-sans font-semibold text-foreground text-[13px]">
            <span>Total Cost:</span>
            <span>{formatCost(totalCost)}</span>
          </div>
        </div>

        {/* Small arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover z-50" />
      </div>
    </div>
  );
}
