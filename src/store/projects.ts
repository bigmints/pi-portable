/**
 * Projects store — project list management with caching, CRUD, and LocalStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, AddProjectRequest } from '@/types/projects';

const STALE_TIME_MS = 30 * 1000; // 30 seconds

interface ProjectsState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchProjects: () => Promise<void>;
  switchProject: (id: string) => Promise<void>;
  addProject: (data: AddProjectRequest) => Promise<Project | null>;
  removeProject: (id: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>; // alias for removeProject
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  isStale: () => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProject: null,
      loading: false,
      error: null,
      lastFetch: null,

      isStale: () => {
        const state = get();
        if (!state.lastFetch) return true;
        return Date.now() - state.lastFetch > STALE_TIME_MS;
      },

      setLoading: (loading: boolean) => set(() => ({ loading })),

      setError: (error: string | null) => set(() => ({ error })),

      fetchProjects: async () => {
        const state = get();

        // Skip if not stale and we already have data
        if (!state.isStale() && state.projects.length > 0) {
          return;
        }

        set(() => ({ loading: true, error: null }));

        try {
          const res = await fetch('/api/projects');
          if (!res.ok) {
            throw new Error(`Failed to fetch projects: ${res.status}`);
          }
          const data = await res.json();
          const projects: Project[] = data.projects || [];
          
          // Determine active project.
          // If we already have an active project locally, try to preserve it.
          // Otherwise, find the active project returned by server, or default to the first one.
          const currentActive = get().activeProject;
          let activeProject = projects.find((p: Project) => p.isActive) || null;
          
          if (currentActive && projects.some((p: Project) => p.id === currentActive.id)) {
            activeProject = projects.find((p: Project) => p.id === currentActive.id) || null;
          }

          set(() => ({
            projects,
            activeProject,
            loading: false,
            error: null,
            lastFetch: Date.now(),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          set(() => ({
            loading: false,
            error: message,
          }));
        }
      },

      switchProject: async (id: string) => {
        // Optimistic update
        const state = get();
        const updatedProjects = state.projects.map((p) => ({
          ...p,
          isActive: p.id === id,
          lastActive: p.id === id ? new Date().toISOString() : p.lastActive,
          status: p.id === id ? ('active' as const) : p.status,
        }));
        const newActive = updatedProjects.find((p) => p.id === id) || null;

        set(() => ({
          projects: updatedProjects,
          activeProject: newActive,
        }));

        // Persist to server
        try {
          const res = await fetch('/api/projects/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          if (!res.ok) {
            throw new Error(`Failed to switch project: ${res.status}`);
          }
          const data = await res.json();
          
          const finalProjects: Project[] = data.projects || updatedProjects;
          const finalActive: Project | null = data.activeProject || newActive;

          set(() => ({
            projects: finalProjects,
            activeProject: finalActive,
            lastFetch: Date.now(),
          }));
        } catch (err) {
          // Revert on failure
          set(() => ({
            projects: state.projects,
            activeProject: state.activeProject,
            error: err instanceof Error ? err.message : 'Failed to switch project',
          }));
        }
      },

      addProject: async (data: AddProjectRequest): Promise<Project | null> => {
        set(() => ({ loading: true, error: null }));

        try {
          const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Validation failed' }));
            const message = errorData.error || 'Failed to add project';
            set(() => ({ loading: false, error: message }));
            return null;
          }

          const result = await res.json();
          const project: Project = result.project;

          // Optimistic update
          const currentProjects = get().projects;
          set(() => ({
            projects: [...currentProjects, project],
            loading: false,
            error: null,
            lastFetch: Date.now(),
          }));

          return project;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to add project';
          set(() => ({ loading: false, error: message }));
          return null;
        }
      },

      removeProject: async (id: string): Promise<boolean> => {
        set(() => ({ loading: true, error: null }));

        try {
          const res = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            throw new Error(`Failed to remove project: ${res.status}`);
          }

          const currentProjects = get().projects;
          const updated = currentProjects.filter((p) => p.id !== id);
          const activeProject = get().activeProject;

          set(() => ({
            projects: updated,
            activeProject: activeProject?.id === id ? null : activeProject,
            loading: false,
            error: null,
            lastFetch: Date.now(),
          }));

          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to remove project';
          set(() => ({ loading: false, error: message }));
          return false;
        }
      },

      deleteProject: async (id: string): Promise<boolean> => {
        return get().removeProject(id);
      },

      updateProject: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
        set(() => ({ loading: true, error: null }));

        try {
          const res = await fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!res.ok) {
            throw new Error(`Failed to update project: ${res.status}`);
          }

          const result = await res.json();
          const updatedProject: Project = result.project;

          const currentProjects = get().projects;
          const updatedProjects = currentProjects.map((p) =>
            p.id === id ? { ...p, ...updatedProject } : p
          );

          const activeProject = get().activeProject;

          set(() => ({
            projects: updatedProjects,
            activeProject: activeProject?.id === id ? { ...activeProject, ...updatedProject } : activeProject,
            loading: false,
            error: null,
            lastFetch: Date.now(),
          }));

          return updatedProject;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to update project';
          set(() => ({ loading: false, error: message }));
          return null;
        }
      },
    }),
    {
      name: 'pi-projects-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProject: state.activeProject,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
