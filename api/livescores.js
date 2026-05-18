// api/livescores.js — Returns currently live match scores (no cache)

const LEAGUE_CODES = new Set(['PL', 'ELC', 'PD', 'SA', 'BL1', 'FL1', 'DED', 'PPL', 'CL', 'EL', 'BSA', 'WC']);
const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED', 'HALF_TIME', 'EXTRA_TIME', 'PENALTY_SHOOTOUT']);

const NAME_MAP = {
  "Manchester City FC": "Man City", "Manchester United FC": "Man United",
  "Tottenham Hotspur FC": "Tottenham", "Tottenham Hotspur": "Tottenham",
  "Atlético Madrid": "Atletico Madrid", "Club Atlético de Madrid": "Atletico Madrid",
  "Paris Saint-Germain FC": "Paris Saint-Germain",
  "Newcastle United FC": "Newcastle United", "West Ham United FC": "West Ham United",
  "Wolverhampton Wanderers FC": "Wolves", "Wolverhampton Wanderers": "Wolves",
  "FC Bayern München": "Bayern Munich", "Bayern München": "Bayern Munich",
  "Bayer 04 Leverkusen": "Bayer Leverkusen", "RasenBallsport Leipzig": "RB Leipzig",
  "FC Internazionale Milano": "Inter Milan", "Atalanta BC": "Atalanta",
  "SS Lazio": "Lazio", "Juventus FC": "Juventus", "SSC Napoli": "Napoli",
  "AS Roma": "Roma", "AC Fiorentina": "Fiorentina",
  "Olympique de Marseille": "Marseille", "Olympique Lyonnais": "Lyon",
  "AS Monaco FC": "Monaco", "Brighton & Hove Albion FC": "Brighton",
  "Brighton & Hove Albion": "Brighton", "Arsenal FC": "Arsenal",
  "Chelsea FC": "Chelsea", "Liverpool FC": "Liverpool",
  "Nottingham Forest FC": "Nottingham Forest", "Aston Villa FC": "Aston Villa",
  "Barça": "Barcelona", "Atleti": "Atletico Madrid", "Atlético de M.": "Atletico Madrid",
  "Man Utd": "Man United", "Man. United": "Man United", "Man. City": "Man City",
  "Nott'm Forest": "Nottingham Forest", "Juve": "Juventus", "BVB": "Borussia Dortmund",
  "FC Bayern": "Bayern Munich", "LOSC Lille": "Lille", "LOSC": "Lille",
};

function normalize(name) { return NAME_MAP[name] || name; }

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "https://mr-edge.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
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
  if (!apiKey) return res.status(200).json({ live: [] });

  try {
    const today = new Date().toISOString().split('T')[0];
    const r = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`,
      { headers: { 'X-Auth-Token': apiKey } }
    );
    if (!r.ok) return res.status(200).json({ live: [] });

    const data = await r.json();
    const live = (data.matches || [])
      .filter(m => LIVE_STATUSES.has(m.status) && LEAGUE_CODES.has(m.competition?.code))
      .map(m => ({
        home: normalize(m.homeTeam.shortName || m.homeTeam.name),
        away: normalize(m.awayTeam.shortName || m.awayTeam.name),
        homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? 0,
        awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? 0,
        minute: m.minute || null,
        liveStatus: m.status,
      }));

    return res.json({ live });
  } catch {
    return res.status(200).json({ live: [] });
  }
}
