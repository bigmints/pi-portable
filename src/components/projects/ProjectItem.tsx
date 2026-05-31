'use client';

import React from 'react';
import { Check, Folder, Calendar } from 'lucide-react';
import type { Project } from '@/store/projects';
import { cn } from '@/lib/utils';

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function ProjectItem({ project, isActive, onSelect }: ProjectItemProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      onClick={() => onSelect(project.id)}
      className={cn(
        'group flex w-full items-start justify-between rounded-xl p-4 text-left text-xs transition-all duration-200 border',
        'hover:bg-accent/40 hover:border-accent focus:outline-none focus:ring-1 focus:ring-violet-500/40 active:scale-[0.99]',
        isActive
          ? 'bg-violet-600/10 border-violet-500/30 text-violet-300 shadow-sm'
          : 'bg-card/40 border-border/60 text-muted-foreground hover:text-foreground'
      )}
      role="option"
      aria-selected={isActive}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
          isActive 
            ? 'bg-violet-600/10 border-violet-500/20 text-violet-400' 
            : 'bg-background border-border group-hover:bg-accent group-hover:border-accent text-muted-foreground group-hover:text-foreground'
        )}>
          <Folder size={16} />
        </div>
        <div className="flex flex-col min-w-0 space-y-1">
          <span className="font-semibold text-foreground text-[14px] leading-tight truncate">
            {project.name}
          </span>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 font-mono">
            <Calendar size={11} className="shrink-0" />
            <span>Created: {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-3">
        {isActive ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white shrink-0 animate-scaleIn">
            <Check size={11} strokeWidth={3} />
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full border border-border group-hover:border-muted-foreground/40 transition-colors shrink-0" />
        )}
      </div>
    </button>
  );
}
