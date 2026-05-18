// api/h2h.js — Head-to-head history for a match

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) {
  const local = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]} ${local.getUTCFullYear()}`;
}

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  const originOk = ALLOWED_ORIGINS.includes(origin);
  const refererOk = ALLOWED_ORIGINS.some(o => referer.startsWith(o));
  if (!originOk && !refererOk) return res.status(403).json({ error: "Forbidden" });
  if (originOk) res.setHeader("Access-Control-Allow-Origin", origin);

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return res.status(200).json({ h2h: null });

  const { matchId } = req.query;
  if (!matchId) return res.status(400).json({ error: "matchId required" });

  try {
    const r = await fetch(
      `https://api.football-data.org/v4/matches/${matchId}/head2head?limit=8`,
      { headers: { 'X-Auth-Token': apiKey } }
    );
    if (!r.ok) return res.status(200).json({ h2h: null });

    const data = await r.json();
    const agg  = data.aggregates || data.head2head || {};
    const homeTeamId = agg.homeTeam?.id;
    const matches = (data.matches || [])
      .filter(m => ['FINISHED','AWARDED'].includes(m.status))
      .slice(0, 6)
      .map(m => {
        const hg = m.score?.fullTime?.home ?? 0;
        const ag = m.score?.fullTime?.away ?? 0;
        return {
          date:      fmtDate(new Date(m.utcDate)),
          home:      m.homeTeam?.shortName || m.homeTeam?.name || '?',
          away:      m.awayTeam?.shortName || m.awayTeam?.name || '?',
          homeScore: hg,
          awayScore: ag,
        };
      });

    // Aggregate wins/draws/losses for each side
    const homeWins  = agg.homeTeam?.wins  ?? 0;
    const awayWins  = agg.awayTeam?.wins  ?? 0;
    const draws     = agg.homeTeam?.draws ?? 0;
    const total     = agg.numberOfMatches ?? matches.length;

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.json({
      h2h: { matches, homeWins, awayWins, draws, total }
    });
  } catch {
    return res.status(200).json({ h2h: null });
  }
}
