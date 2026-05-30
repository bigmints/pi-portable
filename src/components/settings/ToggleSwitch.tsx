'use client';

import { useState, useEffect } from 'react';
import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, label, disabled }: ToggleSwitchProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={styles.toggleContainer}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`${styles.toggle} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}

export default ToggleSwitch;

