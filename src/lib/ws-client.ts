/**
 * WebSocket client — singleton bridging the browser to the pi CLI via the custom server.
 *
 * Connection: ws://[same host]:3000/ws  (custom server spawns pi --mode rpc)
 *
 * Pi RPC protocol (sent to server):
 *   { type: "prompt", message: string, id?: string }
 *   { type: "abort", id?: string }
 *   { type: "new_session", id?: string }
 *   { type: "get_state", id?: string }
 *   { type: "get_available_models", id?: string }
 *
 * Received from server: pi RPC events + server_event lifecycle messages.
 */

'use client';

import { useConnectionStore } from '@/store/connection';
import { useMessagesStore } from '@/store/messages';
import { useJobsStore } from '@/store/jobs';
import { useQueueOutputStore } from '@/store/queue-output';
import type {
  WsInboundFrame,
  WsOutboundFrame,
  WsInterruptFrame,
  InterruptAckFrame,
  WsRegenerateFrame,
  ResumeJobFrame,
  CancelJobFrame,
  JobEventData,
  OutputLine,
  WsQueueTaskOutputFrame,
  WsQueueTaskPositionFrame,
  WsQueueStartFrame,
  WsQueueTaskSendFrame,
  WsQueueStopFrame,
  WsQueueNextFrame,
  WsQueueTaskStartedFrame,
  WsQueueTaskCompleteFrame,
  WsQueueTaskErrorFrame,
  WsQueueStoppedFrame,
  OnFailureAction,
} from '@/types/chat';
import type { JobStatus } from '@/store/jobs';

const BACKOFF_BASE = 2000;
const BACKOFF_MAX = 30000;
const MAX_ATTEMPTS = 5;

