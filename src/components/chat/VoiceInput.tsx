'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Mic } from 'lucide-react';
import styles from './VoiceInput.module.css';

export interface VoiceInputProps {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onPermissionDenied: () => void;
  disabled?: boolean;
}

function isSpeechSupported(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

export default function VoiceInput({
  onInterimText,
  onFinalText,
  onPermissionDenied,
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(false);

  // Build recognition instance lazily (SSR-safe)
  const getRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    const Constructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) return null;

    const instance = new Constructor();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = 'en-US';

    instance.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim && isRecordingRef.current) {
        onInterimText(interim);
      }
      if (final) {
        // Final results come in chunks during continuous mode;
        // we accumulate them and only forward on stop/end.
        // Store in a ref so we can append on finalisation.
        (recognitionRef.current as SpeechRecognition & { _finalBuffer?: string })._finalBuffer =
          ((recognitionRef.current as SpeechRecognition & { _finalBuffer?: string })._finalBuffer ?? '') + final;
      }
    };

    instance.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'denied' || event.error === 'not-allowed') {
        onPermissionDenied();
      }
    };

    instance.onend = () => {
      isRecordingRef.current = false;
      setIsRecording(false);

      // Flush any buffered final text
      const buffer = (recognitionRef.current as SpeechRecognition & { _finalBuffer?: string })._finalBuffer;
      if (buffer) {
        onFinalText(buffer);
        (recognitionRef.current as SpeechRecognition & { _finalBuffer?: string })._finalBuffer = '';
      }
      onInterimText('');
    };

    recognitionRef.current = instance;
    return instance;
  }, [onInterimText, onFinalText, onPermissionDenied]);

  const stopRecording = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      rec.abort();
    }
    isRecordingRef.current = false;
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (disabled) return;
    const rec = getRecognition();
    if (!rec) return;

    isRecordingRef.current = true;
    setIsRecording(true);
    try {
      rec.start();
    } catch {
      // Already started
    }
  }, [disabled, getRecognition]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRecording) {
        stopRecording();
        onInterimText('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, stopRecording, onInterimText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // If the browser doesn't support speech recognition, render nothing
  if (!isSpeechSupported()) {
    return null;
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${isRecording ? styles.recording : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        startRecording();
      }}
      onMouseUp={() => {
        stopRecording();
      }}
      onMouseLeave={() => {
        if (isRecording) {
          stopRecording();
        }
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        startRecording();
      }}
      onTouchEnd={() => {
        stopRecording();
      }}
      onTouchCancel={() => {
        stopRecording();
      }}
      disabled={disabled}
      aria-label={isRecording ? 'Stop recording' : 'Voice input'}
      aria-pressed={isRecording}
    >
      <Mic size={16} strokeWidth={1.5} />
    </button>
  );
}
