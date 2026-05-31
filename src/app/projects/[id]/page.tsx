'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FolderOpen, Loader2, Trash2, Calendar, HardDrive, CheckCircle2 } from 'lucide-react';
import { useProjectStore } from '@/store/projects';
import { useProjectSettingsStore } from '@/store/project-settings';
import DescriptionSection from '@/components/projects/DescriptionSection';
import EnvVarsSection from '@/components/projects/EnvVarsSection';
import { showToast } from '@/components/common/Toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const { projects, loading, error, switchProject, removeProject, fetchProjects } = useProjectStore();
  const { setProject, reset } = useProjectSettingsStore();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
    return () => {
      reset();
    };
  }, [fetchProjects, reset]);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (project) {
      setProject(project);
    }
  }, [project, setProject]);

  if (loading && !project) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
        <span className="text-sm text-muted-foreground">Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
        <FolderOpen size={48} strokeWidth={1.5} className="text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Project not found</h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          The project you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/projects')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </button>
      </div>
    );
  }

  const handleMakeActive = async () => {
    try {
      await switchProject(project.id);
      showToast('Project set as active', 'success');
    } catch (err) {
      showToast('Failed to activate project', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      removeProject(project.id);
      showToast('Project deleted successfully', 'success');
      router.push('/projects');
    } catch (err) {
      showToast('Failed to delete project', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/projects')}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Back to projects"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{project.name}</h1>
              {project.isActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={10} />
                  Active
                </span>
              ) : (
                <button
                  onClick={handleMakeActive}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-600/10 text-violet-400 border border-violet-500/20 hover:bg-violet-600 hover:text-white transition-all"
                >
                  Make Active
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate mt-1" title={project.path}>
              {project.path}
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 rounded-lg border border-rose-500/10 transition-all shrink-0"
          aria-label="Delete project"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          <span className="hidden sm:inline">Delete Project</span>
        </button>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/40">
          <HardDrive className="text-violet-400 shrink-0" size={20} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
            <p className="text-sm font-semibold capitalize text-foreground mt-0.5">{project.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/40">
          <Calendar className="text-violet-400 shrink-0" size={20} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Active</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {new Date(project.lastActive).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form sections */}
      <div className="space-y-6 pt-2">
        <div className="rounded-xl border border-border bg-card/30 p-5 md:p-6 space-y-6">
          <DescriptionSection projectId={project.id} />
          <div className="h-px bg-border w-full" />
          <EnvVarsSection projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
