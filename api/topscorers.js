// api/topscorers.js — Top scorers per competition (football-data.org)

const LEAGUE_CODE_MAP = {
  EPL:          'PL',
  Championship: 'ELC',
  LaLiga:       'PD',
  SerieA:       'SA',
  Bundesliga:   'BL1',
  Ligue1:       'FL1',
  Eredivisie:   'DED',
  PrimeiraLiga: 'PPL',
  UCL:          'CL',
  UEL:          'EL',
  Brasileirao:  'BSA',
};

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
  "Barça": "Barcelona", "Atleti": "Atletico Madrid",
  "Man Utd": "Man United", "Man. United": "Man United", "Man. City": "Man City",
  "Nott'm Forest": "Nottingham Forest", "Juve": "Juventus", "BVB": "Borussia Dortmund",
  "FC Bayern": "Bayern Munich", "LOSC Lille": "Lille", "LOSC": "Lille",
};

function normalize(name) { return NAME_MAP[name] || name; }

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

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
  if (!apiKey) return res.status(200).json({ scorers: [] });

  const league = req.query.league || "EPL";
  const code = LEAGUE_CODE_MAP[league];
  if (!code) return res.status(200).json({ scorers: [] });

  try {
    const r = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/scorers?limit=20`,
      { headers: { "X-Auth-Token": apiKey } }
    );
    if (!r.ok) return res.status(200).json({ scorers: [] });

    const data = await r.json();
    const scorers = (data.scorers || []).map(s => ({
      name:   s.player?.name   || "Unknown",
      team:   normalize(s.team?.shortName || s.team?.name || "Unknown"),
      goals:  s.goals          ?? 0,
      assists: s.assists       ?? 0,
      played: s.playedMatches  ?? 0,
    }));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    return res.json({ scorers });
  } catch {
    return res.status(200).json({ scorers: [] });
  }
}
