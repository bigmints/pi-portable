'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, ThemeMode } from '@/store/theme';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { mode, cycleMode } = useThemeStore();
  const icon = mode === 'dark' ? <Moon className="h-4 w-4" /> : mode === 'light' ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  const label: Record<ThemeMode, string> = { dark: 'Dark mode', light: 'Light mode', system: 'System theme' };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleMode}
      aria-label={label[mode]}
      className="text-foreground rounded-lg"
    >
      {icon}
    </Button>
  );
}


