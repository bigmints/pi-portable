/**
 * Core chat types for the Pi App
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

export type WsConnectionState = 'connected' | 'reconnecting' | 'offline';

export interface ArtifactFile {
  id: string;
  path: string;
  filename: string;
  language: string; // detected language (e.g., 'typescript', 'python', 'json')
  content: string; // full file content
  lineCount: number;
  isImage?: boolean; // true for image files
  imageUrl?: string; // base64 or data URL for images
  isModified?: boolean; // true if this is a modified file with diff
  diffAdded?: number; // lines added
  diffRemoved?: number; // lines removed
  diffContent?: string; // unified diff string
  createdAt: string;
}

export type ArtifactCardType = 'file' | 'image' | 'diff';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: number;
  isStreaming?: boolean;
  interrupted?: boolean;
  is_regenerating?: boolean;
  artifacts?: ArtifactFile[];
}

export type ToolCallStatus = 'running' | 'success' | 'error';

export interface ToolCall {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  durationMs?: number;
  status: ToolCallStatus;
  timestamp: number;
}

/**
 * Flat tool-call data used by the ToolCallAnnotation component.
 * Supports grouping multiple tool calls under a single collapsible header.
 */
export interface ToolCallData {
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | string;
  error?: string;
  durationMs?: number;
  status: 'running' | 'completed' | 'error';
}

export interface ToolCallMessage {
  id: string;
  conversationId: string;
  toolCalls: ToolCall[];
  status: ToolCallStatus;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  projectId: string;
  lastMessagePreview: string;
  lastMessageAt: number;
  isPinned: boolean;
  /** Alias for isPinned — used by UI consumers */
  pinned?: boolean;
  messageCount: number;
  projectColor?: string;
  /** Model used for this conversation (e.g. 'gpt-4o') */
  model?: string;
  /** Source of the conversation (e.g. 'queue' for queue-generated) */
  source?: string;
  /** Task ID if created from a queue task */
  taskId?: string;
  /** ISO timestamp when soft-deleted; cleared when restored */
  softDeletedAt?: string;
  messages?: any[];
  createdAt?: string;
}

export type ConversationGroup = 'pinned' | 'today' | 'yesterday' | 'thisWeek' | 'older';

export interface ConversationGroupEntry {
  label: string;
  conversations: Conversation[];
}

export interface GroupedConversations {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  thisWeek: Conversation[];
  older: Conversation[];
}

export interface ConversationGroupEntry {
  label: string;
  conversations: Conversation[];
}

export type OnFailureAction = 'pause' | 'skip' | 'abort';

export type QueueStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface QueueSettings {
  onFailure: OnFailureAction;
  autoClearCompleted: boolean;
}

export interface WsInboundFrame {
  type: 'token' | 'message_complete' | 'job_event' | 'queue_task_started' | 'queue_task_complete' | 'queue_task_error' | 'queue_stopped' | 'queue_task_output' | 'queue_task_position';
  messageId?: string;
  token?: string;
  conversationId?: string;
  jobId?: string;
  event?: string;
  data?: any;
  taskId?: string;
  error?: string;
}

/** Artifact event frame — carries artifact metadata in job_event frames */
export interface ArtifactEventFrame {
  type: 'job_event';
  jobId: string;
  event: 'artifact_created' | 'artifact_modified' | 'artifact_read' | 'artifact_deleted';
  data: {
    artifact?: {
      path: string;
      action?: 'created' | 'modified' | 'read' | 'deleted';
      size?: number;
      timestamp?: number;
    };
  };
}

export interface WsOutboundFrame {
  type: 'chat';
  conversationId: string;
  content: string;
  projectId: string;
  fileIds?: string[];
}

export interface WsRegenerateFrame {
  type: 'regenerate';
  conversationId: string;
  messageId: string;
}

export interface WsInterruptFrame {
  type: 'interrupt';
  conversationId: string;
}

export interface ResumeJobFrame {
  type: 'resume_job';
  jobId: string;
}

export interface CancelJobFrame {
  type: 'cancel_job';
  jobId: string;
}

// ─── Queue task types ─────────────────────────────────────────────────────

