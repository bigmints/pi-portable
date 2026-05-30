'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { AgenticJob, JobStatus } from '@/store/jobs';
import styles from './JobCard.module.css';

type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

const STATUS_CONFIG: Record<JobStatus, { color: string; icon: React.ReactNode; label: string }> = {
  running: {
    color: '#22c55e',
    icon: <Cpu size={14} strokeWidth={1.5} />,
    label: 'Running',
  },
  completed: {
    color: '#3b82f6',
    icon: <CheckCircle size={14} strokeWidth={1.5} />,
    label: 'Completed',
  },
  failed: {
    color: '#ef4444',
    icon: <XCircle size={14} strokeWidth={1.5} />,
    label: 'Failed',
  },
  cancelled: {
    color: '#6b7280',
    icon: <AlertCircle size={14} strokeWidth={1.5} />,
    label: 'Cancelled',
  },
  paused: {
    color: '#f59e0b',
    icon: <PauseCircle size={14} strokeWidth={1.5} />,
    label: 'Paused',
  },
  queued: {
    color: '#f59e0b',
    icon: <Clock size={14} strokeWidth={1.5} />,
    label: 'Queued',
  },
};

function formatDuration(startedAt: number | undefined, completedAt?: number): string {
  const start = startedAt ?? 0;
  const end = completedAt ?? Date.now();
  const diff = end - start;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatTokens(tokens?: number): string {
  if (!tokens || tokens === 0) return '';
  const formatter = new Intl.NumberFormat('en-US');
  return `${formatter.format(tokens)} tokens`;
}

interface JobCardProps {
  job: AgenticJob;
  isExpanded?: boolean;
  onClick: () => void;
}

export default function JobCard({ job, isExpanded, onClick }: JobCardProps) {
  const router = useRouter();
  const config = STATUS_CONFIG[job.status];

  const duration = useMemo(
    () => formatDuration(job.startedAt, job.completedAt),
    [job.startedAt, job.completedAt, job.status]
  );

  const tokenStr = useMemo(() => formatTokens(job.tokens), [job.tokens]);

  const previewText = job.title || job.id.slice(0, 12);

  const handleClick = () => {
    // Mobile: navigate to detail page
    if (window.innerWidth < 768) {
      router.push(`/jobs/${job.id}`);
    } else {
      // Desktop: toggle expand
      onClick();
    }
  };

  return (
    <div
      className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
      <div className={styles.header}>
        {/* Status indicator */}
        <div
          className={styles.statusIndicator}
          style={{
            color: config.color,
            borderColor: config.color,
            ...(job.status === 'running' ? { animation: 'spin 1s linear infinite' } : {}),
          }}
        >
          {config.icon}
        </div>

        {/* Title */}
        <div className={styles.titleArea}>
          <span className={styles.title}>{previewText}</span>
          {job.project && (
            <span className={styles.projectBadge}>{job.project}</span>
          )}
        </div>

        {/* Status chip */}
        <span
          className={styles.statusChip}
          style={{
            backgroundColor: `${config.color}18`,
            color: config.color,
          }}
        >
          {config.label}
        </span>

        {/* Expand chevron (desktop) */}
        <ArrowRight
          className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
          size={16}
          strokeWidth={1.5}
        />
      </div>

      {/* Meta row */}
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Clock size={12} strokeWidth={1.5} />
          {duration}
        </span>
        {tokenStr && (
          <span className={styles.metaItem}>{tokenStr}</span>
        )}
        <span className={styles.metaItem}>
          {job.steps.length} steps
        </span>
      </div>

      {/* Expanded inline detail (desktop) */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.stepList}>
            {job.steps.map((step) => (
              <StepRow key={step.id} step={step} />
            ))}
          </div>
          {job.error && (
            <div className={styles.errorBlock}>
              <span className={styles.errorTitle}>Error</span>
              <pre className={styles.errorText}>{job.error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepRow({ step }: { step: { id: string; title: string; status: StepStatus; output?: string } }) {
  const stepConfig: Record<StepStatus, { color: string; icon: React.ReactNode }> = {
    pending: { color: 'var(--color-warning)', icon: <Clock size={12} strokeWidth={1.5} /> },
    running: { color: 'var(--color-info)', icon: <Cpu size={12} strokeWidth={1.5} /> },
    completed: { color: 'var(--color-success)', icon: <CheckCircle size={12} strokeWidth={1.5} /> },
    failed: { color: 'var(--color-error)', icon: <XCircle size={12} strokeWidth={1.5} /> },
  };
  const cfg = stepConfig[step.status];

  return (
    <div className={styles.stepRow}>
      <span className={styles.stepIcon} style={{ color: cfg.color }}>
        {cfg.icon}
      </span>
      <span className={styles.stepTitle}>{step.title}</span>
      <span className={styles.stepStatus} style={{ color: cfg.color }}>
        {step.status}
      </span>
    </div>
  );
}
