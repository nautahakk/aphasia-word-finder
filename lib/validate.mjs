import { NONE } from "./vocab.mjs";

export const MAX_SAID = 400;
export const MAX_PERSONAL = 60;

export class InputError extends Error {}

const clean = (s) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");

/** Validate a /api/guess body. Throws InputError with a plain-English message. */
export function validateRequest(body) {
  if (!body || typeof body !== "object") throw new InputError("Send JSON with a 'said' field.");
  const said = clean(body.said);
  if (!said) throw new InputError("Say or type something first.");
  if (said.length > MAX_SAID) throw new InputError(`That's too long. Keep it under ${MAX_SAID} characters.`);

  const list = body.personal ?? [];
  if (!Array.isArray(list)) throw new InputError("'personal' must be a list.");
  if (list.length > MAX_PERSONAL) throw new InputError(`Too many personal words (the most is ${MAX_PERSONAL}).`);

  const personal = [];
  const seen = new Set();
  for (const entry of list) {
    const word = clean(entry?.word);
    const who = clean(entry?.who);
    if (!word || word.length > 40 || who.length > 100 || word === NONE || seen.has(word)) continue;
    seen.add(word);
    personal.push({ word, who });
  }
  return { said, personal };
}
