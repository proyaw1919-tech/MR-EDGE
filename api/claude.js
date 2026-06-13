// api/claude.js — Claude AI proxy (Opus 4.8 primary, Sonnet 4.6 fallback)

const MODELS = [
  "claude-opus-4-8",
  "claude-sonnet-4-6",
];

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "https://mr-edge.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

const RATE_LIMIT = 10;
const WINDOW_MS  = 60 * 60 * 1000;
const ipLog      = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (ipLog.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  ipLog.set(ip, timestamps);
  if (ipLog.size > 10000) {
    for (const [k, v] of ipLog) { if (v.length === 0) ipLog.delete(k); }
  }
  return false;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  const origin  = req.headers.origin  || "";
  const referer = req.headers.referer || "";

  if (req.method === "OPTIONS") {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    return res.status(204).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const originOk  = ALLOWED_ORIGINS.includes(origin);
  const refererOk = ALLOWED_ORIGINS.some(o => referer.startsWith(o));
  if (!originOk && !refererOk) return res.status(403).json({ error: "Forbidden" });
  res.setHeader("Access-Control-Allow-Origin", origin);

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait an hour before predicting again." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.claude;
  if (!apiKey) return res.status(500).json({ error: "Server configuration error." });

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.length > 15000) {
    return res.status(400).json({ error: "Invalid request." });
  }

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type":      "application/json",
            "x-api-key":         apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 12000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (r.status === 529 || r.status === 503 || r.status === 429) {
          if (attempt === 0) { await sleep(1500); continue; }
          break;
        }
        if (r.status === 404) break;
        if (!r.ok) { await r.text(); break; }

        const data = await r.json();
        const text = data.content?.[0]?.text || "";
        if (!text) break;
        return res.status(200).json({ text, model });
      } catch { break; }
    }
  }

  return res.status(503).json({ error: "AI service is temporarily busy. Please try again in a moment." });
}
