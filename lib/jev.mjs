// Minimal client for TypeSafe's System One endpoint (the Jev model).
// Docs: https://docs.typesafe.ai/api
const ENDPOINT = "https://api.typesafe.ai/v1/systemone";
const RETRYABLE = new Set([503, 529]); // 529 = "system_overloaded"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function systemOne({ apiKey, state, questions, fetchImpl = fetch, timeoutMs = 6000, retries = 1, model = "jev-latest" }) {
  for (let attempt = 0; ; attempt++) {
    const t0 = Date.now();
    let res;
    try {
      res = await fetchImpl(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, state, questions }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      if (attempt < retries) continue;
      throw new Error(`Jev request failed: ${err.message}`);
    }
    if (RETRYABLE.has(res.status) && attempt < retries) {
      await sleep(400 * (attempt + 1));
      continue;
    }
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.answers) throw new Error(`Jev returned ${res.status}`);
    return { answers: body.answers, ms: Date.now() - t0 };
  }
}
