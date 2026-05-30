'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Lightbox.module.css';

interface LightboxProps {
  imageSrc: string;
  onClose: () => void;
  filename: string;
}

export default function Lightbox({ imageSrc, onClose, filename }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        <img
          src={imageSrc}
          alt={filename}
          className={styles.image}
        />
        <div className={styles.caption}>{filename}</div>
      </div>
    </div>
  );
}
