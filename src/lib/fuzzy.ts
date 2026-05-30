import type { SlashCommand } from '@/types/chat';

interface FuzzyResult {
  item: SlashCommand;
  score: number;
}

function computeScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) {
    return 1000;
  }
  if (t.startsWith(q)) {
    return 500;
  }
  if (t.includes(q)) {
    return 100;
  }
  // Fuzzy: check if all query chars appear in order
  let qi = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      consecutive++;
      if (consecutive > maxConsecutive) {
        maxConsecutive = consecutive;
      }
      qi++;
    } else {
      consecutive = 0;
    }
  }
  if (qi === q.length) {
    // All chars matched in order
    return maxConsecutive * 10 + (t.length - q.length) * -1;
  }
  return 0;
}

export function fuzzyMatch(query: string, items: SlashCommand[]): SlashCommand[] {
  if (!query || query.length === 0) {
    return items;
  }

  const results: FuzzyResult[] = [];

  for (const item of items) {
    const nameScore = computeScore(query, item.name);
    const descScore = computeScore(query, item.description);
    const score = Math.max(nameScore, descScore);
    if (score > 0) {
      results.push({ item, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.map((r) => r.item);
}
