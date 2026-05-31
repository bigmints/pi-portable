'use client';

import { useState, useCallback, useMemo } from 'react';
import { Wrench, ChevronDown, ChevronUp, Copy, Check, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { ToolCall } from '@/types/tool-call';

interface ToolCallCardProps {
  toolCall: ToolCall;
  defaultExpanded?: boolean;
}

export default function ToolCallCard({
  toolCall,
  defaultExpanded = false,
}: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleCopyInput = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(JSON.stringify(toolCall.input, null, 2));
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } catch (err) {
      console.error('Failed to copy input:', err);
    }
  }, [toolCall.input]);

  const handleCopyOutput = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = toolCall.status === 'error'
      ? toolCall.error || 'Unknown error'
      : typeof toolCall.output === 'string'
        ? toolCall.output
        : JSON.stringify(toolCall.output || {}, null, 2);

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  }, [toolCall.status, toolCall.output, toolCall.error]);

  const formattedTime = useMemo(() => {
    return new Date(toolCall.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [toolCall.timestamp]);

  const isSuccess = toolCall.status === 'complete' || (toolCall.status as string) === 'completed';

  return (
    <div className={`my-3 overflow-hidden rounded-xl border transition-all duration-200 ${
      toolCall.status === 'error'
        ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10'
        : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
    }`}>
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3 select-none hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          {toolCall.status === 'running' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
          )}
          {isSuccess && (
            <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          )}
          {toolCall.status === 'error' && (
            <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
          )}

          {/* Tool Icon & Name */}
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {toolCall.toolName}
            </span>
          </div>

          {/* Inline Summary */}
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline truncate max-w-[200px] md:max-w-[350px]">
            {toolCall.status === 'running'
              ? 'Executing tool...'
              : toolCall.status === 'error'
                ? toolCall.error || 'Error executing tool'
                : 'Completed'}
          </span>
        </div>

        {/* Right Area (Timestamp + Chevron) */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {formattedTime}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          )}
        </div>
      </div>

      {/* Collapsible Details */}
      {expanded && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 space-y-4">
          {/* Input Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Parameters
              </span>
              <button
                type="button"
                onClick={handleCopyInput}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {copiedInput ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs font-mono text-slate-200 dark:bg-slate-950">
              <code>{JSON.stringify(toolCall.input, null, 2)}</code>
            </pre>
          </div>

          {/* Output/Error Section */}
          {(isSuccess || toolCall.status === 'error') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  toolCall.status === 'error'
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {toolCall.status === 'error' ? 'Error Details' : 'Results'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  {copiedOutput ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              {toolCall.status === 'error' ? (
                <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs font-mono text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                  {toolCall.error || 'An error occurred during tool execution.'}
                </div>
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs font-mono text-slate-200 dark:bg-slate-950">
                  <code>
                    {typeof toolCall.output === 'string'
                      ? toolCall.output
                      : JSON.stringify(toolCall.output || {}, null, 2)}
                  </code>
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
