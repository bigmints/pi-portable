/**
 * Project types for the Pi App
 */

export type ProjectStatus = 'active' | 'idle' | 'error';

export interface Project {
  id: string;
  name: string;
  path: string;
  lastActive: string; // ISO date string
  isActive: boolean;
  status: ProjectStatus;
  description?: string;
  envVars?: Record<string, string>;
  ignorePatterns?: string[];
}

export interface SwitchProjectRequest {
  id: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

// ─── Add Project ──────────────────────────────────────────────────────────────

export type ProjectType = 'local' | 'git';

export interface AddProjectRequest {
  type: ProjectType;
  path: string;
  branch?: string;
}

export interface AddProjectResponse {
  project: Project;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AddProjectError {
  error: string;
  validationErrors?: ValidationError[];
}
