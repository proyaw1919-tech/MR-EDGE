// api/test-claude.js — Debug endpoint, remove after testing
const CANDIDATES = [
  "claude-opus-4-5",
  "claude-opus-4-5-20251101",
  "claude-sonnet-4-5",
  "claude-sonnet-4-5-20251022",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "claude-3-opus-20240229",
];

export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.claude;
  if (!apiKey) return res.json({ ok: false, error: "API key not set (tried ANTHROPIC_API_KEY and claude)" });

  const results = {};
  for (const model of CANDIDATES) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: "user", content: "Say OK" }],
        }),
      });
      const data = await r.json();
      results[model] = r.ok ? "✅ WORKS" : `❌ ${r.status}: ${data.error?.message || JSON.stringify(data)}`;
    } catch (e) {
      results[model] = `❌ ${String(e)}`;
    }
  }
  return res.json(results);
}
