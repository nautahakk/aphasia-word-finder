import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRequest, InputError, MAX_SAID } from "../lib/validate.mjs";

test("cleans up whitespace", () => {
  assert.deepEqual(validateRequest({ said: "  the  hot\nthing " }), { said: "the hot thing", personal: [] });
});

test("rejects missing, empty or non-text input", () => {
  for (const body of [null, "text", {}, { said: "   " }, { said: 5 }]) {
    assert.throws(() => validateRequest(body), InputError, JSON.stringify(body));
  }
});

test("rejects input that is too long", () => {
  assert.throws(() => validateRequest({ said: "a".repeat(MAX_SAID + 1) }), InputError);
});

test("personal must be a list of at most 60", () => {
  assert.throws(() => validateRequest({ said: "x", personal: {} }), InputError);
  assert.throws(() => validateRequest({ said: "x", personal: Array(61).fill({ word: "a" }) }), InputError);
});

test("drops broken personal entries and duplicates", () => {
  const out = validateRequest({
    said: "x",
    personal: [
      { word: "Margaret", who: "my wife" },
      { word: "Margaret", who: "duplicate" },
      { word: "" },
      { word: "none_of_these" },
      { word: "x".repeat(41) },
      { nope: 1 },
      { word: " Leo " },
    ],
  });
  assert.deepEqual(out.personal, [
    { word: "Margaret", who: "my wife" },
    { word: "Leo", who: "" },
  ]);
});
