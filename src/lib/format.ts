import type { DetailedJobStep } from '@/store/jobs';
import type { ModelPricing } from '@/types/chat';

/**
 * Format milliseconds into a human-readable duration string.
 * < 1000ms → "Xms"
 * < 60000ms → "X.Xs"
 * >= 60000ms → "Xm Ys"
 */
export function formatDuration(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
}

/**
 * Calculate the estimated cost for a step given its token counts and model.
 * Returns cost in dollars (e.g. "0.05") or null if model pricing is unavailable.
 */
export function estimateStepCost(
  step: DetailedJobStep,
  pricingTable: ModelPricing[]
): string | null {
  const { prompt_tokens, completion_tokens, model } = step;
  if (prompt_tokens == null || completion_tokens == null || !model) {
    return null;
  }

  const entry = pricingTable.find((p) => p.model === model);
  if (!entry) return null;

  const promptCost = (prompt_tokens / 1_000_000) * entry.prompt_price_per_1m;
  const completionCost = (completion_tokens / 1_000_000) * entry.completion_price_per_1m;
  const total = promptCost + completionCost;

  // Format with enough decimal places to show meaningful values
  if (total < 0.01) {
    return `$${total.toFixed(4)}`;
  }
  return `$${total.toFixed(2)}`;
}

/**
 * Compute cumulative totals across all steps of a job.
 */
export function computeJobTotals(
  steps: DetailedJobStep[],
  pricingTable: ModelPricing[]
): {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalDurationMs: number;
  estimatedCost: string | null;
  hasPricing: boolean;
} {
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalDurationMs = 0;
  let totalCost = 0;
  let hasPricing = false;

  for (const step of steps) {
    if (step.prompt_tokens != null) totalPromptTokens += step.prompt_tokens;
    if (step.completion_tokens != null) totalCompletionTokens += step.completion_tokens;
    if (step.duration_ms != null && step.duration_ms > 0) {
      totalDurationMs += step.duration_ms;
    }

    const cost = estimateStepCost(step, pricingTable);
    if (cost !== null) {
      hasPricing = true;
      totalCost += parseFloat(cost.replace('$', ''));
    }
  }

  const estimatedCost = hasPricing
    ? totalCost < 0.01
      ? `$${totalCost.toFixed(4)}`
      : `$${totalCost.toFixed(2)}`
    : null;

  return {
    totalPromptTokens,
    totalCompletionTokens,
    totalDurationMs,
    estimatedCost,
    hasPricing,
  };
}

/**
 * Format a token count with comma separators.
 */
export function formatTokenCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}
