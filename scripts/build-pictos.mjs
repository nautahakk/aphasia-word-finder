// Builds public/pictos.json (vocabulary word -> ARASAAC pictogram id) and
// public/pictos-us.json (the American words of the US list).
// Run once (or after changing the vocabulary): npm run pictos
//
// Pictograms: ARASAAC (https://arasaac.org), author Sergio Palao, property of the
// Government of Aragón (Spain), licensed CC BY-NC-SA 4.0. Images are loaded from
// static.arasaac.org at runtime; this file only stores the ids.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { BASE_WORDS, groupOf, US_PICTURE_WORDS, US_COLLISIONS, US_FROM } from "../lib/vocab.mjs";
import { FIXED, FIXED_US } from "./picto-fixes.mjs";

const REBUILD_ALL = process.argv.includes("--all");

const API = "https://api.arasaac.org/v1/pictograms/en/search/";
const OUT = new URL("../public/pictos.json", import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ARASAAC's English keywords are often American or more general - try these next.
// Only close stand-ins; words with no honest stand-in keep initials instead.
const ALIASES = {
  aftershave: ["cologne"], allotment: ["vegetable garden"], builder: ["bricklayer", "construction worker"],
  cornflakes: ["corn flakes", "cereal"], "fed up": ["bored"], fingernail: ["nails", "fingernails"],
  goldfish: ["fish"], grandchildren: ["grandchild", "grandchildren"], grateful: ["thank you"],
  gravy: ["sauce"], hallway: ["corridor", "hall"], hurry: ["hurry up", "fast"], jigsaw: ["jigsaw puzzle", "puzzle"],
  letterbox: ["mailbox"], marmalade: ["jam"], mice: ["mouse"], mints: ["mint", "candy"],
  painkillers: ["pills", "pill"], paracetamol: ["pills", "pill"], physio: ["physiotherapist", "physiotherapy"],
  porridge: ["oatmeal"], puppy: ["dog"], robin: ["bird"], signature: ["sign", "to sign"], sleepy: ["tired", "sleep"],
  smoothie: ["milkshake", "juice"], sudoku: ["puzzle"], sweetcorn: ["corn", "sweet corn"], swelling: ["swollen"],
  teabag: ["tea bag"], thermostat: ["heating"], trifle: ["dessert"], upset: ["sad"], vicar: ["priest"],
  visitor: ["visit", "guest"], wellies: ["wellington boots", "rain boots", "boots"], boss: ["manager", "director"],
  pension: ["retirement"], anniversary: ["wedding anniversary", "celebration"],
};

async function search(term) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(API + encodeURIComponent(term), { signal: AbortSignal.timeout(15000) });
      if (res.status === 404) return [];
      if (!res.ok) throw new Error(String(res.status));
      return await res.json();
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }
  return [];
}

// ARASAAC keyword type: 2 = noun, 3 = verb. "watch" (on your wrist) must not get
// the "to watch" picture, so doing-words prefer verbs and everything else nouns.
function best(results, term, group, { exactOnly = false } = {}) {
  const t = term.toLowerCase();
  const wantVerb = group === "doing";
  let pick = null;
  let top = -1;
  for (const r of results) {
    if (r.sex || r.violence) continue;
    const kw = r.keywords?.find((k) => k.keyword?.toLowerCase() === t || k.plural?.toLowerCase() === t);
    const isVerb = kw ? kw.type === 3 : Boolean(r.tags?.includes("verb"));
    const score = (kw ? 2 : 0) + (isVerb === wantVerb ? 1 : 0);
    if (score > top) { top = score; pick = r; } // ties keep ARASAAC's own order
  }
  if (exactOnly && top < 2) return null;
  return pick?._id ?? null;
}

async function idFor(word) {
  const tries = [word, word.replace(/^(the|a|an) /i, ""), ...(ALIASES[word] ?? [])];
  for (const t of [...new Set(tries)]) {
    const id = best(await search(t), t, groupOf(word));
    if (id) return id;
  }
  return null;
}

// keep ids already found (unless --all); only look up what's missing.
// Hand-checked fixes always win and are never searched for.
const out = !REBUILD_ALL && existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const setOrClear = (map, w, id) => { if (id) map[w] = id; else delete map[w]; };
for (const [w, id] of Object.entries(FIXED)) setOrClear(out, w, id);
let missing = [];
const queue = BASE_WORDS.filter((w) => !out[w] && !(w in FIXED));
async function worker() {
  while (queue.length) {
    const w = queue.shift();
    const id = await idFor(w);
    if (id) out[w] = id; else missing.push(w);
    await sleep(120); // be polite to a free public service
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

const sorted = Object.fromEntries(BASE_WORDS.filter((w) => out[w]).map((w) => [w, out[w]]));
writeFileSync(OUT, JSON.stringify(sorted));
console.log(`pictograms: ${Object.keys(sorted).length}/${BASE_WORDS.length}`);
if (missing.length) console.log(`no pictogram: ${missing.sort().join(", ")}`);

// ---- American words ----
// Words that mean something else in Britain ("chips", "purse", "surgery") take the
// picture of the British word they replaced. The rest prefer an exact American match
// (ARASAAC's English is mostly American), else the British word's picture.
const US_ALIASES = {
  football: ["american football", "rugby ball"], baseball: ["baseball"], basketball: ["basketball"],
  Thanksgiving: ["thanksgiving", "turkey"],
};
const OUT_US = new URL("../public/pictos-us.json", import.meta.url);
const outUs = !REBUILD_ALL && existsSync(OUT_US) ? JSON.parse(readFileSync(OUT_US, "utf8")) : {};
// an American word inherits the fix of the British word it replaced
const usFix = (w) => (w in FIXED_US ? [true, FIXED_US[w]] : US_FROM.get(w) in FIXED ? [true, FIXED[US_FROM.get(w)]] : [false]);
for (const w of US_PICTURE_WORDS) { const [fixed, id] = usFix(w); if (fixed) setOrClear(outUs, w, id); }
async function usIdFor(w) {
  const from = US_FROM.get(w);
  const fromId = from ? sorted[from] : null;
  if (US_COLLISIONS.includes(w) && fromId) return fromId;
  for (const t of US_ALIASES[w] ?? []) {
    const id = best(await search(t), t, groupOf(w));
    if (id) return id;
  }
  return best(await search(w), w, groupOf(w), { exactOnly: true }) ?? fromId ?? (await idFor(w));
}
const missingUs = [];
for (const w of US_PICTURE_WORDS) {
  if (outUs[w] || usFix(w)[0]) continue;
  const id = await usIdFor(w);
  if (id) outUs[w] = id; else missingUs.push(w);
  await sleep(120);
}
const sortedUs = Object.fromEntries(US_PICTURE_WORDS.filter((w) => outUs[w]).map((w) => [w, outUs[w]]));
writeFileSync(OUT_US, JSON.stringify(sortedUs));
console.log(`US pictograms: ${Object.keys(sortedUs).length}/${US_PICTURE_WORDS.length}`);
if (missingUs.length) console.log(`no US pictogram: ${missingUs.sort().join(", ")}`);
