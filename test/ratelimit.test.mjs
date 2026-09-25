import { test } from "node:test";
import assert from "node:assert/strict";
import { createLimiter } from "../lib/ratelimit.mjs";

test("limits each visitor per minute", () => {
  let t = 0;
  const l = createLimiter({ perMinute: 2, now: () => t });
  assert.ok(l.check("a"));
  assert.ok(l.check("a"));
  assert.ok(!l.check("a"));
  assert.ok(l.check("b"), "other visitors are unaffected");
  t += 60_001;
  assert.ok(l.check("a"), "allowed again after a minute");
});

test("daily cap across everyone", () => {
  let t = 0;
  const l = createLimiter({ perMinute: 100, perDay: 2, now: () => t });
  assert.ok(l.check("a"));
  assert.ok(l.check("b"));
  assert.ok(!l.check("c"));
  t += 86_400_000;
  assert.ok(l.check("c"), "resets the next day");
});
