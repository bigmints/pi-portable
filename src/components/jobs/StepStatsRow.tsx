'use client';

import { Cpu, Clock, DollarSign } from 'lucide-react';
import type { DetailedJobStep } from '@/store/jobs';
import type { ModelPricing } from '@/types/chat';
import styles from './StepStatsRow.module.css';
import { formatDuration, estimateStepCost, formatTokenCount } from '@/lib/format';

interface StepStatsRowProps {
  step: DetailedJobStep;
  pricingTable: ModelPricing[];
}

export default function StepStatsRow({ step, pricingTable }: StepStatsRowProps) {
  const hasTokens =
    step.prompt_tokens != null || step.completion_tokens != null;
  const hasDuration = step.duration_ms != null && step.duration_ms > 0;
  const hasCost = step.model != null && step.prompt_tokens != null && step.completion_tokens != null;

  if (!hasTokens && !hasDuration) return null;

  const cost = hasCost ? estimateStepCost(step, pricingTable) : null;

  return (
    <div className={styles.row}>
      {hasTokens && (
        <>
          <div className={styles.stat}>
            <Cpu size={12} strokeWidth={1.5} />
            <span>{formatTokenCount(step.prompt_tokens ?? 0)} prompt</span>
          </div>
          <div className={styles.stat}>
            <Cpu size={12} strokeWidth={1.5} />
            <span>{formatTokenCount(step.completion_tokens ?? 0)} completion</span>
          </div>
        </>
      )}

      {hasDuration && (
        <div className={styles.stat}>
          <Clock size={12} strokeWidth={1.5} />
          <span>{formatDuration(step.duration_ms)}</span>
        </div>
      )}

      {cost !== null && (
        <div className={styles.stat}>
          <DollarSign size={12} strokeWidth={1.5} />
          <span>{cost}</span>
        </div>
      )}
    </div>
  );
}
