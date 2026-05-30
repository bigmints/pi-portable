'use client';

import { useJobsStore } from '@/store/jobs';
import type { JobStatus } from '@/store/jobs';
import styles from './FilterTabs.module.css';

export type FilterType = 'all' | 'running' | 'completed' | 'failed';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];

const STATUS_MAP: Record<FilterType, JobStatus | null> = {
  all: null,
  running: 'running',
  completed: 'completed',
  failed: 'failed',
};

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const jobs = useJobsStore((state) => state.jobs);
  const allJobs = Object.values(jobs);

  const getCount = (filter: FilterType): number => {
    if (filter === 'all') return allJobs.length;
    const status = STATUS_MAP[filter];
    if (!status) return 0;
    return allJobs.filter((j) => j.status === status).length;
  };

  return (
    <div className={styles.filterTabs}>
      {FILTERS.map((filter) => {
        const isActive = filter.key === activeFilter;
        const count = getCount(filter.key);
        return (
          <button
            key={filter.key}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onFilterChange(filter.key)}
          >
            <span className={styles.tabLabel}>{filter.label}</span>
            <span className={styles.count}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
