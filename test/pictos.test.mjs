import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { US_PICTURE_WORDS, US_COLLISIONS } from "../lib/vocab.mjs";

const load = (name) => JSON.parse(readFileSync(new URL(`../public/${name}`, import.meta.url), "utf8"));

test("words that mean something else in America get their own picture", () => {
  const us = load("pictos-us.json");
  assert.ok(US_COLLISIONS.length >= 3, US_COLLISIONS.join(", "));
  for (const w of US_COLLISIONS) assert.ok(us[w], w);
});

test("almost every American word has a picture", () => {
  const us = load("pictos-us.json");
  const have = US_PICTURE_WORDS.filter((w) => us[w]).length;
  assert.ok(have / US_PICTURE_WORDS.length >= 0.9, `${have}/${US_PICTURE_WORDS.length}`);
});

test("hand-checked picture fixes are in place (no pothole for 'plant pot')", async () => {
  const { FIXED, FIXED_US } = await import("../scripts/picto-fixes.mjs");
  const { US_FROM } = await import("../lib/vocab.mjs");
  const uk = load("pictos.json");
  const us = load("pictos-us.json");
  for (const [w, id] of Object.entries(FIXED)) assert.equal(uk[w] ?? null, id, `UK ${w}`);
  for (const [w, from] of US_FROM) {
    if (w in FIXED_US) assert.equal(us[w] ?? null, FIXED_US[w], `US ${w}`);
    else if (from in FIXED) assert.equal(us[w] ?? null, FIXED[from], `US ${w} (from ${from})`);
  }
});
