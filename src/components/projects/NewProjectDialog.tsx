'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useProjectStore, Project } from '@/store/projects';
import { showToast } from '@/components/common/Toast';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectDialog({ isOpen, onClose }: NewProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const addProject = useProjectStore((s) => s.addProject);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle escape key click backdrop dismiss
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required');
      return;
    }

    try {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: trimmedName,
        description: description.trim() || undefined,
        createdAt: new Date().toISOString(),
        path: `/Users/pretheesh/Projects/${trimmedName.toLowerCase().replace(/\s+/g, '-')}`,
        isActive: false,
        status: 'idle',
        lastActive: new Date().toISOString()
      };

      addProject(newProject);
      showToast('Project created successfully', 'success');
      
      // Reset form
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-background/80 backdrop:backdrop-blur-sm rounded-xl border border-border bg-card/95 text-card-foreground p-0 shadow-xl max-w-md w-[calc(100%-2rem)] outline-none overflow-hidden transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-accent/20">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400">
            <FolderPlus className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Create New Project</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none"
          type="button"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="proj-name" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Project Name <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            id="proj-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Awesome App"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="proj-desc" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Description <span className="text-muted-foreground/60 font-normal">(Optional)</span>
          </label>
          <textarea
            id="proj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this project is about..."
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-border mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-95 rounded-lg shadow-sm hover:shadow-violet-600/20 transition-all"
          >
            Create Project
          </button>
        </div>
      </form>
    </dialog>
  );
}
