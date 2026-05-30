/**
 * Duration counter — self-contained timer that updates every second
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './DurationCounter.module.css';

interface DurationCounterProps {
  startedAt: number;
}

export default function DurationCounter({ startedAt }: DurationCounterProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateElapsed = useCallback(() => {
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
  }, [startedAt]);

  useEffect(() => {
    updateElapsed();
    intervalRef.current = setInterval(updateElapsed, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateElapsed]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className={styles.duration}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
