import { test } from "node:test";
import assert from "node:assert/strict";
import { BASE_WORDS, buildChunks, CHUNK_MAX, PERSONAL_CHUNK, groupOf, wordsFor, US_PICTURE_WORDS } from "../lib/vocab.mjs";
import { DEMO_WORDS, DEMO_WORDS_US } from "../public/demo-words.js";

test("base vocabulary has no exact duplicates", () => {
  assert.equal(new Set(BASE_WORDS).size, BASE_WORDS.length);
  assert.ok(BASE_WORDS.length > 850, `only ${BASE_WORDS.length} words`);
});

test("every chunk fits one Jev Choice question (<= 249 words + none_of_these)", () => {
  for (const c of buildChunks(DEMO_WORDS)) assert.ok(c.words.length <= CHUNK_MAX, `${c.name}: ${c.words.length}`);
});

test("the dog 'Biscuit' and the food 'biscuit' are both kept", () => {
  const all = buildChunks(DEMO_WORDS).flatMap((c) => c.words);
  assert.ok(all.includes("Biscuit"));
  assert.ok(all.includes("biscuit"));
});

test("personal words go into the people/places chunk", () => {
  const chunks = buildChunks(DEMO_WORDS);
  for (const d of DEMO_WORDS) assert.ok(chunks[PERSONAL_CHUNK].words.includes(d.word), d.word);
});

test("a personal word identical to a base word replaces it", () => {
  const all = buildChunks([{ word: "tea", who: "my evening meal" }]).flatMap((c) => c.words);
  assert.equal(all.filter((w) => w === "tea").length, 1);
});

test("lots of personal words overflow into extra chunks, all within the limit", () => {
  const many = Array.from({ length: 120 }, (_, i) => ({ word: `Person ${i}`, who: "a friend" }));
  const chunks = buildChunks(many);
  for (const c of chunks) assert.ok(c.words.length <= CHUNK_MAX);
  const all = chunks.flatMap((c) => c.words);
  for (const p of many) assert.equal(all.filter((w) => w === p.word).length, 1, p.word);
});

test("picture-board colour groups", () => {
  assert.equal(groupOf("kettle"), "thing");
  assert.equal(groupOf("wife"), "people");
  assert.equal(groupOf("walk"), "doing");
  assert.equal(groupOf("happy"), "feeling");
  assert.equal(groupOf("Monday"), "time");
  assert.equal(groupOf("not-a-word"), "thing");
});

test("the US list uses American words instead of British ones", () => {
  const us = wordsFor("us");
  for (const w of ["cookie", "sweater", "pants", "truck", "faucet", "mom", "cell phone", "vacation", "sidewalk", "take a shower"]) assert.ok(us.includes(w), w);
  for (const w of ["biscuit", "jumper", "trousers", "lorry", "tap", "mum", "mobile phone", "holiday", "pavement", "have a shower"]) assert.ok(!us.includes(w), w);
});

test("the UK list is the default and keeps its British words", () => {
  assert.deepEqual(buildChunks([], "uk"), buildChunks([]));
  assert.deepEqual(wordsFor("uk"), BASE_WORDS);
  assert.ok(BASE_WORDS.includes("biscuit") && !BASE_WORDS.includes("cookie"));
});

test("an unknown locale falls back to the UK list", () => {
  assert.deepEqual(buildChunks([], "fr"), buildChunks([], "uk"));
});

test("the US list has no duplicates and every chunk fits, with the US demo words", () => {
  const chunks = buildChunks(DEMO_WORDS_US, "us");
  for (const c of chunks) assert.ok(c.words.length <= CHUNK_MAX, `${c.name}: ${c.words.length}`);
  const all = chunks.flatMap((c) => c.words);
  assert.equal(new Set(all).size, all.length);
  assert.ok(wordsFor("us").length > 850, `only ${wordsFor("us").length} words`);
});

test("in the US list 'chips' are crisps and British chips become fries", () => {
  const us = wordsFor("us");
  assert.ok(us.includes("chips") && us.includes("fries") && !us.includes("crisps"));
});

test("American words keep their picture-board colour", () => {
  assert.equal(groupOf("mom"), "people");
  assert.equal(groupOf("take a shower"), "doing");
  assert.equal(groupOf("vacation"), "time");
  assert.equal(groupOf("sweater"), "thing");
});

test("every American word made it into the US list (none lost to a clash)", () => {
  const us = new Set(wordsFor("us"));
  assert.ok(US_PICTURE_WORDS.length > 100, String(US_PICTURE_WORDS.length));
  for (const w of US_PICTURE_WORDS) assert.ok(us.has(w), w);
});
