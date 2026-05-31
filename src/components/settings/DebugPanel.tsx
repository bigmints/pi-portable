'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, GripVertical, Terminal } from 'lucide-react';
import styles from './DebugPanel.module.css';

interface WsMessage {
  id: number;
  timestamp: string;
  type: 'send' | 'recv' | 'error' | 'system';
  payload: string;
}

export default function DebugPanel({
  onClose,
  messages,
}: {
  onClose: () => void;
  messages: WsMessage[];
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const posRef = useRef({ x: 300, y: 60 });

  // Load position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('debug-panel-pos');
    if (saved) {
      try {
        posRef.current = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save position on move
  useEffect(() => {
    const save = () => localStorage.setItem('debug-panel-pos', JSON.stringify(posRef.current));
    window.addEventListener('storage', save);
    return () => window.removeEventListener('storage', save);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    draggingRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = posRef.current.x;
    const startTop = posRef.current.y;

    const handleMove = (me: MouseEvent) => {
      if (!draggingRef.current) return;
      posRef.current = {
        x: startLeft + (me.clientX - startX),
        y: startTop + (me.clientY - startY),
      };
      if (panelRef.current) {
        panelRef.current.style.left = `${posRef.current.x}px`;
        panelRef.current.style.top = `${posRef.current.y}px`;
      }
    };

    const handleUp = () => {
      draggingRef.current = false;
      localStorage.setItem('debug-panel-pos', JSON.stringify(posRef.current));
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const typeColors: Record<string, string> = {
    send: '#10b981',
    recv: '#3b82f6',
    error: '#ef4444',
    system: '#888888',
  };

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      // eslint-disable-next-line react-hooks/refs
      style={{ left: posRef.current.x, top: posRef.current.y }}
    >
      <div className={styles.header} onMouseDown={handleMouseDown}>
        <div className={styles.dragHandle}>
          <GripVertical size={14} />
        </div>
        <div className={styles.title}>
          <Terminal size={14} />
          <span>Debug Panel</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div ref={logRef} className={styles.log}>
        {messages.length === 0 && (
          <div className={styles.empty}>No messages yet</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={styles.logEntry}>
            <span className={styles.timestamp}>{msg.timestamp}</span>
            <span
              className={styles.badge}
              style={{ background: typeColors[msg.type] || '#888' }}
            >
              {msg.type}
            </span>
            <span className={styles.payload}>{msg.payload}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
