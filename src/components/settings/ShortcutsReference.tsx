'use client';

import { Keyboard } from 'lucide-react';

const shortcuts = [
  { key: '⌘K', action: 'Command Palette' },
  { key: '⌘N', action: 'New Conversation' },
  { key: '⌘B', action: 'Toggle Sidebar' },
  { key: 'Esc', action: 'Close Modal' },
  { key: '⌘[,⌘]', action: 'Prev/Next Tab' },
  { key: 'Enter', action: 'Send Message' },
  { key: 'Shift+Enter', action: 'New Line' },
];

export function ShortcutsReference() {
  return (
    <div className="space-y-2">
      {shortcuts.map(s => (
        <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{s.action}</span>
          <kbd style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--color-surface-2)', fontSize: '12px', fontFamily: 'monospace' }}>{s.key}</kbd>
        </div>
      ))}
    </div>
  );
}
