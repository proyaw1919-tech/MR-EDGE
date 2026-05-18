// Vercel Serverless Function - Gemini API Proxy

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;
const ipLog = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (ipLog.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  ipLog.set(ip, timestamps);
  // Prevent unbounded memory growth
  if (ipLog.size > 10000) {
    for (const [k, v] of ipLog) { if (v.length === 0) ipLog.delete(k); }
  }
  return false;
}

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "https://mr-edge.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
}

const MODELS = [
  { name: "gemini-2.5-pro",                 api: "v1beta" }, // best accuracy
  { name: "gemini-2.5-pro-preview-05-06",   api: "v1beta" },
  { name: "gemini-2.5-pro-exp-03-25",       api: "v1beta" },
  { name: "gemini-2.5-flash",               api: "v1beta" }, // fallback
  { name: "gemini-2.5-flash-preview-04-17", api: "v1beta" },
  { name: "gemini-2.0-flash",               api: "v1beta" },
  { name: "gemini-1.5-pro",                 api: "v1beta" },
  { name: "gemini-1.5-flash",               api: "v1beta" },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  setSecurityHeaders(res);
  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";

  // CORS preflight
  if (req.method === "OPTIONS") {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    return res.status(204).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Origin / Referer check
  const originOk = ALLOWED_ORIGINS.includes(origin);
  const refererOk = ALLOWED_ORIGINS.some(o => referer.startsWith(o));
  if (!originOk && !refererOk) return res.status(403).json({ error: "Forbidden" });

  // Set CORS header only for allowed origins
  res.setHeader("Access-Control-Allow-Origin", origin);

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait an hour before predicting again." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server configuration error." });

  // Validate prompt
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.length > 12000) {
    return res.status(400).json({ error: "Invalid request." });
  }

  const generationConfig = { temperature: 0.6, maxOutputTokens: 8000 };
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });

  for (const { name, api } of MODELS) {
    // Try each model up to 2 times (retry once on 503/429)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/${api}/models/${name}:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body }
        );
        if (r.status === 404) break; // model doesn't exist, skip to next
        if (r.status === 503 || r.status === 429) {
          if (attempt === 0) { await sleep(1500); continue; } // wait then retry once
          break; // still failing, try next model
        }
        if (!r.ok) { await r.text(); break; }
        const data = await r.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) break;
        return res.status(200).json({ text, model: name });
      } catch { break; }
    }
  }

  return res.status(503).json({ error: "AI service is temporarily busy. Please try again in a moment." });
}
