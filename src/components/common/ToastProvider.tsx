'use client';

import ToastContainer from './ToastContainer';

/**
 * ToastProvider — mounts the toast container once at the app level.
 * Import and render this in your root layout or app shell.
 */
export default function ToastProvider() {
  return <ToastContainer />;
}
