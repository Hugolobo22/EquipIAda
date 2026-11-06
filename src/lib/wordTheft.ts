const WORDS = /[\p{L}\p{N}]+/gu;

function eligibleWords(question: string) {
  return [...question.matchAll(WORDS)].filter(match => Array.from(match[0]).length >= 4);
}

export function canStealWords(question: string) {
  return eligibleWords(question).length >= 2;
}

/** Apenas uma prévia. A pergunta original nunca é modificada. */
export function createWordTheftPreview(question: string, restoredWords: readonly number[] = []) {
  const words = [...question.matchAll(WORDS)];
  const candidates = words.filter(match => Array.from(match[0]).length >= 4);
  if (candidates.length < 2) return question;

  const stolen = [
    candidates[Math.floor(candidates.length / 3)],
    candidates[Math.floor(2 * candidates.length / 3)],
  ];
  const restored = new Set(restoredWords);
  let preview = "";
  let cursor = 0;
  for (const word of words) {
    const start = word.index ?? cursor;
    preview += question.slice(cursor, start);
    const stolenIndex = stolen.indexOf(word);
    preview += stolenIndex >= 0 && !restored.has(stolenIndex)
      ? "▯".repeat(Math.min(Array.from(word[0]).length, 8))
      : word[0];
    cursor = start + word[0].length;
  }
  return preview + question.slice(cursor);
}
