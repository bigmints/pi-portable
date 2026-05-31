import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  
  // Backward compatibility fields matching src/types/projects.ts's Project
  path: string;
  isActive: boolean;
  status: 'active' | 'idle' | 'error';
  lastActive: string;
  envVars?: Record<string, string>;
  ignorePatterns?: string[];
}

export interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  activeProject: Project | null; // Compatibility
  loading: boolean; // Compatibility
  error: string | null; // Compatibility
  
  addProject: (project: Project) => void;
  selectProject: (id: string) => void;
  removeProject: (id: string) => void;
  
  // Compatibility actions
  fetchProjects: () => Promise<void>;
  switchProject: (id: string) => Promise<void>;
}

// Default initial projects for a workspace experience
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'pi-default-proj-1',
    name: 'Pi Workspace',
    description: 'The default project workspace for managing tasks, chat and jobs.',
    createdAt: new Date().toISOString(),
    path: '/Users/pretheesh/Projects/pi-app',
    isActive: true,
    status: 'active',
    lastActive: new Date().toISOString()
  }
];

export const useProjectStore = create<ProjectStore>((set, get) => {
  // Try to load initial state from localStorage if available in browser environment
  let initialProjects = DEFAULT_PROJECTS;
  let initialSelectedId = 'pi-default-proj-1';
  
  if (typeof window !== 'undefined') {
    try {
      const savedProjects = localStorage.getItem('pi-projects');
      const savedSelectedId = localStorage.getItem('pi-selected-project-id');
      if (savedProjects) {
        initialProjects = JSON.parse(savedProjects);
      }
      if (savedSelectedId) {
        initialSelectedId = savedSelectedId;
      } else if (initialProjects.length > 0) {
        initialSelectedId = initialProjects[0].id;
      } else {
        initialSelectedId = '';
      }
    } catch (_e) {
      // Ignore storage errors
    }
  }

  const getActiveProject = (projects: Project[], selectedId: string | null): Project | null => {
    if (!selectedId) return projects[0] || null;
    return projects.find((p) => p.id === selectedId) || projects[0] || null;
  };

  const syncToStorage = (projects: Project[], selectedId: string | null) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pi-projects', JSON.stringify(projects));
        if (selectedId) {
          localStorage.setItem('pi-selected-project-id', selectedId);
        } else {
          localStorage.removeItem('pi-selected-project-id');
        }
      } catch (_e) {
        // Ignore storage errors
      }
    }
  };

  const initialActive = getActiveProject(initialProjects, initialSelectedId);

  return {
    projects: initialProjects,
    selectedProjectId: initialSelectedId,
    activeProject: initialActive,
    loading: false,
    error: null,

    addProject: (project: Project) => {
      // Defer state update using requestAnimationFrame
      requestAnimationFrame(() => {
        set((state) => {
          // Ensure backward compatibility fields are set
          const newProject: Project = {
            ...project,
            path: project.path || `/Users/pretheesh/Projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`,
            isActive: false,
            status: project.status || 'idle',
            lastActive: project.lastActive || new Date().toISOString()
          };
          const updatedProjects = [...state.projects, newProject];
          
          let nextSelectedId = state.selectedProjectId;
          if (!nextSelectedId) {
            nextSelectedId = newProject.id;
          }
          
          const nextActive = getActiveProject(updatedProjects, nextSelectedId);
          
          syncToStorage(updatedProjects, nextSelectedId);
          
          return {
            projects: updatedProjects,
            selectedProjectId: nextSelectedId,
            activeProject: nextActive
          };
        });
      });
    },

    selectProject: (id: string) => {
      // Defer state update using requestAnimationFrame
      requestAnimationFrame(() => {
        set((state) => {
          const updatedProjects = state.projects.map((p) => ({
            ...p,
            isActive: p.id === id,
            lastActive: p.id === id ? new Date().toISOString() : p.lastActive,
            status: p.id === id ? ('active' as const) : p.status
          }));
          
          const nextActive = getActiveProject(updatedProjects, id);
          
          syncToStorage(updatedProjects, id);
          
          return {
            projects: updatedProjects,
            selectedProjectId: id,
            activeProject: nextActive
          };
        });
      });
    },

    removeProject: (id: string) => {
      // Defer state update using requestAnimationFrame
      requestAnimationFrame(() => {
        set((state) => {
          const updatedProjects = state.projects.filter((p) => p.id !== id);
          
          let nextSelectedId = state.selectedProjectId;
          if (nextSelectedId === id) {
            nextSelectedId = updatedProjects.length > 0 ? updatedProjects[0].id : null;
          }
          
          const nextActive = getActiveProject(updatedProjects, nextSelectedId);
          
          syncToStorage(updatedProjects, nextSelectedId);
          
          return {
            projects: updatedProjects,
            selectedProjectId: nextSelectedId,
            activeProject: nextActive
          };
        });
      });
    },

    // Compatibility action mapping
    fetchProjects: async () => {
      set(() => ({ loading: true, error: null }));
      if (typeof window !== 'undefined') {
        try {
          const savedProjects = localStorage.getItem('pi-projects');
          const savedSelectedId = localStorage.getItem('pi-selected-project-id');
          if (savedProjects) {
            const projects = JSON.parse(savedProjects);
            const selectedProjectId = savedSelectedId || (projects[0]?.id || null);
            const activeProject = getActiveProject(projects, selectedProjectId);
            
            set(() => ({
              projects,
              selectedProjectId,
              activeProject,
              loading: false
            }));
            return;
          }
        } catch (_e) {
          // Ignore
        }
      }
      
      set((state) => ({
        projects: state.projects,
        activeProject: getActiveProject(state.projects, state.selectedProjectId),
        loading: false
      }));
    },

    switchProject: async (id: string) => {
      get().selectProject(id);
    }
  };
});
