/**
 * Jobs store — agentic job tracking
 */

import { create } from 'zustand';
import { wsClient } from '@/lib/ws-client';
import type { Artifact } from '@/types/chat';

export type JobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export type StepType = 'plan' | 'tool_call' | 'result';

export interface DetailedJobStep {
  id: string;
  title: string;
  stepType: StepType;
  status: StepStatus;
  input?: Record<string, unknown>;
  output?: string;
  duration_ms?: number | null;
  started_at?: number;
  completed_at?: number;
  /** Plan step reasoning text (Markdown) */
  reasoning?: string;
  /** Result step summary text (Markdown) */
  summary?: string;
  /** Prompt tokens consumed by this step */
  prompt_tokens?: number;
  /** Completion tokens consumed by this step */
  completion_tokens?: number;
  /** Model used for this step (e.g. 'gpt-4o') */
  model?: string;
  tokens?: number;
  durationMs?: number;
  cost?: number;
}

export interface AgenticJob {
  id: string;
  title: string;
  status: JobStatus;
  steps: DetailedJobStep[];
  artifacts?: Artifact[];
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  project?: string;
  tokens?: number;
  error?: string;
}

interface JobsState {
  jobs: Record<string, AgenticJob>;

  // Job CRUD
  addJob: (job: AgenticJob) => void;
  updateJob: (jobId: string, updates: Partial<AgenticJob>) => void;

  // Step operations
  addStep: (jobId: string, step: DetailedJobStep) => void;
  updateStep: (jobId: string, stepId: string, updates: Partial<DetailedJobStep>) => void;
  setStepRunning: (jobId: string, stepId: string) => void;
  setStepCompleted: (jobId: string, stepId: string, output: string, duration_ms: number) => void;
  setStepFailed: (jobId: string, stepId: string, output: string) => void;

  // Artifact operations
  addArtifact: (jobId: string, artifact: Artifact) => void;

  // WebSocket event handler
  handleJobEvent: (jobId: string, event: string, data: Record<string, unknown>) => void;

  // Queries
  hasActiveJobs: () => boolean;
  getAllJobs: () => AgenticJob[];
  getJob: (jobId: string) => AgenticJob | undefined;

  // Job actions
  resumeJob: (jobId: string) => Promise<boolean>;
  cancelJob: (jobId: string) => Promise<boolean>;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: {},

  addJob: (job) =>
    set((s) => ({
      jobs: { ...s.jobs, [job.id]: job },
    })),

  updateJob: (jobId, updates) =>
    set((s) => ({
      jobs: {
        ...s.jobs,
        [jobId]: {
          ...s.jobs[jobId],
          ...updates,
          updatedAt: Date.now(),
        },
      },
    })),

  addStep: (jobId, step) =>
    set((s) => {
      const job = s.jobs[jobId];
      if (!job) return {};
      return {
        jobs: {
          ...s.jobs,
          [jobId]: {
            ...job,
            steps: [...job.steps, step],
            updatedAt: Date.now(),
          },
        },
      };
    }),

  updateStep: (jobId, stepId, updates) =>
    set((s) => {
      const job = s.jobs[jobId];
      if (!job) return {};
      return {
        jobs: {
          ...s.jobs,
          [jobId]: {
            ...job,
            steps: job.steps.map((step) =>
              step.id === stepId ? { ...step, ...updates } : step
            ),
            updatedAt: Date.now(),
          },
        },
      };
    }),

  setStepRunning: (jobId, stepId) =>
    get().updateStep(jobId, stepId, { status: 'running', started_at: Date.now() }),

  setStepCompleted: (jobId, stepId, output, duration_ms) =>
    get().updateStep(jobId, stepId, {
      status: 'completed',
      output,
      duration_ms,
      completed_at: Date.now(),
    }),

  setStepFailed: (jobId, stepId, output) =>
    get().updateStep(jobId, stepId, { status: 'failed', output }),

