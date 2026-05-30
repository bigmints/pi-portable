'use client';

import { FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Artifact } from '@/types/chat';
import styles from './ArtifactRow.module.css';

const BADGE_CLASS: Record<string, string> = {
  created: styles.badgeCreated,
  modified: styles.badgeModified,
  read: styles.badgeRead,
  deleted: styles.badgeDeleted,
};

function formatSize(bytes?: number): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface ArtifactRowProps {
  artifact: Artifact;
}

export default function ArtifactRow({ artifact }: ArtifactRowProps) {
  const router = useRouter();

  const encodedPath = encodeURIComponent(artifact.path);

  return (
    <div className={styles.row}>
      <FileText size={16} strokeWidth={1.5} className={styles.icon} />
      <span className={styles.path} title={artifact.path}>
        {artifact.path}
      </span>
      <span className={`${styles.badge} ${BADGE_CLASS[artifact.action] ?? ''}`}>
        {artifact.action}
      </span>
      {artifact.size != null && (
        <span className={styles.size}>{formatSize(artifact.size)}</span>
      )}
      <button
        className={styles.linkBtn}
        onClick={() => router.push(`/files/${encodedPath}`)}
        aria-label={`Open ${artifact.path}`}
      >
        <ExternalLink size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
