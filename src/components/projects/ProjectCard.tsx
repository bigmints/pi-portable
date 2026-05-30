'use client';

import { FolderOpen, CheckCircle2, Trash2 } from 'lucide-react';
import type { Project } from '@/types/projects';
import styles from './ProjectCard.module.css';

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function truncatePath(path: string, maxLength: number = 40): string {
  if (path.length <= maxLength) return path;
  return '...' + path.slice(-maxLength + 3);
}

const STATUS_COLORS: Record<Project['status'], string> = {
  active: 'var(--color-success)',
  idle: 'var(--color-text-muted)',
  error: 'var(--color-error)',
};

interface ProjectCardProps {
  project: Project;
  onSwitch?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ProjectCard({ project, onSwitch, onDelete }: ProjectCardProps) {
  const handleClick = () => {
    if (!project.isActive) {
      onSwitch?.(project.id);
    }
  };

  return (
    <div
      className={`${styles.card} ${project.isActive ? styles.active : ''}`}
      onClick={handleClick}
      role={project.isActive ? 'article' : 'button'}
      tabIndex={project.isActive ? undefined : 0}
      aria-label={`Project: ${project.name}${project.isActive ? ' (active)' : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FolderOpen size={20} strokeWidth={1.5} />
        </div>
        <div className={styles.nameWrapper}>
          <span className={styles.name}>{project.name}</span>
          {project.isActive && (
            <span className={styles.activeChip}>
              <CheckCircle2 size={12} strokeWidth={2} />
              Active
            </span>
          )}
        </div>
        <div
          className={styles.statusDot}
          style={{ backgroundColor: STATUS_COLORS[project.status] }}
          aria-label={`Status: ${project.status}`}
        />
      </div>

      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}

      <div className={styles.details}>
        <span className={styles.path} title={project.path}>
          {truncatePath(project.path)}
        </span>
        <span className={styles.time}>{formatRelativeTime(project.lastActive)}</span>
      </div>

      <div className={styles.actions}>
        {!project.isActive && onSwitch && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSwitch(project.id);
            }}
          >
            Activate
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            aria-label={`Delete project ${project.name}`}
          >
            <Trash2 size={13} strokeWidth={1.8} />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* Skeleton variant */
export function ProjectCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.header}>
        <div className={`${styles.iconWrapper} ${styles.skeletonPulse}`} />
        <div className={`${styles.nameSkeleton} ${styles.skeletonPulse}`} />
        <div className={`${styles.statusDot} ${styles.skeletonPulse}`} />
      </div>
      <div className={styles.details}>
        <div className={`${styles.pathSkeleton} ${styles.skeletonPulse}`} />
        <div className={`${styles.timeSkeleton} ${styles.skeletonPulse}`} />
      </div>
    </div>
  );
}
