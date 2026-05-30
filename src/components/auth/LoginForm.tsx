'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/chat';

  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), remember }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed. Please check your token.');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      router.push(data.redirect || callbackUrl);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  }, [token, remember, callbackUrl, router]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Token field */}
      <div className="space-y-1.5">
        <label htmlFor="token" className="block text-sm font-medium text-foreground/80">
          API Token
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <KeyRound size={16} strokeWidth={1.5} />
          </div>
          <input
            ref={inputRef}
            id="token"
            type={showToken ? 'text' : 'password'}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all disabled:opacity-50"
            placeholder="Enter your API token..."
            value={token}
            onChange={(e) => { setToken(e.target.value); if (error) setError(null); }}
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
            aria-invalid={!!error}
          />
          <button
            type="button"
            onClick={() => setShowToken(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showToken ? 'Hide token' : 'Show token'}
            tabIndex={-1}
          >
            {showToken ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div
          onClick={() => setRemember(p => !p)}
          className={`flex h-4 w-4 items-center justify-center rounded border border-border transition-colors ${remember ? "bg-violet-600 border-violet-600" : "bg-background"}`}
        >
          {remember && <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className="text-sm text-muted-foreground">Remember me for 30 days</span>
      </label>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle size={14} strokeWidth={2} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !token.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-violet-500/20"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" /> Signing in...</>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground/50">
        Any valid token (\u226510 chars, alphanumeric) is accepted
      </p>
    </form>
  );
}
