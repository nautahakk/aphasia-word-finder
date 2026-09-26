import { test } from "node:test";
import assert from "node:assert/strict";
import { findWord, TOP_PER_CHUNK } from "../lib/guess.mjs";
import { buildChunks, NONE } from "../lib/vocab.mjs";
import { DEMO_WORDS, DEMO_WORDS_US } from "../public/demo-words.js";

// A fake TypeSafe API: each step answers one request, in order.
function fakeApi(steps) {
  const calls = [];
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    const { status = 200, json } = step(body);
    return { status, ok: status >= 200 && status < 300, json: async () => json };
  };
  return { fetchImpl, calls };
}

const optionsOf = (q) => Object.keys(q.criteria).filter((w) => w !== NONE);
const favour = (words, word, p) => Object.fromEntries([...words.map((w) => [w, w === word ? p : 0]), [NONE, 1 - p]]);

const stage1 = (target) => (body) => ({
  json: {
    answers: Object.fromEntries(
      Object.entries(body.questions).map(([k, q]) => {
        const words = optionsOf(q);
        return [k, { probabilities: favour(words, words.includes(target) ? target : words[0], 0.5) }];
      }),
    ),
  },
});
const stage2 = (target, p = 0.8) => (body) => ({
  json: { answers: { final: { probabilities: favour(optionsOf(body.questions.final), target, p) } } },
});

test("asks every chunk first, then only the finalists", async () => {
  const api = fakeApi([stage1("kettle"), stage2("kettle")]);
  const out = await findWord({ said: "you boil water in it", personal: DEMO_WORDS, apiKey: "k", fetchImpl: api.fetchImpl });

  assert.equal(api.calls.length, 2);
  assert.equal(Object.keys(api.calls[0].questions).length, buildChunks(DEMO_WORDS).length);
  const finalists = optionsOf(api.calls[1].questions.final);
  assert.ok(finalists.length <= buildChunks(DEMO_WORDS).length * TOP_PER_CHUNK);
  assert.ok(finalists.includes("kettle"));
  assert.equal(out.guesses[0].word, "kettle");
  assert.equal(out.unsure, false);
});

test("sends what was said, who the person's words are, and nothing else personal", async () => {
  const api = fakeApi([stage1("Margaret"), stage2("Margaret")]);
  await findWord({ said: "the one i married", personal: DEMO_WORDS, apiKey: "k", fetchImpl: api.fetchImpl });
  const first = api.calls[0];
  assert.equal(first.state.said, "the one i married");
  assert.match(first.state.about_speaker, /Margaret \(my wife\)/);
  const people = Object.values(first.questions).find((q) => "Margaret" in q.criteria);
  assert.match(people.criteria.Margaret, /my wife/);
  assert.equal(people.criteria.wife, null);
});

test("retries once when Jev is overloaded (529)", async () => {
  const api = fakeApi([() => ({ status: 529, json: {} }), stage1("kettle"), stage2("kettle")]);
  const out = await findWord({ said: "boil water", personal: [], apiKey: "k", fetchImpl: api.fetchImpl });
  assert.equal(api.calls.length, 3);
  assert.equal(out.guesses[0].word, "kettle");
});

test("gives up with an error when Jev fails", async () => {
  const api = fakeApi([() => ({ status: 500, json: {} })]);
  await assert.rejects(findWord({ said: "x", personal: [], apiKey: "k", fetchImpl: api.fetchImpl }));
});

test("says 'keep going' when Jev isn't sure, and shows at most 3 guesses", async () => {
  const spread = (body) => {
    const words = optionsOf(body.questions.final);
    const probs = Object.fromEntries(words.map((w, i) => [w, i < 8 ? 0.05 : 0]));
    probs[NONE] = 0.6;
    return { json: { answers: { final: { probabilities: probs } } } };
  };
  const api = fakeApi([stage1("kettle"), spread]);
  const out = await findWord({ said: "the thing", personal: [], apiKey: "k", fetchImpl: api.fetchImpl });
  assert.equal(out.unsure, true);
  assert.ok(out.guesses.length <= 3);
});

test("US requests use the American word list and tell Jev it's American English", async () => {
  const api = fakeApi([stage1("cookie"), stage2("cookie")]);
  const out = await findWord({ said: "the sweet round thing you dunk", personal: DEMO_WORDS_US, locale: "us", apiKey: "k", fetchImpl: api.fetchImpl });
  const options = Object.values(api.calls[0].questions).flatMap(optionsOf);
  assert.ok(options.includes("cookie"));
  assert.ok(!options.includes("biscuit"));
  assert.equal(api.calls[0].state.speaks, "American English");
  assert.equal(out.guesses[0].word, "cookie");
});

test("UK requests are sent exactly as in the blind test, with no dialect hint", async () => {
  const api = fakeApi([stage1("kettle"), stage2("kettle")]);
  await findWord({ said: "boil water", personal: [], apiKey: "k", fetchImpl: api.fetchImpl });
  assert.deepEqual(Object.keys(api.calls[0].state).sort(), ["about_speaker", "said"]);
});
