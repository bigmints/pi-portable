'use client';

import { Cpu, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import type { FilterType } from './FilterTabs';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  filter: FilterType;
}

const EMPTY_STATES: Record<FilterType, { icon: React.ReactNode; title: string; subtitle: string }> = {
  all: {
    icon: <Cpu size={48} strokeWidth={1.5} />,
    title: 'No jobs yet',
    subtitle: 'Agentic jobs will appear here when triggered through conversations.',
  },
  running: {
    icon: <CheckCircle size={48} strokeWidth={1.5} />,
    title: 'No running jobs',
    subtitle: 'All jobs are idle. Start a new conversation to trigger a job.',
  },
  completed: {
    icon: <Clock size={48} strokeWidth={1.5} />,
    title: 'No completed jobs',
    subtitle: 'Completed jobs will show up here once they finish.',
  },
  failed: {
    icon: <ShieldCheck size={48} strokeWidth={1.5} />,
    title: 'No failed jobs',
    subtitle: 'Great! No jobs have failed yet.',
  },
};

export default function EmptyState({ filter }: EmptyStateProps) {
  const { icon, title, subtitle } = EMPTY_STATES[filter];

  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
