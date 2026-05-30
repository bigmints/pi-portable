/**
 * Projects page — displays all projects with active project indicator
 */

'use client';

import { useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import ProjectList from '@/components/projects/ProjectList';
import { useProjectStore } from '@/store/projects';

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
      </div>

      <ProjectList />

      {projects.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen size={48} strokeWidth={1.5} className="text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No projects yet</h2>
          <p className="text-muted-foreground">
            Connect to the pi CLI to see your projects here.
          </p>
        </div>
      )}
    </div>
  );
}
