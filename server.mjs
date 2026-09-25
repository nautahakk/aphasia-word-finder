// Local server: serves public/ and POST /api/guess. No dependencies.
// Run: npm start   (needs TYPESAFE_API_KEY in the environment or in .env)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleGuess } from "./lib/handler.mjs";
import { createLimiter } from "./lib/ratelimit.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC = normalize(join(ROOT, "public"));
const PORT = Number(process.env.PORT) || 4391;

// tiny .env loader (only fills values that aren't already set)
const envFile = join(ROOT, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const limiter = createLimiter({ perMinute: 60 });

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function readJson(req, limit = 20_000) {
  return new Promise((resolve) => {
    let size = 0;
    const parts = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { resolve(null); req.destroy(); return; }
      parts.push(c);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(parts).toString("utf8"))); } catch { resolve(null); }
    });
    req.on("error", () => resolve(null));
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/guess") {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST." });
    const body = await readJson(req);
    const out = await handleGuess({ body, ip: req.socket.remoteAddress, env: process.env, limiter });
    return sendJson(res, out.status, out.json);
  }
  if (url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, hasKey: Boolean(process.env.TYPESAFE_API_KEY) });
  }

  let path = decodeURIComponent(url.pathname);
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(PUBLIC, path));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403).end(); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(PORT, () => {
  console.log(`Word Finder: http://localhost:${PORT}`);
  if (!process.env.TYPESAFE_API_KEY) console.warn("Warning: TYPESAFE_API_KEY is not set - guesses will fail.");
});
