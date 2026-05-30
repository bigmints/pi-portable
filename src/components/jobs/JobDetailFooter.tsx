'use client';

import React from 'react';
import { Cpu, Clock, DollarSign, Activity } from 'lucide-react';
import type { AgenticJob } from '@/store/jobs';
import { formatDuration, formatTokens, formatCost } from '@/lib/format-stats';
import styles from './JobDetailFooter.module.css';

interface JobDetailFooterProps {
  job: AgenticJob;
}

const MOCK_PRICING: Record<string, { inputCostPerToken: number; outputCostPerToken: number }> = {
  'claude-3-opus': { inputCostPerToken: 0.000015, outputCostPerToken: 0.000075 },
  'gpt-4': { inputCostPerToken: 0.00003, outputCostPerToken: 0.00006 },
  'llama-3.1': { inputCostPerToken: 0.000001, outputCostPerToken: 0.000003 },
  'gpt-4o': { inputCostPerToken: 0.000005, outputCostPerToken: 0.000015 },
};

export default function JobDetailFooter({ job }: JobDetailFooterProps) {
  const steps = job.steps ?? [];

  // Aggregate totals
  let totalTokens = 0;
  let totalDurationMs = 0;
  let totalCostCents = 0;

  steps.forEach((step) => {
    // 1. Tokens
    const promptTokens = step.prompt_tokens ?? 0;
    const completionTokens = step.completion_tokens ?? 0;
    totalTokens += step.tokens ?? (promptTokens + completionTokens);

    // 2. Duration
    totalDurationMs += step.durationMs ?? step.duration_ms ?? 0;

    // 3. Cost
    const modelName = step.model || 'gpt-4o';
    const pricing = MOCK_PRICING[modelName] || MOCK_PRICING['gpt-4o'];
    let stepCostCents = step.cost ?? 0;
    if (!step.cost && (promptTokens > 0 || completionTokens > 0)) {
      const stepCostUsd = (promptTokens * pricing.inputCostPerToken) + (completionTokens * pricing.outputCostPerToken);
      stepCostCents = stepCostUsd * 100;
    }
    totalCostCents += stepCostCents;
  });

  // Calculate progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const failedSteps = steps.filter((s) => s.status === 'failed').length;
  const activeSteps = steps.filter((s) => s.status === 'running').length;
  
  const progressPercentage = totalSteps > 0 
    ? ((completedSteps + failedSteps) / totalSteps) * 100 
    : 0;

  return (
    <footer className={styles.footer}>
      {/* Progress/Summary Bar */}
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>

      <div className={styles.container}>
        {/* Step Counts / Status */}
        <div className={styles.statusGroup}>
          <Activity size={16} className={styles.activityIcon} />
          <span className={styles.statusText}>
            {completedSteps} / {totalSteps} step{totalSteps === 1 ? '' : 's'} completed
            {activeSteps > 0 && ` (${activeSteps} active)`}
          </span>
        </div>

        {/* Aggregated Stats */}
        <div className={styles.statsGroup}>
          {/* Total Tokens */}
          <div className={styles.stat} title="Total tokens consumed">
            <Cpu size={16} className={styles.icon} />
            <div className={styles.statLabelValue}>
              <span className={styles.label}>Tokens:</span>
              <span className={styles.value}>{formatTokens(totalTokens)}</span>
            </div>
          </div>

          {/* Total Duration */}
          <div className={styles.stat} title="Total running time">
            <Clock size={16} className={styles.icon} />
            <div className={styles.statLabelValue}>
              <span className={styles.label}>Duration:</span>
              <span className={styles.value}>{formatDuration(totalDurationMs)}</span>
            </div>
          </div>

          {/* Total Cost */}
          <div className={`${styles.stat} ${styles.costStat}`} title="Total cost incurred">
            <DollarSign size={16} className={styles.icon} />
            <div className={styles.statLabelValue}>
              <span className={styles.label}>Cost:</span>
              <span className={styles.value}>{formatCost(totalCostCents)}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
