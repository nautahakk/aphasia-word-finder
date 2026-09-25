import { test } from "node:test";
import assert from "node:assert/strict";
import { rankToTiles, isUnsure } from "../lib/tiles.mjs";

test("sorts by probability, drops none_of_these and tiny guesses, shows at most 6", () => {
  const probs = { kettle: 0.6, toaster: 0.2, none_of_these: 0.1, teapot: 0.05, a: 0.01, b: 0, c: 0.03, d: 0.04, e: 0.02, f: 0.02 };
  const tiles = rankToTiles(probs, []);
  assert.equal(tiles[0].word, "kettle");
  assert.ok(tiles.length <= 6);
  assert.ok(!tiles.some((t) => t.word === "none_of_these"));
  assert.ok(tiles.every((t) => t.p >= 0.02));
});

test("no filler tiles next to a confident guess", () => {
  const tiles = rankToTiles({ kettle: 0.97, "board game": 0.01, relieved: 0, none_of_these: 0.02 }, []);
  assert.deepEqual(tiles.map((t) => t.word), ["kettle"]);
});

test("still shows the single best guess when every guess is weak", () => {
  assert.deepEqual(rankToTiles({ x: 0.01, y: 0, none_of_these: 0.99 }, []).map((t) => t.word), ["x"]);
});

test("the person's own words carry who they are", () => {
  const tiles = rankToTiles({ Margaret: 0.7, wife: 0.3 }, [{ word: "Margaret", who: "my wife" }]);
  assert.deepEqual(tiles[0], { word: "Margaret", p: 0.7, group: "mine", who: "my wife" });
  assert.equal(tiles[1].group, "people");
  assert.equal(tiles[1].who, null);
});

test("'keep going' when none_of_these is high or the best guess is weak", () => {
  assert.equal(isUnsure([{ p: 0.9 }], 0.1), false);
  assert.equal(isUnsure([{ p: 0.9 }], 0.4), true);
  assert.equal(isUnsure([{ p: 0.2 }], 0), true);
  assert.equal(isUnsure([], 0), true);
});