/** Derive WebSocket URL from the current browser location (same-origin) */
function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  // Allow override via env (useful for cross-origin dev)
  if (process.env.NEXT_PUBLIC_PI_WS_URL) {
    return process.env.NEXT_PUBLIC_PI_WS_URL;
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws`;
}

export class WsClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Array<(frame: WsInboundFrame) => void> = [];

  onMessage(handler: (frame: WsInboundFrame) => void): void {
    if (!this.messageHandlers.includes(handler)) {
      this.messageHandlers.push(handler);
    }
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect loop on manual close
      this.ws.close();
    }

    const url = getWsUrl();
    if (!url) return;

    useConnectionStore.getState().setState('reconnecting');

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        useConnectionStore.getState().setConnected();
        useConnectionStore.getState().setLastError(null);
      };

      this.ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data);

          // Handle server lifecycle events
          if (frame.type === 'server_event') {
            this.handleServerEvent(frame);
            return;
          }

          // Route pi RPC frames
          this.routeFrame(frame);
          this.messageHandlers.forEach((h) => h(frame));
        } catch (e) {
          console.error('Failed to parse WS frame:', e);
        }
      };

      this.ws.onerror = () => {
        useConnectionStore.getState().setLastError(
          'Cannot connect to pi-app server. Is the server running?'
        );
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    useConnectionStore.getState().setState('offline');
  }

  retry(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    useConnectionStore.getState().retryConnection();
    this.connect();
  }

  /** Send a prompt to pi */
  prompt(message: string, id?: string): void {
    this.sendRaw({ type: 'prompt', message, ...(id ? { id } : {}) });
  }

  /** Abort current pi generation */
  abort(id?: string): void {
    this.sendRaw({ type: 'abort', ...(id ? { id } : {}) });
  }

  /** Start a fresh pi session */
  newSession(): void {
    this.sendRaw({ type: 'new_session' });
  }

  send(frame: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame));
    }
  }

  sendRaw(frame: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame));
    } else {
      console.warn('WebSocket not open, cannot send:', frame.type);
    }
  }

  sendInterrupt(conversationId: string): void {
    const frame: WsInterruptFrame = { type: 'interrupt', conversationId };
    this.send(frame);
  }

  regenerate(conversationId: string, messageId: string): void {
    const frame: WsRegenerateFrame = { type: 'regenerate', conversationId, messageId };
    this.send(frame);
  }

  resumeJob(jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const frame: ResumeJobFrame = { type: 'resume_job', jobId };
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(frame));
        resolve();
      } else {
        reject(new Error('WebSocket not open'));
      }
    });
  }

  cancelJob(jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const frame: CancelJobFrame = { type: 'cancel_job', jobId };
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(frame));
        resolve();
      } else {
        reject(new Error('WebSocket not open'));
      }
    });
  }

  sendQueueStart(taskId: string, projectId: string, onFailure: OnFailureAction): void {
    const frame: WsQueueStartFrame = {
      type: 'queue_start',
      taskId,
      projectId,
      onFailure,
    };
    this.sendRaw(frame as unknown as Record<string, unknown>);
  }

  sendQueueTask(taskId: string, projectId: string, prompt: string): void {
    const frame: WsQueueTaskSendFrame = {
      type: 'queue_task_send',
      taskId,
      projectId,
      prompt,
    };
    this.sendRaw(frame as unknown as Record<string, unknown>);
  }

  sendQueueStop(): void {
    const frame: WsQueueStopFrame = { type: 'queue_stop' };
    this.sendRaw(frame as unknown as Record<string, unknown>);
  }

  sendQueueNext(): void {
    const frame: WsQueueNextFrame = { type: 'queue_next' };
    this.sendRaw(frame as unknown as Record<string, unknown>);
  }


  private handleServerEvent(frame: { event: string; message?: string; pid?: number }): void {
    switch (frame.event) {
      case 'pi_ready':
        console.log('[ws] pi ready, PID:', frame.pid);
        break;
      case 'pi_error':
        useConnectionStore.getState().setLastError(frame.message || 'pi failed to start');
        break;
      case 'pi_exit':
        console.log('[ws] pi exited');
        break;
      case 'stderr':
        console.warn('[pi stderr]', frame.message);
        break;
    }
  }

  private routeFrame(frame: WsInboundFrame | InterruptAckFrame): void {
    switch (frame.type) {
      case 'token':
        this.handleTokenFrame(frame as WsInboundFrame);
        break;
      case 'message_complete':
        this.handleMessageCompleteFrame(frame as WsInboundFrame);
        break;
      case 'job_event':
        this.handleJobEventFrame(frame as WsInboundFrame);
        break;
      case 'interrupt_ack':
        this.handleInterruptAck(frame as InterruptAckFrame);
        break;
      case 'queue_task_output':
        this.handleQueueTaskOutputFrame(frame as WsInboundFrame);
        break;
      case 'queue_task_position':
        this.handleQueueTaskPositionFrame(frame as WsInboundFrame);
        break;
      case 'queue_task_started':
        this.handleQueueTaskStarted(frame as any);
        break;
      case 'queue_task_complete':
        this.handleQueueTaskComplete(frame as any);
        break;
      case 'queue_task_error':
        this.handleQueueTaskError(frame as any);
        break;
      case 'queue_stopped':
        this.handleQueueStopped(frame as any);
        break;
    }
  }

  private handleTokenFrame(frame: WsInboundFrame): void {
    if (frame.messageId && frame.token) {
      useMessagesStore.getState().appendToken(frame.messageId, frame.token);
    }
  }

  private handleMessageCompleteFrame(frame: WsInboundFrame): void {
    if (frame.messageId) {
      useMessagesStore.getState().completeMessage(frame.messageId);
    }
  }

  private handleJobEventFrame(frame: WsInboundFrame): void {
    if (frame.jobId && frame.event) {
      useJobsStore.getState().handleJobEvent(frame.jobId, frame.event, frame.data as JobEventData);
    }
  }

  private handleInterruptAck(frame: InterruptAckFrame): void {
    if (frame.conversationId) {
      useMessagesStore.getState().acknowledgeInterrupt(frame.conversationId);
    }
  }

  private handleQueueTaskOutputFrame(frame: WsInboundFrame): void {
    const outputFrame = frame as unknown as WsQueueTaskOutputFrame;
    const line = outputFrame.line as OutputLine | undefined;
    if (!line) return;

    const store = useQueueOutputStore.getState();
    switch (line.type) {
      case 'assistant': store.appendToken(line.content); break;
      case 'tool-call': store.appendToolCall(line.toolName ?? 'unknown', line.content); break;
      case 'tool-result': store.appendToolResult(line.toolName ?? 'unknown', line.content); break;
      case 'user': store.appendUserMessage(line.content); break;
    }
  }

  private handleQueueTaskPositionFrame(frame: WsInboundFrame): void {
    const positionFrame = frame as unknown as WsQueueTaskPositionFrame;
    if (positionFrame.position != null && positionFrame.total != null) {
      useQueueOutputStore.getState().setPosition(positionFrame.position, positionFrame.total);
    }
  }

  private handleQueueTaskStarted(frame: WsQueueTaskStartedFrame): void {
    if (frame.taskId) {
      const { useQueueEditorStore } = require('@/store/queue-editor');
      const store = useQueueEditorStore.getState();
      store.updateTaskStatus(frame.taskId, 'running');
      
      const task = store.tasks.find((t: any) => t.id === frame.taskId);
      if (task) {
        useQueueOutputStore.getState().setActiveTask(
          {
            id: task.id,
            prompt: task.instruction,
            status: 'running',
            conversationId: frame.conversationId,
          },
          store.tasks.indexOf(task) + 1,
          store.tasks.length
        );
      }
    }
  }

  private handleQueueTaskComplete(frame: WsQueueTaskCompleteFrame): void {
    if (frame.taskId) {
      const { useQueueEditorStore } = require('@/store/queue-editor');
      const store = useQueueEditorStore.getState();
      store.updateTaskStatus(frame.taskId, 'completed');

      if (frame.conversationId) {
        useQueueOutputStore.getState().markComplete(frame.conversationId);
      }
      
      const { useQueueControlStore } = require('@/store/queue-control');
      const controlState = useQueueControlStore.getState();
      if (controlState.status === 'running') {
        if (controlState.pauseAfterCurrent) {
          controlState.setStatus('paused');
          controlState.togglePauseAfterCurrent();
        } else {
          this.sendQueueNext();
        }
      }
    }
  }

  private handleQueueTaskError(frame: WsQueueTaskErrorFrame): void {
    if (frame.taskId) {
      const { useQueueEditorStore } = require('@/store/queue-editor');
      const store = useQueueEditorStore.getState();
      store.updateTaskStatus(frame.taskId, 'failed');

      useQueueOutputStore.getState().markError(frame.error || 'Task execution failed');

      const { useQueueControlStore } = require('@/store/queue-control');
      const controlState = useQueueControlStore.getState();
      
      if (controlState.status === 'running') {
        if (controlState.settings.onFailure === 'skip') {
          this.sendQueueNext();
        } else if (controlState.settings.onFailure === 'abort') {
          controlState.setStatus('idle');
          this.sendQueueStop();
        } else {
          controlState.setStatus('paused');
        }
      }
    }
  }

  private handleQueueStopped(frame: WsQueueStoppedFrame): void {
    const { useQueueControlStore } = require('@/store/queue-control');
    useQueueControlStore.getState().setStatus('idle');
  }


  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    const store = useConnectionStore.getState();

    if (this.reconnectAttempts >= MAX_ATTEMPTS) {
      store.setLastError(
        'Lost connection to pi-app server after 5 attempts. Refresh the page or check the server.'
      );
      store.setOffline();
      return;
    }

    const delay = Math.min(BACKOFF_BASE * Math.pow(2, this.reconnectAttempts), BACKOFF_MAX);
    this.reconnectAttempts++;
    store.incrementReconnectAttempt();

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const wsClient = new WsClient();