  addArtifact: (jobId, artifact) => {
    const ACTION_PRIORITY: Record<string, number> = {
      created: 0,
      modified: 1,
      read: 2,
      deleted: 3,
    };
    set((s) => {
      const job = s.jobs[jobId];
      if (!job) return {};
      const existing = job.artifacts ?? [];
      const idx = existing.findIndex((a) => a.path === artifact.path);
      let updated: Artifact[];
      if (idx >= 0) {
        // Update existing artifact
        updated = existing.map((a, i) =>
          i === idx
            ? {
                ...a,
                action: artifact.action,
                size: artifact.size ?? a.size,
                timestamp: artifact.timestamp ?? a.timestamp,
              }
            : a
        );
      } else {
        // Append new artifact
        updated = [...existing, { ...artifact, timestamp: artifact.timestamp ?? Date.now() }];
      }
      // Sort: by action priority ascending, then by timestamp descending
      updated.sort((a, b) => {
        const pA = ACTION_PRIORITY[a.action] ?? 99;
        const pB = ACTION_PRIORITY[b.action] ?? 99;
        if (pA !== pB) return pA - pB;
        return (b.timestamp ?? 0) - (a.timestamp ?? 0);
      });
      return {
        jobs: {
          ...s.jobs,
          [jobId]: {
            ...job,
            artifacts: updated,
            updatedAt: Date.now(),
          },
        },
      };
    });
  },

  handleJobEvent: (jobId, event, data) => {
    // Step-level events
    if (event === 'step_created' && data.step) {
      get().addStep(jobId, data.step as DetailedJobStep);
      return;
    }

    if (event === 'step_started' && data.stepId) {
      get().setStepRunning(jobId, data.stepId as string);
      return;
    }

    if (event === 'step_completed' && data.step) {
      const step = data.step as DetailedJobStep;
      set((s) => {
        const job = s.jobs[jobId];
        if (!job) return {};
        return {
          jobs: {
            ...s.jobs,
            [jobId]: {
              ...job,
              steps: job.steps.map((s) =>
                s.id === step.id ? { ...s, ...step, status: 'completed' as StepStatus, completed_at: Date.now() } : s
              ),
              updatedAt: Date.now(),
            },
          },
        };
      });
      return;
    }

    if (event === 'step_failed' && data.step) {
      const step = data.step as DetailedJobStep;
      set((s) => {
        const job = s.jobs[jobId];
        if (!job) return {};
        return {
          jobs: {
            ...s.jobs,
            [jobId]: {
              ...job,
              steps: job.steps.map((s) =>
                s.id === step.id ? { ...s, ...step, status: 'failed' as StepStatus } : s
              ),
              updatedAt: Date.now(),
            },
          },
        };
      });
      return;
    }

    // Job-level events
    const statusMap: Record<string, JobStatus | undefined> = {
      job_started: 'running',
      job_completed: 'completed',
      job_failed: 'failed',
      job_cancelled: 'cancelled',
      job_paused: 'paused',
    };

    const status = statusMap[event];
    if (status) {
      set((s) => ({
        jobs: {
          ...s.jobs,
          [jobId]: {
            ...s.jobs[jobId],
            status,
            ...((data as any).steps ? { steps: (data as any).steps as DetailedJobStep[] } : {}),
            updatedAt: Date.now(),
          },
        },
      }));
    }

    // Artifact events
    if (event === 'artifact_created' || event === 'artifact_modified' ||
        event === 'artifact_read' || event === 'artifact_deleted') {
      const action = event.replace('artifact_', '') as 'created' | 'modified' | 'read' | 'deleted';
      const artifactData = data.artifact as { path?: string; size?: number; timestamp?: number } | undefined;
      if (artifactData?.path) {
        get().addArtifact(jobId, {
          path: artifactData.path,
          action,
          size: artifactData.size,
          timestamp: artifactData.timestamp ?? Date.now(),
        });
      }
    }
  },

  hasActiveJobs: () => {
    const { jobs } = get();
    return Object.values(jobs).some(
      (job) => job.status === 'queued' || job.status === 'running'
    );
  },

  getAllJobs: () => {
    const { jobs } = get();
    return Object.values(jobs);
  },

  getJob: (jobId) => {
    const { jobs } = get();
    return jobs[jobId];
  },

  resumeJob: async (jobId): Promise<boolean> => {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Resume timeout')), 5000)
      );
      await Promise.race([wsClient.resumeJob(jobId), timeout]);
      set((s) => ({
        jobs: {
          ...s.jobs,
          [jobId]: {
            ...s.jobs[jobId],
            status: 'running' as JobStatus,
            updatedAt: Date.now(),
          },
        },
      }));
      return true;
    } catch {
      return false;
    }
  },

  cancelJob: async (jobId): Promise<boolean> => {
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cancel timeout')), 5000)
      );
      await Promise.race([wsClient.cancelJob(jobId), timeout]);
      set((s) => ({
        jobs: {
          ...s.jobs,
          [jobId]: {
            ...s.jobs[jobId],
            status: 'cancelled' as JobStatus,
            updatedAt: Date.now(),
          },
        },
      }));
      return true;
    } catch {
      return false;
    }
  },
}));
