'use client';

import { FolderOpen } from 'lucide-react';
import { useProjectStore } from '@/store/projects';
import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';
import styles from './ProjectList.module.css';

export default function ProjectList() {
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const switchProject = useProjectStore((state) => state.switchProject);

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={() => fetchProjects()}>
          Retry
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FolderOpen size={48} strokeWidth={1.5} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No projects yet</h3>
        <p className={styles.emptyText}>
          Connect a project through the pi CLI to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSwitch={switchProject}
        />
      ))}
    </div>
  );
}
