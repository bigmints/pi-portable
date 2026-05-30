'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { wsClient } from '@/lib/ws-client';
import { cn } from '@/lib/utils';
import { Square, Terminal, Sparkles, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageRole = 'user' | 'assistant';
type MessageStatus = 'streaming' | 'complete' | 'error';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  model?: string;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  name: string;
  input: string;
  output?: string;
  status: 'running' | 'done' | 'error';
}

const SUGGESTIONS = [
  'What files are in my current directory?',
  'Show me the git log for today',
  'Explain the main module of this project',
  'Find any TODO comments in the codebase',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentMsgId = useRef<string | null>(null);

  useEffect(() => {
    wsClient.connect();

    const handler = (frame: Record<string, unknown>) => {
      const type = frame.type as string;

      if (type === 'message_update') {
        const ev = frame.assistantMessageEvent as Record<string, unknown>;
        if (!ev) return;

        if (ev.type === 'text_delta' && typeof ev.delta === 'string') {
          const delta = ev.delta;
          if (currentMsgId.current) {
            setMessages(prev => prev.map(m =>
              m.id === currentMsgId.current
                ? { ...m, content: m.content + delta, status: 'streaming' }
                : m
            ));
          }
        }

        if (ev.type === 'tool_use_start') {
          const toolCall: ToolCall = {
            id: (ev.toolUseId as string) || crypto.randomUUID(),
            name: (ev.toolName as string) || 'unknown',
            input: typeof ev.toolInput === 'string' ? ev.toolInput : JSON.stringify(ev.toolInput || {}),
            status: 'running',
          };
          setActiveToolCalls(prev => [...prev, toolCall]);
          if (currentMsgId.current) {
            setMessages(prev => prev.map(m =>
              m.id === currentMsgId.current
                ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] }
                : m
            ));
          }
        }

        if (ev.type === 'tool_result') {
          const toolUseId = ev.toolUseId as string;
          setActiveToolCalls(prev => prev.map(t =>
            t.id === toolUseId ? { ...t, status: 'done', output: String(ev.content || '') } : t
          ));
          if (currentMsgId.current) {
            setMessages(prev => prev.map(m =>
              m.id === currentMsgId.current
                ? { ...m, toolCalls: (m.toolCalls || []).map(t =>
                    t.id === toolUseId ? { ...t, status: 'done', output: String(ev.content || '') } : t
                  )}
                : m
            ));
          }
        }
      }

      if (type === 'message_start') {
        const msg = frame.message as Record<string, unknown>;
        if (msg?.role === 'assistant') {
          const id = `pi-${Date.now()}`;
          currentMsgId.current = id;
          setIsStreaming(true);
          setMessages(prev => [...prev, { id, role: 'assistant', content: '', status: 'streaming', model: msg.model as string }]);
        }
      }

      if (type === 'message_end' || type === 'agent_end') {
        if (currentMsgId.current) {
          const msgId = currentMsgId.current;
          setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, status: 'complete' } : m
          ));
        }
        if (type === 'agent_end') {
          setIsStreaming(false);
          setActiveToolCalls([]);
          currentMsgId.current = null;
        }
      }
    };

    wsClient.onMessage(handler as never);

    return () => {
      // Keep connection alive for navigation
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text, status: 'complete' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    wsClient.sendRaw({ type: 'prompt', message: text, id: userMsg.id });
  }, [input, isStreaming]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleAbort = useCallback(() => {
    wsClient.abort();
    setIsStreaming(false);
    if (currentMsgId.current) {
      setMessages(prev => prev.map(m =>
        m.id === currentMsgId.current ? { ...m, status: 'complete' } : m
      ));
      currentMsgId.current = null;
    }
  }, []);

  const handleSuggestion = useCallback((text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12 gap-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/25">
                <Terminal className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Hi, I am pi</h1>
              <p className="text-muted-foreground text-sm max-w-xs">
                Your AI coding assistant. Ask me to read files, run commands, explain code, or anything else.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-left hover:bg-accent transition-colors"
                >
                  <Sparkles size={14} className="text-violet-400 shrink-0" />
                  <span className="text-foreground/80">{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0 px-4 py-4 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && activeToolCalls.length > 0 && activeToolCalls.some(t => t.status === 'running') && (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <span className="flex gap-0.5">
                  {[0,1,2].map(i => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </span>
                pi is working...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-4 py-2 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message pi..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-h-[24px] max-h-[160px] py-1 disabled:opacity-50"
            />
            {isStreaming ? (
              <button
                onClick={handleAbort}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-30 hover:bg-violet-500 transition-colors"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground/50 mt-2">pi can make mistakes - verify important info</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [toolsExpanded, setToolsExpanded] = useState<Record<string, boolean>>({});

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6">
      <div className="shrink-0 flex h-7 w-7 mt-0.5 items-center justify-center rounded-lg bg-violet-600/20">
        <Terminal size={14} className="text-violet-400" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {(message.toolCalls || []).map((tc) => (
          <div key={tc.id} className="rounded-xl border border-border bg-card/50 overflow-hidden text-xs">
            <button
              onClick={() => setToolsExpanded(p => ({ ...p, [tc.id]: !p[tc.id] }))}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-accent/50 transition-colors"
            >
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                tc.status === 'running' ? 'bg-amber-400 animate-pulse' : tc.status === 'done' ? 'bg-emerald-400' : 'bg-red-400'
              )} />
              <span className="font-mono font-medium text-foreground/80">{tc.name}</span>
              <span className="ml-auto text-muted-foreground">{toolsExpanded[tc.id] ? '▲' : '▼'}</span>
            </button>
            {toolsExpanded[tc.id] && (
              <div className="px-3 pb-3 space-y-2 border-t border-border">
                <div className="mt-2">
                  <div className="text-muted-foreground mb-1">Input</div>
                  <pre className="bg-background rounded-lg p-2 overflow-x-auto text-foreground/80 whitespace-pre-wrap break-all">{tc.input}</pre>
                </div>
                {tc.output && (
                  <div>
                    <div className="text-muted-foreground mb-1">Output</div>
                    <pre className="bg-background rounded-lg p-2 overflow-x-auto text-foreground/80 whitespace-pre-wrap break-all max-h-48">{tc.output}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {message.content && (
          <div className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.status === 'streaming' && !message.content && (
          <div className="flex gap-0.5 py-1">
            {[0,1,2].map(i => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
