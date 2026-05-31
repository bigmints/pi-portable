export interface ToolCallEvent {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  status: 'running' | 'completed' | 'error';
  output?: string;
  error?: string;
  timestamp: number;
}

export interface AssistantMessageEvent {
  type: 'tool_use_start' | 'tool_use_complete' | 'tool_use_error' | 'text' | 'done';
  toolCallId?: string;
  toolName?: string;
  input?: Record<string, unknown>;
  output?: string;
  error?: string;
  content?: string;
}
