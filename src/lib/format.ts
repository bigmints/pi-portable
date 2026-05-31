import type { DetailedJobStep } from '@/store/jobs';
import type { ModelPricing } from '@/types/chat';

/**
 * Format a token count with comma separators.
 */
export function formatTokenCount(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}

/**
 * Export formatTokens(count: number): string — formats token count with commas (e.g., "1,234 tokens")
 */
export function formatTokens(count: number): string {
  return `${formatTokenCount(count)} tokens`;
}

/**
 * Export formatDuration(ms: number): string — formats milliseconds to human readable (e.g., "2.5s", "1m 30s")
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms <= 0) return '0s';
  if (ms < 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (seconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Export formatCost(dollars: number): string — formats cost to currency (e.g., "$0.002")
 */
export function formatCost(dollars: number): string {
  if (dollars === 0) return '$0.00';
  if (dollars < 0.01) {
    // E.g. $0.002
    return `$${dollars.toFixed(3)}`;
  }
  return `$${dollars.toFixed(2)}`;
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
