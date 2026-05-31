'use client';

import { Cpu, Clock } from 'lucide-react';
import { formatTokens, formatDuration } from '@/lib/format';

interface StepStatsRowProps {
  tokens?: number;
  duration?: number;
}

export default function StepStatsRow({ tokens, duration }: StepStatsRowProps) {
  const displayTokens = tokens !== undefined ? formatTokens(tokens) : '—';
  const displayDuration = duration !== undefined ? formatDuration(duration) : '—';

  return (
    <div className="flex flex-wrap items-center gap-4 py-1.5 px-2.5 mt-1 bg-muted/30 border border-border/50 rounded-md text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5 min-w-0">
        <Cpu className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" strokeWidth={1.5} />
        <span className="truncate tabular-nums">{displayTokens}</span>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <Clock className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" strokeWidth={1.5} />
        <span className="truncate tabular-nums">{displayDuration}</span>
      </div>
    </div>
  );
}
