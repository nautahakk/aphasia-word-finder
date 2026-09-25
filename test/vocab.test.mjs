import { test } from "node:test";
import assert from "node:assert/strict";
import { BASE_WORDS, buildChunks, CHUNK_MAX, PERSONAL_CHUNK, groupOf } from "../lib/vocab.mjs";
import { DEMO_WORDS } from "../public/demo-words.js";

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
