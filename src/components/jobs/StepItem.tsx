'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Lightbulb,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { DetailedJobStep } from '@/store/jobs';
import JsonPanel from './JsonPanel';
import StepStatsRow from './StepStatsRow';
import CostTooltip from './CostTooltip';
import styles from './StepItem.module.css';

interface StepItemProps {
  step: DetailedJobStep;
  isLast?: boolean;
}

const STEP_TYPE_ICON: Record<string, React.ReactNode> = {
  plan: <Lightbulb size={16} strokeWidth={1.5} />,
  tool_call: <Wrench size={16} strokeWidth={1.5} />,
  result: <CheckCircle size={16} strokeWidth={1.5} />,
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: 'var(--color-warning)', icon: <Clock size={12} strokeWidth={1.5} /> },
  running: { color: 'var(--color-info)', icon: <Clock size={12} strokeWidth={1.5} /> },
  completed: { color: 'var(--color-success)', icon: <CheckCircle size={12} strokeWidth={1.5} /> },
  failed: { color: 'var(--color-error)', icon: <AlertCircle size={12} strokeWidth={1.5} /> },
};

function formatDurationMs(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

export default function StepItem({ step, isLast }: StepItemProps) {
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRunning = step.status === 'running';
  const hasContent = step.input || step.output || step.reasoning;
  const statusCfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending;
  const typeIcon = STEP_TYPE_ICON[step.stepType] || STEP_TYPE_ICON.plan;

  // Auto-expand running steps
  useEffect(() => {
    if (isRunning) {
      const t = setTimeout(() => setExpanded(true), 0);
      return () => clearTimeout(t);
    }
  }, [isRunning]);

  // Auto-scroll expanded panel when output changes
  const prevOutputLen = useRef(step.output?.length ?? 0);
  useEffect(() => {
    if (expanded && isRunning && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevOutputLen.current = step.output?.length ?? 0;
  }, [step.output, expanded, isRunning]);

  const toggle = () => hasContent && setExpanded((v) => !v);

  return (
    <div className={styles.row}>
      {/* Timeline dot */}
      <div
        className={styles.dot}
        style={{ color: statusCfg.color }}
      >
        {typeIcon}
      </div>

      {/* Step content */}
      <div className={styles.content}>
        {/* Header — clickable */}
        <button
          className={styles.header}
          onClick={toggle}
          disabled={!hasContent}
          aria-expanded={expanded}
        >
          <span className={styles.title}>{step.title}</span>

          <div className={styles.badges}>
            {/* Status dot */}
            <span
              className={`${styles.statusDot} ${isRunning ? styles.statusDotPulse : ''}`}
              style={{ backgroundColor: statusCfg.color }}
            />
            <span className={styles.statusText} style={{ color: statusCfg.color }}>
              {step.status}
            </span>

            {/* Duration badge */}
            {step.duration_ms != null && step.duration_ms > 0 && (
              <span className={styles.durationBadge}>
                {formatDurationMs(step.duration_ms)}
              </span>
            )}

            {/* Cost Badge */}
            {step.model && (step.tokens || step.prompt_tokens) && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium leading-none">
                <CostTooltip
                  tokens={step.tokens ?? ((step.prompt_tokens ?? 0) + (step.completion_tokens ?? 0))}
                  modelId={step.model}
                />
              </span>
            )}

            {/* Shimmer for running steps */}
            {isRunning && (
              <span className={styles.shimmer} />
            )}

            {/* Expand chevron */}
            {hasContent && (
              <span className={styles.chevron}>
                {expanded ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronRight size={14} strokeWidth={1.5} />}
              </span>
            )}
          </div>
        </button>

        <StepStatsRow
          tokens={step.tokens ?? ((step.prompt_tokens ?? 0) + (step.completion_tokens ?? 0) || undefined)}
          duration={step.duration ?? (step.duration_ms ? step.duration_ms : undefined)}
        />

        {/* Expanded panels */}
        {expanded && (
          <div className={styles.expanded} ref={scrollRef}>
            {step.reasoning && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <Lightbulb size={12} strokeWidth={1.5} />
                  <span>Reasoning</span>
                </div>
                <div className={styles.panelBody}>
                  <ReactMarkdown className={styles.markdown}>{step.reasoning}</ReactMarkdown>
                </div>
              </div>
            )}

            {step.input && (
              <JsonPanel title="Input" data={step.input} />
            )}

            {step.output && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <CheckCircle size={12} strokeWidth={1.5} />
                  <span>Output</span>
                </div>
                <div className={styles.panelBody}>
                  <ReactMarkdown className={styles.markdown}>{step.output}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Shimmer placeholder for streaming */}
            {isRunning && !step.output && (
              <div className={styles.streamingPlaceholder}>
                <span className={styles.streamingDot} />
                <span className={styles.streamingDot} />
                <span className={styles.streamingDot} />
                <span className={styles.streamingText}>Streaming...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connector line */}
      {!isLast && <div className={styles.line} />}
    </div>
  );
}
