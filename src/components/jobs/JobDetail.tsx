'use client';

import { useState } from 'react';
import {
  Cpu,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  Clock,
  Play,
  Square,
  ArrowLeft,
} from 'lucide-react';
import type { AgenticJob, JobStatus } from '@/store/jobs';
import { useJobsStore } from '@/store/jobs';
import CancelJobSheet from './CancelJobSheet';
import styles from './JobDetail.module.css';

type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

const STATUS_CONFIG: Record<JobStatus, { color: string; icon: React.ReactNode; label: string }> = {
  running: { color: '#22c55e', icon: <Cpu size={16} strokeWidth={1.5} />, label: 'Running' },
  completed: { color: '#3b82f6', icon: <CheckCircle size={16} strokeWidth={1.5} />, label: 'Completed' },
  failed: { color: '#ef4444', icon: <XCircle size={16} strokeWidth={1.5} />, label: 'Failed' },
  cancelled: { color: '#6b7280', icon: <AlertCircle size={16} strokeWidth={1.5} />, label: 'Cancelled' },
  paused: { color: '#f59e0b', icon: <PauseCircle size={16} strokeWidth={1.5} />, label: 'Paused' },
  queued: { color: '#f59e0b', icon: <Clock size={16} strokeWidth={1.5} />, label: 'Queued' },
};

const STEP_STATUS_CONFIG: Record<StepStatus, { color: string; icon: React.ReactNode }> = {
  pending: { color: 'var(--color-warning)', icon: <Clock size={14} strokeWidth={1.5} /> },
  running: { color: 'var(--color-info)', icon: <Cpu size={14} strokeWidth={1.5} /> },
  completed: { color: 'var(--color-success)', icon: <CheckCircle size={14} strokeWidth={1.5} /> },
  failed: { color: 'var(--color-error)', icon: <XCircle size={14} strokeWidth={1.5} /> },
};

function formatDuration(startedAt?: number, completedAt?: number): string {
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
  if (!tokens || tokens === 0) return 'N/A';
  const formatter = new Intl.NumberFormat('en-US');
  return `${formatter.format(tokens)} tokens`;
}

interface JobDetailProps {
  job: AgenticJob;
  onBack?: () => void;
}

export default function JobDetail({ job, onBack }: JobDetailProps) {
  const { resumeJob, cancelJob } = useJobsStore();
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const config = STATUS_CONFIG[job.status];
  const isRunning = job.status === 'running' || job.status === 'paused';
  const duration = formatDuration(job.startedAt, job.completedAt);

  const handleResume = async () => {
    setResuming(true);
    await resumeJob(job.id);
    setResuming(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    await cancelJob(job.id);
    setCancelling(false);
    setShowCancelSheet(false);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
        )}
        <div className={styles.headerContent}>
          <div className={styles.statusBadge} style={{ color: config.color }}>
            {config.icon}
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{job.title || job.id.slice(0, 12)}</h1>
            <span className={styles.statusLabel}>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Duration</span>
          <span className={styles.infoValue}>{duration}</span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Tokens</span>
          <span className={styles.infoValue}>{formatTokens(job.tokens)}</span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Steps</span>
          <span className={styles.infoValue}>{job.steps.length}</span>
        </div>
        {job.project && (
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Project</span>
            <span className={styles.infoValue}>{job.project}</span>
          </div>
        )}
      </div>

      {/* Steps timeline */}
      <div className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>Steps</h2>
        <div className={styles.timeline}>
          {job.steps.map((step, i) => {
            const stepCfg = STEP_STATUS_CONFIG[step.status];
            return (
              <div key={step.id} className={styles.timelineItem}>
                <div className={styles.timelineDot} style={{ color: stepCfg.color }}>
                  {stepCfg.icon}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <span
                      className={styles.stepStatus}
                      style={{ color: stepCfg.color }}
                    >
                      {step.status}
                    </span>
                  </div>
                  {step.output && (
                    <pre className={styles.stepOutput}>{step.output}</pre>
                  )}
                </div>
                {i < job.steps.length - 1 && (
                  <div className={styles.timelineLine} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error details */}
      {job.error && (
        <div className={styles.errorSection}>
          <h2 className={styles.sectionTitle}>Error</h2>
          <pre className={styles.errorText}>{job.error}</pre>
        </div>
      )}

      {/* Action buttons */}
      {isRunning && (
        <div className={styles.actions}>
          {job.status === 'paused' && (
            <button
              className={`${styles.actionBtn} ${styles.resumeBtn}`}
              onClick={handleResume}
              disabled={resuming}
            >
              <Play size={16} strokeWidth={1.5} />
              {resuming ? 'Resuming...' : 'Resume'}
            </button>
          )}
          <button
            className={`${styles.actionBtn} ${styles.cancelBtn}`}
            onClick={() => setShowCancelSheet(true)}
            disabled={cancelling}
          >
            <Square size={16} strokeWidth={1.5} />
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        </div>
      )}

      {/* Cancel confirmation sheet */}
      <CancelJobSheet
        jobId={job.id}
        isOpen={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
}
