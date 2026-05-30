'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;

function generateId(): string {
  return `toast-${++toastIdCounter}-${Date.now()}`;
}

const toasts: ToastData[] = [];

export function showToast(message: string, type: ToastType = 'success'): string {
  const id = generateId();
  const toast: ToastData = { id, message, type };
  toasts.push(toast);
  notifyListeners();
  return id;
}

export function removeToast(id: string): void {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
    notifyListeners();
  }
}

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getToasts(): ToastData[] {
  return [...toasts];
}

function ToastItem({ toast }: { toast: ToastData }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      removeToast(toast.id);
    }, 3000);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast.id]);

  const icon =
    toast.type === 'success' ? (
      <CheckCircle size={18} strokeWidth={1.5} />
    ) : toast.type === 'error' ? (
      <AlertCircle size={18} strokeWidth={1.5} />
    ) : (
      <CheckCircle size={18} strokeWidth={1.5} />
    );

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.dismiss}
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastData[]>(getToasts());

  const handleUpdate = useCallback(() => {
    setCurrentToasts(getToasts());
  }, []);

  useEffect(() => {
    return subscribe(handleUpdate);
  }, [handleUpdate]);

  return (
    <div className={styles.container}>
      {currentToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
