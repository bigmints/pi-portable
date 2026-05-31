import { StepType, StepStatus } from './chat';

export interface JobStep {
  id: string;
  title: string;
  stepType: StepType;
  status: StepStatus;
  input?: Record<string, unknown>;
  output?: string;
  duration_ms?: number | null;
  started_at?: number;
  completed_at?: number;
  reasoning?: string;
  fromEvent?: boolean;
  prompt_tokens?: number;
  completion_tokens?: number;
  model?: string;
  tokens?: number;
  duration?: number;
}
