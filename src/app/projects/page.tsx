/**
 * Projects page — displays all projects with active project indicator and adding sheet drawer
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ProjectList, AddProjectSheet } from '@/components/projects';
import { useProjectStore } from '@/store/projects';
import styles from './page.module.css';

export default function ProjectsPage() {
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <button
          type="button"
          onClick={() => setIsAddSheetOpen(true)}
          className={styles.addButton}
          aria-label="Add project"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Project</span>
        </button>
      </div>

      <ProjectList />

      <AddProjectSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
      />
    </div>
  );
}
