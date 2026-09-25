import { validateRequest, InputError } from "./validate.mjs";
import { findWord } from "./guess.mjs";

/** Shared by the local server and the Vercel function. Returns { status, json }. */
export async function handleGuess({ body, ip, env, limiter, fetchImpl, find = findWord }) {
  if (!env.TYPESAFE_API_KEY) {
    return { status: 500, json: { error: "The server has no TYPESAFE_API_KEY set." } };
  }
  if (limiter && !limiter.check(ip)) {
    return { status: 429, json: { error: "Too many guesses in a row. Wait a minute and try again." } };
  }
  let input;
  try {
    input = validateRequest(body);
  } catch (err) {
    if (err instanceof InputError) return { status: 400, json: { error: err.message } };
    throw err;
  }
  try {
    const out = await find({ ...input, apiKey: env.TYPESAFE_API_KEY, fetchImpl });
    return { status: 200, json: out };
  } catch (err) {
    console.error("guess failed:", err.message);
    return { status: 502, json: { error: "Couldn't reach the word service. Try again." } };
  }
}
