'use client';

import { MessageSquare, ArrowRight } from 'lucide-react';
import styles from './EmptyState.module.css';

interface Suggestion {
  label: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    label: 'Explain a concept',
    prompt: 'Explain how WebSocket connections work in a progressive web app',
  },
  {
    label: 'Write code',
    prompt: 'Write a TypeScript function that validates email addresses',
  },
  {
    label: 'Debug an issue',
    prompt: 'Help me debug a Next.js 14 App Router hydration error',
  },
  {
    label: 'Analyze data',
    prompt: 'How do I implement real-time streaming with Server-Sent Events?',
  },
];

interface EmptyStateProps {
  onSuggestion?: (_prompt: string) => void;
}

export default function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <MessageSquare size={48} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Welcome to pi-app</h1>
        <p className={styles.subtitle}>
          Start a conversation or choose a suggestion below
        </p>
        <div className={styles.suggestions}>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              className={styles.suggestionCard}
              onClick={() => onSuggestion?.(suggestion.prompt)}
            >
              <span className={styles.suggestionLabel}>{suggestion.label}</span>
              <span className={styles.suggestionPrompt}>{suggestion.prompt}</span>
              <ArrowRight size={16} strokeWidth={1.5} className={styles.suggestionArrow} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
