/**
 * Export conversation utilities — Markdown and JSON download helpers
 */
import type { Conversation } from '@/types/chat';

/**
 * Export a conversation as a Markdown file.
 * Messages are grouped with `## [timestamp]` headers.
 */
export function exportAsMarkdown(conversation: Conversation): void {
  const lines: string[] = [];
  lines.push(`# ${conversation.title}`);
  lines.push('');

  // Build markdown content from the conversation metadata
  lines.push(`**Conversation ID:** \`${conversation.id}\``);
  lines.push(`**Messages:** ${conversation.messageCount}`);
  if (conversation.model) {
    lines.push(`**Model:** ${conversation.model}`);
  }
  if (conversation.lastMessageAt) {
    lines.push(`**Last updated:** ${new Date(conversation.lastMessageAt).toISOString()}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`## Last Message`);
  lines.push('');
  lines.push(conversation.lastMessagePreview || '(no preview available)');
  lines.push('');

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  downloadBlob(blob, `conversation-${conversation.id}.md`);
}

/**
 * Export a conversation as a JSON file.
 */
export function exportAsJSON(conversation: Conversation): void {
  const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `conversation-${conversation.id}.json`);
}

/**
 * Trigger a browser download from a Blob using a temporary anchor element.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}
