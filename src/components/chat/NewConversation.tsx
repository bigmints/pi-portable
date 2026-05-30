'use client';

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import type { Suggestion } from '@/types/chat';
import Composer from './Composer';
import styles from './NewConversation.module.css';

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: '1', label: 'Explain this codebase', prompt: 'Explain the structure and architecture of this codebase' },
  { id: '2', label: 'Find bugs', prompt: 'Find potential bugs and issues in the current project' },
  { id: '3', label: 'Write tests', prompt: 'Write comprehensive tests for the main modules' },
  { id: '4', label: 'Improve performance', prompt: 'Suggest performance improvements for this project' },
];

interface NewConversationProps {
  onSendMessage: (_content: string) => void;
}

export default function NewConversation({ onSendMessage }: NewConversationProps) {
  const [suggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS);

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      onSendMessage(suggestion.prompt);
    },
    [onSendMessage]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" fill="var(--color-brand)" />
            <text
              x="32"
              y="38"
              textAnchor="middle"
              fill="white"
              fontSize="20"
              fontWeight="bold"
              fontFamily="var(--font-sans)"
            >
              pi
            </text>
          </svg>
        </div>
        <h1 className={styles.title}>Welcome to pi-app</h1>
        <p className={styles.subtitle}>
          Your AI assistant for coding, debugging, and more.
        </p>

        <div className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className={styles.suggestionChip}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Sparkles size={14} strokeWidth={1.5} className={styles.suggestionIcon} />
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.composerWrapper}>
          <Composer
            placeholder="What would you like to ask?"
            onSubmit={onSendMessage}
            autoFocus
            context="new-chat"
          />
        </div>
      </div>
    </div>
  );
}
