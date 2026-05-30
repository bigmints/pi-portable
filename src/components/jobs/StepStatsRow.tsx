'use client';

import React from 'react';
import { Cpu, Clock, DollarSign } from 'lucide-react';
import type { DetailedJobStep } from '@/store/jobs';
import { formatDuration, formatTokens, formatCost } from '@/lib/format-stats';
import CostTooltip from './CostTooltip';
import styles from './StepStatsRow.module.css';

interface StepStatsRowProps {
  step: DetailedJobStep;
}

const MOCK_PRICING: Record<string, { inputCostPerToken: number; outputCostPerToken: number }> = {
  'claude-3-opus': { inputCostPerToken: 0.000015, outputCostPerToken: 0.000075 },
  'gpt-4': { inputCostPerToken: 0.00003, outputCostPerToken: 0.00006 },
  'llama-3.1': { inputCostPerToken: 0.000001, outputCostPerToken: 0.000003 },
  'gpt-4o': { inputCostPerToken: 0.000005, outputCostPerToken: 0.000015 },
};

export default function StepStatsRow({ step }: StepStatsRowProps) {
  const modelName = step.model || 'gpt-4o';
  const pricing = MOCK_PRICING[modelName] || MOCK_PRICING['gpt-4o'];

  const promptTokens = step.prompt_tokens ?? 0;
  const completionTokens = step.completion_tokens ?? 0;
  const totalTokens = step.tokens ?? (promptTokens + completionTokens);

  const durationMs = step.durationMs ?? step.duration_ms ?? 0;

  // Calculate cost in cents
  let costCents = step.cost ?? 0;
  if (!step.cost && (promptTokens > 0 || completionTokens > 0)) {
    const costUsd = (promptTokens * pricing.inputCostPerToken) + (completionTokens * pricing.outputCostPerToken);
    costCents = costUsd * 100;
  }

  // If no stats are present, do not render the row
  if (totalTokens === 0 && durationMs === 0 && costCents === 0) {
    return null;
  }

  return (
    <div className={styles.row}>
      {/* Tokens Stat */}
      {totalTokens > 0 && (
        <div className={styles.stat} title="Tokens consumed">
          <Cpu size={14} className={styles.icon} />
          <span className={styles.value}>{formatTokens(totalTokens)}</span>
        </div>
      )}

      {/* Duration Stat */}
      {durationMs > 0 && (
        <div className={styles.stat} title="Duration">
          <Clock size={14} className={styles.icon} />
          <span className={styles.value}>{formatDuration(durationMs)}</span>
        </div>
      )}

      {/* Cost Stat with Tooltip */}
      {costCents > 0 && (
        <CostTooltip
          modelName={modelName}
          promptTokens={promptTokens}
          completionTokens={completionTokens}
          inputRate={pricing.inputCostPerToken}
          outputRate={pricing.outputCostPerToken}
          totalCostCents={costCents}
        >
          <div className={`${styles.stat} ${styles.costStat}`}>
            <DollarSign size={14} className={styles.icon} />
            <span className={styles.value}>{formatCost(costCents)}</span>
          </div>
        </CostTooltip>
      )}
    </div>
  );
}
