'use client';

import { useState } from 'react';
import { FolderOpen, AlertTriangle } from 'lucide-react';
import { useProjectStore } from '@/store/projects';
import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';
import { showToast } from '@/components/common/Toast';
import styles from './ProjectList.module.css';

export default function ProjectList() {
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const switchProject = useProjectStore((state) => state.switchProject);
  const removeProject = useProjectStore((state) => state.removeProject);

  // Deletion confirmation state
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeDeleteProject = projects.find((p) => p.id === projectToDelete);

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const success = await removeProject(projectToDelete);
      if (success) {
        showToast('Project removed successfully', 'success');
      } else {
        showToast('Failed to remove project', 'error');
      }
    } catch {
      showToast('Error removing project', 'error');
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && projects.length === 0) {
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
          Add a project folder or clone a repository to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSwitch={switchProject}
            onDelete={(id) => setProjectToDelete(id)}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && activeDeleteProject && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isDeleting && setProjectToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <AlertTriangle className={styles.modalIcon} size={20} />
              <h4 className={styles.modalTitle}>Delete Project</h4>
            </div>
            <div className={styles.modalBody}>
              Are you sure you want to remove project{' '}
              <span className={styles.projectName}>
                "{activeDeleteProject.name}"
              </span>{' '}
              from the list? This will not delete the local directory or git repository, but will remove it from the pi client.
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDeleteBtn}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
