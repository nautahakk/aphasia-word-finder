// Re-run a blind test set through the app's own code and write eval/RESULTS.md.
// Usage: TYPESAFE_API_KEY=... npm run eval        (UK set, ~420 API calls, a few cents)
//        TYPESAFE_API_KEY=... npm run eval:us     (US set -> eval/RESULTS-us.md)
//
// cases.json / cases-us.json: descriptions written by a separate AI agent to imitate
// aphasic speech as speech-to-text would transcribe it (British / American English).
// The agent never saw the method. They are SIMULATED - not real people with aphasia.
import { readFileSync, writeFileSync } from "node:fs";
import { findWord } from "../lib/guess.mjs";
import { DEMO_WORDS, DEMO_WORDS_US } from "../public/demo-words.js";

const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) { console.error("Set TYPESAFE_API_KEY first."); process.exit(1); }

const US = process.argv.includes("--us");
const locale = US ? "us" : "uk";
const personal = US ? DEMO_WORDS_US : DEMO_WORDS;
const suffix = US ? "-us" : "";
const cases = JSON.parse(readFileSync(new URL(`./cases${suffix}.json`, import.meta.url), "utf8"));
const firstHalf = (s) => { const w = s.trim().split(/\s+/); return w.slice(0, Math.ceil(w.length / 2)).join(" "); };
const rankIn = (res, accept) => { const i = res.guesses.findIndex((t) => accept.includes(t.word)); return i < 0 ? null : i + 1; };

const rows = [];
for (const c of cases) {
  const full = await findWord({ said: c.said, personal, locale, apiKey: KEY });
  const half = await findWord({ said: firstHalf(c.said), personal, locale, apiKey: KEY });
  rows.push({
    id: c.id, category: c.category, said: c.said, accept: c.accept,
    full: { rank: rankIn(full, c.accept), top: full.guesses.slice(0, 3).map((t) => [t.word, t.p]), unsure: full.unsure, ms: full.ms },
    half: { rank: rankIn(half, c.accept), unsure: half.unsure },
  });
  process.stdout.write(".");
}
console.log();
writeFileSync(new URL(`./results${suffix}.json`, import.meta.url), JSON.stringify(rows, null, 2));

const scored = rows.filter((r) => r.accept.length);
const unanswerable = rows.filter((r) => !r.accept.length);
const pct = (n, d) => `${n}/${d} (${Math.round((100 * n) / d)}%)`;
const within = (v, k) => scored.filter((r) => r[v].rank && r[v].rank <= k).length;
const ms = rows.map((r) => r.full.ms).sort((a, b) => a - b);
const q = (x) => ms[Math.floor(x * (ms.length - 1))];

const cats = {};
for (const r of scored) {
  cats[r.category] ??= { n: 0, t1: 0, t3: 0 };
  cats[r.category].n++;
  if (r.full.rank === 1) cats[r.category].t1++;
  if (r.full.rank && r.full.rank <= 3) cats[r.category].t3++;
}

const lines = [
  `# Evaluation results (${US ? "US" : "UK"} English)`,
  ``,
  `Run: ${new Date().toISOString().slice(0, 10)} · model: jev-latest · ${US ? "US" : "UK"} word list · ${rows.length} cases (${scored.length} answerable, ${unanswerable.length} unanswerable)`,
  ``,
  `> The descriptions are **simulated** aphasic speech written by a separate AI agent that never saw the method. Real aphasic speech, and real speech-to-text on it, will be harder. Treat these numbers as "the idea works", not "it works for patients".`,
  ``,
  `| | First guess right | Right word in the top 3 tiles |`,
  `|---|---|---|`,
  `| Full description | ${pct(within("full", 1), scored.length)} | ${pct(within("full", 3), scored.length)} |`,
  `| First half only (mid-sentence) | ${pct(within("half", 1), scored.length)} | ${pct(within("half", 3), scored.length)} |`,
  ``,
  `Unanswerable descriptions ("this one here you know") flagged as "keep going": ${unanswerable.filter((r) => r.full.unsure).length}/${unanswerable.length}`,
  ``,
  `Time for both requests: median ${q(0.5)} ms, 90th percentile ${q(0.9)} ms.`,
  ``,
  `## By category (full description)`,
  ``,
  `| Category | First guess | Top 3 |`,
  `|---|---|---|`,
  ...Object.entries(cats).map(([k, v]) => `| ${k} | ${v.t1}/${v.n} | ${v.t3}/${v.n} |`),
  ``,
  `## Not in the top 3`,
  ``,
  ...scored.filter((r) => !(r.full.rank && r.full.rank <= 3)).map((r) => `- **${r.accept.join(" / ")}** · said: "${r.said}" · got: ${r.full.top.map(([w, p]) => `${w} (${p})`).join(", ")}`),
  ``,
];
writeFileSync(new URL(`./RESULTS${suffix}.md`, import.meta.url), lines.join("\n"));
console.log(lines.slice(0, 16).join("\n"));
