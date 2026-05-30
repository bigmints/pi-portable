import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Terminal } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in \u2014 pi',
  description: 'Sign in to pi with your API token',
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-4">
      {/* Subtle gradient bg */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_60%)]" />

      <div className="relative w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30">
            <Terminal className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to pi</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to start coding with AI</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground/50">
          pi CLI \u00b7 Powered by {' '}
          <span className="text-violet-400">@earendil-works/pi-coding-agent</span>
        </p>
      </div>
    </div>
  );
}
