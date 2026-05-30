'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Cpu, CheckCircle, XCircle, Clock, AlertCircle, PauseCircle } from 'lucide-react';
import { useJobsStore } from '@/store/jobs';
import type { JobStatus } from '@/store/jobs';
import { triggerHaptic } from '@/lib/haptics';
import styles from './JobsView.module.css';

type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

const STEP_STATUS_ICONS: Record<StepStatus, React.ReactNode> = {
  pending: <Clock size={14} strokeWidth={1.5} />,
  running: <Cpu size={14} strokeWidth={1.5} />,
  completed: <CheckCircle size={14} strokeWidth={1.5} />,
  failed: <XCircle size={14} strokeWidth={1.5} />,
};

const STEP_STATUS_COLORS: Record<StepStatus, string> = {
  pending: 'var(--color-warning)',
  running: 'var(--color-info)',
  completed: 'var(--color-success)',
  failed: 'var(--color-error)',
};

const STATUS_ICONS: Record<JobStatus, React.ReactNode> = {
  queued: <Clock size={14} strokeWidth={1.5} />,
  running: <Cpu size={14} strokeWidth={1.5} />,
  paused: <PauseCircle size={14} strokeWidth={1.5} />,
  completed: <CheckCircle size={14} strokeWidth={1.5} />,
  failed: <XCircle size={14} strokeWidth={1.5} />,
  cancelled: <AlertCircle size={14} strokeWidth={1.5} />,
};

const STATUS_COLORS: Record<JobStatus, string> = {
  queued: 'var(--color-warning)',
  running: 'var(--color-info)',
  paused: 'var(--color-warning)',
  completed: 'var(--color-success)',
  failed: 'var(--color-error)',
  cancelled: 'var(--color-text-tertiary)',
};

export default function JobsView() {
  const { getAllJobs, getJob } = useJobsStore();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const prevStatuses = useRef<Map<string, JobStatus>>(new Map());

  const allJobs = getAllJobs();
  const sortedJobs = useMemo(
    () => [...allJobs].sort((a, b) => (b.startedAt ?? b.createdAt) - (a.startedAt ?? a.createdAt)),
    [allJobs]
  );

  // Trigger haptics when job status changes to completed or failed
  useEffect(() => {
    for (const job of allJobs) {
      const prev = prevStatuses.current.get(job.id);
      if (prev !== job.status) {
        if (job.status === 'completed') {
          triggerHaptic('jobComplete');
        } else if (job.status === 'failed') {
          triggerHaptic('error');
        }
        prevStatuses.current.set(job.id, job.status);
      }
    }
  }, [allJobs]);

  const selectedJob = selectedJobId ? getJob(selectedJobId) : null;

  if (sortedJobs.length === 0) {
    return (
      <div className={styles.empty}>
        <Cpu size={48} strokeWidth={1.5} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>No Jobs</h2>
        <p className={styles.emptySubtitle}>
          Agentic jobs will appear here when triggered through conversations
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {sortedJobs.map((job) => (
          <div
            key={job.id}
            className={`${styles.jobCard} ${selectedJobId === job.id ? styles.selected : ''}`}
            onClick={() => setSelectedJobId(job.id)}
          >
            <div className={styles.jobHeader}>
              <span
                className={styles.statusIcon}
                style={{ color: STATUS_COLORS[job.status] }}
              >
                {STATUS_ICONS[job.status]}
              </span>
              <span className={styles.jobTitle}>{job.id.slice(0, 12)}</span>
              <span
                className={`${styles.statusBadge} ${styles[job.status]}`}
              >
                {job.status}
              </span>
            </div>
            <div className={styles.jobMeta}>
              <span className={styles.jobTime}>
                {new Date(job.startedAt ?? job.createdAt).toLocaleString()}
              </span>
              <span className={styles.stepCount}>{job.steps.length} steps</span>
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h2 className={styles.detailTitle}>Job Details</h2>
            <button
              className={styles.closeDetail}
              onClick={() => setSelectedJobId(null)}
            >
              ✕
            </button>
          </div>
          <div className={styles.detailContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID</span>
              <span className={styles.detailValue}>{selectedJob.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailValue}>{selectedJob.status}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Started</span>
              <span className={styles.detailValue}>
                {new Date(selectedJob.startedAt ?? selectedJob.createdAt).toLocaleString()}
              </span>
            </div>
            {selectedJob.completedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Completed</span>
                <span className={styles.detailValue}>
                  {new Date(selectedJob.completedAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className={styles.stepsSection}>
              <h3 className={styles.stepsTitle}>Steps</h3>
              {selectedJob.steps.map((step: { id: string; title: string; status: StepStatus }) => (
                <div key={step.id} className={styles.detailStep}>
                  <span className={styles.detailStepIcon}>
                    {STEP_STATUS_ICONS[step.status]}
                  </span>
                  <span className={styles.detailStepLabel}>{step.title}</span>
                  <span
                    className={styles.detailStepStatus}
                    style={{ color: STEP_STATUS_COLORS[step.status] }}
                  >
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
