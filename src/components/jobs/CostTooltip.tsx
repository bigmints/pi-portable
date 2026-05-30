'use client';

import React, { useState } from 'react';
import styles from './CostTooltip.module.css';
import { formatCost, formatTokens } from '@/lib/format-stats';

interface CostTooltipProps {
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  inputRate: number;  // Cost per token in USD
  outputRate: number; // Cost per token in USD
  totalCostCents: number;
  children: React.ReactNode;
}

export default function CostTooltip({
  modelName,
  promptTokens,
  completionTokens,
  inputRate,
  outputRate,
  totalCostCents,
  children,
}: CostTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Format per-1M-tokens rate for display
  const inputRatePer1M = inputRate * 1_000_000;
  const outputRatePer1M = outputRate * 1_000_000;

  // Calculate detailed costs in USD
  const promptCostUsd = promptTokens * inputRate;
  const completionCostUsd = completionTokens * outputRate;

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={styles.tooltip} role="tooltip">
          <div className={styles.header}>
            <span className={styles.modelName}>{modelName}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.grid}>
            {/* Input Tokens */}
            <div className={styles.row}>
              <span className={styles.label}>Input Tokens:</span>
              <span className={styles.value}>{formatTokens(promptTokens)}</span>
            </div>
            <div className={styles.subRow}>
              <span className={styles.subLabel}>Rate:</span>
              <span className={styles.subValue}>${inputRatePer1M.toFixed(2)} / 1M tkn</span>
            </div>
            <div className={styles.subRow}>
              <span className={styles.subLabel}>Cost:</span>
              <span className={styles.subValue}>${promptCostUsd.toFixed(4)}</span>
            </div>

            {/* Output Tokens */}
            <div className={styles.row}>
              <span className={styles.label}>Output Tokens:</span>
              <span className={styles.value}>{formatTokens(completionTokens)}</span>
            </div>
            <div className={styles.subRow}>
              <span className={styles.subLabel}>Rate:</span>
              <span className={styles.subValue}>${outputRatePer1M.toFixed(2)} / 1M tkn</span>
            </div>
            <div className={styles.subRow}>
              <span className={styles.subLabel}>Cost:</span>
              <span className={styles.subValue}>${completionCostUsd.toFixed(4)}</span>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.footer}>
            <span className={styles.totalLabel}>Total Cost:</span>
            <span className={styles.totalValue}>{formatCost(totalCostCents)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
