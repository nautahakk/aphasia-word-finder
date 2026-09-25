// Builds public/pictos.json: vocabulary word -> ARASAAC pictogram id.
// Run once (or after changing the vocabulary): npm run pictos
//
// Pictograms: ARASAAC (https://arasaac.org), author Sergio Palao, property of the
// Government of Aragón (Spain), licensed CC BY-NC-SA 4.0. Images are loaded from
// static.arasaac.org at runtime; this file only stores the ids.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { BASE_WORDS, groupOf } from "../lib/vocab.mjs";

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
function best(results, term, group) {
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

// keep ids already found (unless --all); only look up what's missing
const out = !REBUILD_ALL && existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
let missing = [];
const queue = BASE_WORDS.filter((w) => !out[w]);
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
