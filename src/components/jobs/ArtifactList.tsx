'use client';

import type { Artifact } from '@/types/chat';
import ArtifactRow from './ArtifactRow';
import styles from './ArtifactList.module.css';

interface ArtifactListProps {
  artifacts: Artifact[];
}

export default function ArtifactList({ artifacts }: ArtifactListProps) {
  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Files <span className={styles.count}>({artifacts.length})</span>
        </h2>
      </div>
      <div className={styles.list}>
        {artifacts.map((artifact) => (
          <ArtifactRow key={artifact.path} artifact={artifact} />
        ))}
      </div>
    </div>
  );
}
