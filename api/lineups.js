// api/lineups.js — Fetch confirmed match lineups from football-data.org
// Env var required: FOOTBALL_DATA_API_KEY

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "https://mr-edge.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");

  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  const originOk = ALLOWED_ORIGINS.includes(origin);
  const refererOk = ALLOWED_ORIGINS.some(o => referer.startsWith(o));
  if (!originOk && !refererOk) return res.status(403).json({ error: "Forbidden" });
  if (originOk) res.setHeader("Access-Control-Allow-Origin", origin);

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return res.status(200).json({ lineup: null });

  const { matchId } = req.query;
  if (!matchId) return res.status(200).json({ lineup: null });

  try {
    const r = await fetch(`https://api.football-data.org/v4/matches/${matchId}`, {
      headers: { "X-Auth-Token": apiKey }
    });
    if (!r.ok) return res.status(200).json({ lineup: null });
    const data = await r.json();

    const homeLineup = data.homeTeam?.lineup || [];
    const awayLineup = data.awayTeam?.lineup || [];
    if (!homeLineup.length && !awayLineup.length) return res.status(200).json({ lineup: null });

    return res.status(200).json({
      lineup: {
        home: {
          formation: data.homeTeam?.formation || null,
          starting: homeLineup.map(p => ({ name: p.name, position: p.position, shirt: p.shirtNumber })),
          bench: (data.homeTeam?.bench || []).map(p => ({ name: p.name, position: p.position })),
        },
        away: {
          formation: data.awayTeam?.formation || null,
          starting: awayLineup.map(p => ({ name: p.name, position: p.position, shirt: p.shirtNumber })),
          bench: (data.awayTeam?.bench || []).map(p => ({ name: p.name, position: p.position })),
        },
      }
    });
  } catch { return res.status(200).json({ lineup: null }); }
}
