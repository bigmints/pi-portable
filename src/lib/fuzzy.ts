/**
 * Fuzzy string matching utility.
 * Case-insensitive, score based on consecutive matches, word boundaries, and match positions.
 */
export interface FuzzyMatchResult {
  index: number;
  score: number;
}

export function fuzzyMatch(query: string, targets: string[]): FuzzyMatchResult[] {
  if (!query) {
    return targets.map((_, index) => ({ index, score: 0 }));
  }

  const q = query.toLowerCase().trim();
  if (q === '') {
    return targets.map((_, index) => ({ index, score: 0 }));
  }

  const results: FuzzyMatchResult[] = [];

  targets.forEach((target, index) => {
    const t = target.toLowerCase();
    
    let qIdx = 0;
    let tIdx = 0;
    let score = 0;
    let consecutive = 0;
    let firstMatchIndex = -1;
    
    while (tIdx < t.length && qIdx < q.length) {
      if (t[tIdx] === q[qIdx]) {
        if (firstMatchIndex === -1) {
          firstMatchIndex = tIdx;
        }
        
        // Base match score
        score += 10;
        
        // Consecutive match bonus
        if (consecutive > 0) {
          score += 15 * consecutive;
        }
        consecutive++;
        
        // Word boundary bonus
        if (tIdx === 0 || t[tIdx - 1] === ' ' || t[tIdx - 1] === '-' || t[tIdx - 1] === '_') {
          score += 30;
        }
        
        qIdx++;
      } else {
        consecutive = 0;
      }
      tIdx++;
    }
    
    // If we matched the entire query sequence
    if (qIdx === q.length) {
      // Exact start match bonus
      if (firstMatchIndex === 0) {
        score += 50;
      }
      
      // Position penalty: matches that start later score slightly lower
      score -= firstMatchIndex;
      
      // Exact match bonus
      if (t === q) {
        score += 100;
      }
      
      results.push({ index, score });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}
