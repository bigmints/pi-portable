'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Suggestion } from '@/types/chat';
import Composer, { ComposerHandle } from './Composer';
import styles from './EmptyState.module.css';

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: '1', label: 'Explain', prompt: 'Explain how pi CLI works' },
  { id: '2', label: 'Debug', prompt: 'Help me debug my code' },
  { id: '3', label: 'Test', prompt: 'Write a unit test for this function' },
  { id: '4', label: 'Review', prompt: 'Review my git history' },
  { id: '5', label: 'Docs', prompt: 'Generate a README for my project' },
];

interface EmptyStateProps {
  onSendMessage: (_content: string) => void;
  disabled?: boolean;
}

export default function EmptyState({ onSendMessage, disabled = false }: EmptyStateProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS);
  const [loading, setLoading] = useState(true);
  const composerRef = useRef<ComposerHandle>(null);

  // Fetch suggestions from API with fallback
  useEffect(() => {
    let cancelled = false;
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/suggestions');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // Use defaults — already set
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      composerRef.current?.insertText(suggestion.prompt);
    },
    []
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg width="64" height="64" viewBox="0 0 512 512" fill="none">
            <rect width="512" height="512" rx="96" fill="var(--color-brand)" />
            <text
              x="256"
              y="320"
              textAnchor="middle"
              fill="white"
              fontSize="280"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              π
            </text>
          </svg>
        </div>

        {/* Headline */}
        <h1 className={styles.title}>Welcome to pi-app</h1>
        <p className={styles.tagline}>
          Start a conversation or try a suggestion below
        </p>

        {/* Suggestion chips */}
        <div className={styles.chips}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.chipSkeleton} />
              ))
            : suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className={styles.chip}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles size={14} strokeWidth={1.5} className={styles.chipIcon} />
                  <span className={styles.chipLabel}>{suggestion.label}</span>
                  <ArrowRight size={12} strokeWidth={1.5} className={styles.chipArrow} />
                </button>
              ))}
        </div>

        {/* Composer */}
        <div className={styles.composerWrapper}>
          <Composer
            ref={composerRef}
            placeholder="What would you like to ask?"
            onSubmit={onSendMessage}
            autoFocus
            disabled={disabled}
            context="new-chat"
          />
        </div>
      </div>
    </div>
  );
}
