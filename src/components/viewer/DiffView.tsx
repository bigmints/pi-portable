/**
 * DiffView — renders a unified diff with color-coded lines and dual line number gutter
 */

'use client';

import type { DiffLine } from '@/lib/compute-diff';
import styles from './DiffView.module.css';

interface DiffViewProps {
  diffLines: DiffLine[];
}

export default function DiffView({ diffLines }: DiffViewProps) {
  return (
    <div className={styles.container} role="region" aria-label="File diff view">
      <table className={styles.table}>
        <tbody>
          {diffLines.map((line, idx) => (
            <tr
              key={idx}
              className={styles[line.type]}
            >
              {/* Original line number gutter */}
              <td className={styles.gutter}>
                <span className={styles.originalLineNum}>
                  {line.originalLine ?? ''}
                </span>
              </td>
              {/* Modified line number gutter */}
              <td className={styles.gutter}>
                <span className={styles.modifiedLineNum}>
                  {line.modifiedLine ?? ''}
                </span>
              </td>
              {/* Line content */}
              <td className={styles.content}>
                <span className={styles.prefix}>
                  {line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ' '}
                </span>
                <code>{line.text || ' '}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
