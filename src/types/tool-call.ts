export type ToolCallStatus = 'pending' | 'running' | 'complete' | 'error';

export interface ToolCall {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: string;
  error?: string;
  status: ToolCallStatus;
  timestamp: number;
}

export interface ToolCallEvent {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  status: 'running' | 'completed' | 'error';
  output?: string;
  error?: string;
  timestamp: number;
}
