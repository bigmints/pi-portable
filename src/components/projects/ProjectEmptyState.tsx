'use client';

import React from 'react';
import { FolderOpen } from 'lucide-react';

interface ProjectEmptyStateProps {
  onAddClick?: () => void;
}

export default function ProjectEmptyState({ onAddClick }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-border bg-card/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/10 text-violet-400 mb-3 animate-pulse">
        <FolderOpen size={22} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">No projects yet</h3>
      <p className="text-xs text-muted-foreground max-w-[240px] leading-normal mb-5">
        Add your first project to start tracking your development workspace.
      </p>
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-sm hover:shadow-violet-600/20 active:scale-95 transition-all"
        >
          Create Project
        </button>
      )}
    </div>
  );
}
