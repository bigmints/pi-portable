'use client';

import React, { KeyboardEvent } from 'react';
import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={disabled ? -1 : 0}
      className={`${styles.switch} ${checked ? styles.checked : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.slider} />
    </div>
  );
}
