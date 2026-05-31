'use client';

import { Cpu, Clock, DollarSign } from 'lucide-react';
import { formatTokens, formatDuration, formatCost } from '@/lib/format';

interface JobDetailFooterProps {
  steps: Array<{
    tokens?: number;
    duration?: number;
    model?: string;
  }>;
}

const LOCAL_PRICING: Record<string, { inputPricePerMillion: number; outputPricePerMillion: number }> = {
  'gpt-4o': { inputPricePerMillion: 2.50, outputPricePerMillion: 10.00 },
  'claude-3.5-sonnet': { inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
  'gemini-2.0-pro': { inputPricePerMillion: 1.25, outputPricePerMillion: 5.00 },
  'llama-3.1-405b': { inputPricePerMillion: 2.66, outputPricePerMillion: 2.66 },
};

export default function JobDetailFooter({ steps }: JobDetailFooterProps) {
  let totalTokens = 0;
  let totalDuration = 0;
  let totalCost = 0;

  steps.forEach((step) => {
    if (step.tokens) totalTokens += step.tokens;
    if (step.duration) totalDuration += step.duration;

    if (step.tokens) {
      const model = step.model || 'gpt-4o';
      const activePricing = LOCAL_PRICING[model] || LOCAL_PRICING['gpt-4o'];
      const inputTokens = Math.round(step.tokens * 0.75);
      const outputTokens = step.tokens - inputTokens;
      const stepCost = (inputTokens / 1_000_000) * activePricing.inputPricePerMillion +
                       (outputTokens / 1_000_000) * activePricing.outputPricePerMillion;
      totalCost += stepCost;
    }
  });

  return (
    <div className="border border-border bg-card/60 backdrop-blur-sm rounded-xl p-5 mt-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Job Run Aggregates</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tokens */}
        <div className="flex items-center gap-3.5 p-3.5 bg-muted/40 border border-border/40 rounded-lg hover:border-border transition-colors">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-md text-primary shrink-0">
            <Cpu className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Tokens</p>
            <p className="text-base font-bold text-foreground truncate tabular-nums">
              {totalTokens > 0 ? formatTokens(totalTokens).replace(' tokens', '') : '0'}
            </p>
          </div>
        </div>

        {/* Total Duration */}
        <div className="flex items-center gap-3.5 p-3.5 bg-muted/40 border border-border/40 rounded-lg hover:border-border transition-colors">
          <div className="p-2 bg-warning/10 border border-warning/20 rounded-md text-amber-500 shrink-0">
            <Clock className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Duration</p>
            <p className="text-base font-bold text-foreground truncate tabular-nums">
              {totalDuration > 0 ? formatDuration(totalDuration) : '0s'}
            </p>
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="flex items-center gap-3.5 p-3.5 bg-muted/40 border border-border/40 rounded-lg hover:border-border transition-colors">
          <div className="p-2 bg-success/10 border border-success/20 rounded-md text-emerald-500 shrink-0">
            <DollarSign className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Est. Cost (USD)</p>
            <p className="text-base font-bold text-foreground truncate tabular-nums">
              {formatCost(totalCost)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
