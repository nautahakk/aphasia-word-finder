// Vercel serverless function: POST /api/guess
// Set TYPESAFE_API_KEY in the Vercel project's environment variables.
import { handleGuess } from "../lib/handler.mjs";
import { createLimiter } from "../lib/ratelimit.mjs";

const limiter = createLimiter({ perMinute: 30, perDay: Number(process.env.DAILY_LIMIT) || 20000 });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const ip = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown";
  const out = await handleGuess({ body, ip, env: process.env, limiter });
  res.setHeader("Cache-Control", "no-store");
  return res.status(out.status).json(out.json);
}
