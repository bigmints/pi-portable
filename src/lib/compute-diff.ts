/**
 * Compute unified diff between two text strings.
 * Returns an array of diff lines with type, line numbers, and text.
 */

export interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged';
  originalLine?: number;
  modifiedLine?: number;
  text: string;
}

/**
 * Simple LCS-based diff algorithm.
 * Compares two texts line-by-line and produces a unified diff.
 */
export function computeUnifiedDiff(
  original: string,
  modified: string
): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  const m = origLines.length;
  const n = modLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find the diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      stack.push({ type: 'unchanged', originalLine: i, modifiedLine: j, text: origLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', modifiedLine: j, text: modLines[j - 1] });
      j--;
    } else if (i > 0) {
      stack.push({ type: 'deleted', originalLine: i, text: origLines[i - 1] });
      i--;
    }
  }

  // Reverse to get correct order
  for (let k = stack.length - 1; k >= 0; k--) {
    result.push(stack[k]);
  }

  return result;
}
