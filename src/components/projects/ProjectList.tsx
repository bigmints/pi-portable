'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/projects';
import ProjectItem from './ProjectItem';
import NewProjectDialog from './NewProjectDialog';
import { Plus, FolderOpen, Layers } from 'lucide-react';

interface ProjectListProps {
  limitHeight?: boolean;
}

export default function ProjectList({ limitHeight = false }: ProjectListProps) {
  const projects = useProjectStore((s) => s.projects);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const selectProject = useProjectStore((s) => s.selectProject);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelect = (id: string) => {
    selectProject(id);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4.5 w-4.5 text-violet-500" />
          <h2 className="text-sm font-semibold text-foreground">Project Workspaces</h2>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-95 rounded-lg shadow-sm hover:shadow-violet-600/10 transition-all"
        >
          <Plus size={13} strokeWidth={2.5} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border bg-card/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/10 text-violet-400 mb-3 animate-pulse">
            <FolderOpen size={22} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No projects yet</h3>
          <p className="text-xs text-muted-foreground max-w-[240px] leading-normal mb-5">
            Add your first project to start tracking your development workspace.
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-sm hover:shadow-violet-600/20 active:scale-95 transition-all"
          >
            <Plus size={14} />
            Create Project
          </button>
        </div>
      ) : (
        <div className={`flex flex-col w-full ${limitHeight ? 'max-h-[300px]' : ''}`}>
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
            {projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isActive={selectedProjectId === project.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      <NewProjectDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
