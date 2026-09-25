import { NONE, groupOf } from "./vocab.mjs";

/**
 * Turn Jev's final probabilities into the tiles the person sees.
 * Only guesses with a real chance are shown - padding with near-zero words
 * ("board game" next to a 97% "kettle") just confuses people.
 */
export function rankToTiles(probs, personal = [], { max = 6, minP = 0.02, min = 1 } = {}) {
  const who = new Map(personal.map((p) => [p.word, p.who]));
  const all = Object.entries(probs)
    .filter(([w]) => w !== NONE)
    .sort((a, b) => b[1] - a[1])
    .map(([word, p]) => ({
      word,
      p,
      group: who.has(word) ? "mine" : groupOf(word),
      who: who.get(word) || null,
    }));
  const shown = all.filter((t) => t.p >= minP).slice(0, max);
  return shown.length >= min ? shown : all.slice(0, min);
}

/** "Keep going" when Jev leans towards none-of-these or the best guess is weak. */
export const isUnsure = (tiles, pNone) => pNone >= 0.35 || (tiles[0]?.p ?? 0) < 0.3;
