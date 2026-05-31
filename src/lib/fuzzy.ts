// Simple fuzzy matching for command search
export function fuzzyMatch(query: string, items: string[]): { index: number; score: number }[] {
  const results: { index: number; score: number }[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i].toLowerCase();
    if (item.includes(lowerQuery)) {
      results.push({ index: i, score: 1 });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}
