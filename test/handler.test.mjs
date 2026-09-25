import { test } from "node:test";
import assert from "node:assert/strict";
import { handleGuess } from "../lib/handler.mjs";
import { createLimiter } from "../lib/ratelimit.mjs";

const ENV = { TYPESAFE_API_KEY: "k" };
const okFind = async () => ({ guesses: [{ word: "kettle", p: 0.9, group: "thing", who: null }], unsure: false, pNone: 0.05, ms: 10 });

test("500 when the server has no API key", async () => {
  const r = await handleGuess({ body: { said: "x" }, env: {}, find: okFind });
  assert.equal(r.status, 500);
});

test("400 with a plain message on bad input", async () => {
  const r = await handleGuess({ body: {}, env: ENV, find: okFind });
  assert.equal(r.status, 400);
  assert.match(r.json.error, /Say or type/);
});

test("429 when one visitor asks too often", async () => {
  const limiter = createLimiter({ perMinute: 1 });
  const a = await handleGuess({ body: { said: "x" }, ip: "1", env: ENV, limiter, find: okFind });
  const b = await handleGuess({ body: { said: "x" }, ip: "1", env: ENV, limiter, find: okFind });
  assert.equal(a.status, 200);
  assert.equal(b.status, 429);
});

test("502 when the word service fails", async () => {
  const r = await handleGuess({ body: { said: "x" }, env: ENV, find: async () => { throw new Error("boom"); } });
  assert.equal(r.status, 502);
});

test("passes cleaned input and the key to the finder", async () => {
  let seen;
  await handleGuess({
    body: { said: "  hi  there ", personal: [{ word: "Leo", who: "grandson" }] },
    env: ENV,
    find: async (args) => { seen = args; return okFind(); },
  });
  assert.equal(seen.said, "hi there");
  assert.equal(seen.apiKey, "k");
  assert.deepEqual(seen.personal, [{ word: "Leo", who: "grandson" }]);
});