export type QueueTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface QueueTask {
  id: string;
  prompt: string;
  status: QueueTaskStatus;
  conversationId?: string;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface QueueRun {
  isActive: boolean;
  currentIndex: number;
  completedCount: number;
  failedCount: number;
  lockedProjectId: string | null;
  onFailure: OnFailureAction;
  startedAt?: number;
  completedAt?: number;
}

// ─── Queue WebSocket frames ─────────────────────────────────────────────────

export interface WsQueueStartFrame {
  type: 'queue_start';
  taskId: string;
  projectId: string;
  onFailure: OnFailureAction;
}

export interface WsQueueTaskSendFrame {
  type: 'queue_task_send';
  taskId: string;
  projectId: string;
  prompt: string;
}

export interface WsQueueStopFrame {
  type: 'queue_stop';
}

export interface WsQueueNextFrame {
  type: 'queue_next';
}

export interface WsQueueTaskStartedFrame {
  type: 'queue_task_started';
  taskId: string;
  conversationId: string;
}

export interface WsQueueTaskCompleteFrame {
  type: 'queue_task_complete';
  taskId: string;
  conversationId: string;
}

export interface WsQueueTaskErrorFrame {
  type: 'queue_task_error';
  taskId: string;
  error: string;
}

export interface WsQueueStoppedFrame {
  type: 'queue_stopped';
}

export type WsOutbound = WsOutboundFrame | WsInterruptFrame | WsRegenerateFrame | ResumeJobFrame | CancelJobFrame
  | WsQueueStartFrame | WsQueueTaskSendFrame | WsQueueStopFrame | WsQueueNextFrame;

/**
 * Step type for the timeline — what kind of operation this step represents
 */
export type StepType = 'plan' | 'tool_call' | 'result';

/**
 * Step status for timeline display
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Job step interface representing statistics and basic information
 */
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
  tokens?: number;
  durationMs?: number;
  cost?: number;
  model?: string;
}

/**
 * Detailed step for the job timeline
 */
export interface DetailedJobStep extends JobStep {
  /** Plan step reasoning text (Markdown) */
  summary?: string;
}

/**
 * Job event subtypes that can arrive via WebSocket
 */
export type JobEventName =
  | 'step_created'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'job_started'
  | 'job_completed'
  | 'job_failed'
  | 'artifact_created'
  | 'artifact_modified'
  | 'artifact_read'
  | 'artifact_deleted';

/**
 * Artifact action type
 */
export type ArtifactAction = 'created' | 'modified' | 'read' | 'deleted';

/**
 * Artifact — a file produced during job execution
 */
export interface Artifact {
  id?: string;             // unique identifier
  jobId?: string;          // originating job ID
  jobTitle?: string;       // originating job title
  path: string;            // relative file path
  action: ArtifactAction;  // action type
  extension?: string;      // file extension without dot, e.g. 'ts', 'md'
  size?: number;           // file size in bytes
  createdAt?: string;      // ISO date string
  updatedAt?: string;     // ISO date string
  timestamp?: number;     // when the artifact was produced (epoch ms)
  content?: string;       // optional, for inline preview
}

export interface JobEventData {
  stepId?: string;
  step?: DetailedJobStep;
  steps?: DetailedJobStep[];
  artifact?: Artifact;
  [key: string]: unknown;
}

// Aliases for frame subtypes (used by consumers)
export type TokenFrame = WsInboundFrame & { type: 'token'; messageId: string; token: string };
export type MessageCompleteFrame = WsInboundFrame & { type: 'message_complete'; messageId: string };
export type JobEventFrame = WsInboundFrame & { type: 'job_event'; jobId: string; event: string };

// Interrupt acknowledgment frame from server
export type InterruptAckFrame = {
  type: 'interrupt_ack';
  conversationId: string;
};

/**
 * Model pricing — price per 1M tokens
 */
export interface ModelPricing {
  model: string;
  prompt_price_per_1m: number;  // price per 1M tokens in USD
  completion_price_per_1m: number;
}

export interface Suggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: string;
  hasArgs: boolean;
  argPlaceholder?: string;
}

export type MessageAction = 'copy' | 'retry' | 'edit' | 'fork';

export interface MessageActionContext {
  messageId: string;
  conversationId: string;
  role: MessageRole;
  content: string;
}

/**
 * Model pricing data returned from GET /api/models
 */
export interface ModelPricing {
  model: string;
  /** Price per 1 million prompt tokens in USD */
  prompt_price_per_1m: number;
  /** Price per 1 million completion tokens in USD */
  completion_price_per_1m: number;
}

// ─── Queue output types ──────────────────────────────────────────────────────

/**
 * Output line type — what kind of content this line represents
 */
export type OutputLineType = 'user' | 'assistant' | 'tool-call' | 'tool-result';

/**
 * Individual output line for the live output panel
 */
export interface OutputLine {
  type: OutputLineType;
  content: string;
  timestamp: number;
  toolName?: string;  // for tool-call/tool-result
}

/**
 * Queue output WebSocket frame — streaming tokens and annotations
 */
export interface WsQueueTaskOutputFrame {
  type: 'queue_task_output';
  taskId: string;
  line: OutputLine;
}

/**
 * Queue position update frame — sent when queue advances
 */
export interface WsQueueTaskPositionFrame {
  type: 'queue_task_position';
  taskId: string;
  position: number;
  total: number;
}
