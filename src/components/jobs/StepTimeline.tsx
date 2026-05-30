'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { DetailedJobStep } from '@/store/jobs';
import { useJobsStore } from '@/store/jobs';
import StepItem from './StepItem';
import styles from './StepTimeline.module.css';

interface StepTimelineProps {
  steps: DetailedJobStep[];
  jobId: string;
}

export default function StepTimeline({ steps, jobId }: StepTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousLength = useRef(steps.length);
  const { jobs } = useJobsStore();

  // Use live data from Zustand store for reactive updates
  const job = jobs[jobId];
  const liveSteps = job?.steps ?? steps;

  // Auto-scroll to bottom when new steps arrive
  useEffect(() => {
    if (liveSteps.length > previousLength.current && scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTop = container.scrollHeight;
    }
    previousLength.current = liveSteps.length;
  }, [liveSteps.length]);

  if (liveSteps.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyText}>Waiting for steps...</span>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={scrollRef}>
      <div className={styles.timeline}>
        {liveSteps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            isLast={index === liveSteps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
