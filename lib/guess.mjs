// The word-finding method (the one that passed the blind test):
//   stage 1: one request, one Choice question per vocabulary chunk
//   stage 2: one Choice over the top few words from every chunk
import { NONE, buildChunks } from "./vocab.mjs";
import { systemOne } from "./jev.mjs";
import { rankToTiles, isUnsure } from "./tiles.mjs";

export const TOP_PER_CHUNK = 4;
export const INSTRUCTIONS =
  "A person with aphasia (word-finding difficulty after a stroke) is trying to say ONE word or short phrase but cannot find it. `said` is what they said instead, as rough speech-to-text: it may contain fillers, wrong related words, sound-alike errors or made-up words. Which option is the word they are trying to say? Choose none_of_these if no option fits.";

export function aboutSpeaker(personal) {
  if (!personal.length) return "No personal words were given.";
  const list = personal.map((p) => (p.who ? `${p.word} (${p.who})` : p.word)).join("; ");
  return `The speaker's own people, pets and places, with what each one is in the speaker's words: ${list}.`;
}

function choice(words, whoOf) {
  const criteria = {};
  for (const w of words) criteria[w] = whoOf.has(w) ? `The speaker's own word: ${whoOf.get(w) || "a personal word"}` : null;
  criteria[NONE] = "The word they are trying to say is not in this list.";
  return { type: "choice", instructions: INSTRUCTIONS, criteria };
}

function topWords(probabilities = {}, k) {
  return Object.entries(probabilities)
    .filter(([w]) => w !== NONE)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([w]) => w);
}

export async function findWord({ said, personal = [], locale = "uk", apiKey, fetchImpl }) {
  const chunks = buildChunks(personal, locale);
  const whoOf = new Map(personal.map((p) => [p.word, p.who]));
  const state = { about_speaker: aboutSpeaker(personal), said };
  // UK requests stay exactly as blind-tested; US ones say so ("pants" = trousers, "chips" = crisps)
  if (locale === "us") state.speaks = "American English";

  const q1 = {};
  chunks.forEach((c, i) => { q1[`c${i}`] = choice(c.words, whoOf); });
  const s1 = await systemOne({ apiKey, state, questions: q1, fetchImpl });

  const finalists = [...new Set(chunks.flatMap((_, i) => topWords(s1.answers[`c${i}`]?.probabilities, TOP_PER_CHUNK)))];
  const s2 = await systemOne({ apiKey, state, questions: { final: choice(finalists, whoOf) }, fetchImpl });

  const probs = s2.answers.final?.probabilities ?? {};
  const pNone = probs[NONE] ?? 0;
  const ranked = rankToTiles(probs, personal);
  const unsure = isUnsure(ranked, pNone);
  // when it's only guessing, show fewer tiles so it doesn't look like it's flailing
  const guesses = unsure ? ranked.slice(0, 3) : ranked;
  return { guesses, unsure, pNone, ms: s1.ms + s2.ms };
}
