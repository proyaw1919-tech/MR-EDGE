// api/standings.js — Returns league standings table

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
  "Nott'm Forest": "Nottingham Forest", "Nottm Forest": "Nottingham Forest",
  "Juve": "Juventus", "BVB": "Borussia Dortmund",
  "FC Bayern": "Bayern Munich", "LOSC Lille": "Lille", "LOSC": "Lille",
  "VfB Stuttgart": "Stuttgart", "VfL Wolfsburg": "Wolfsburg",
  "SC Freiburg": "Freiburg", "1. FSV Mainz 05": "Mainz",
  "Werder Bremen": "Werder Bremen", "1. FC Union Berlin": "Union Berlin",
  "Borussia Mönchengladbach": "Borussia Mönchengladbach",
  "Athletic Club": "Athletic Bilbao", "Real Betis Balompié": "Real Betis",
  "RC Celta de Vigo": "Celta Vigo", "RCD Mallorca": "Mallorca",
  "Real Sociedad de Fútbol": "Real Sociedad", "Deportivo Alavés": "Alaves",
  "Bologna FC 1909": "Bologna", "Torino FC": "Torino", "Udinese Calcio": "Udinese",
  "Genoa CFC": "Genoa", "Cagliari Calcio": "Cagliari",
  "Hellas Verona FC": "Hellas Verona", "Parma Calcio 1913": "Parma",
  "Stade Rennais FC 1901": "Rennes", "RC Strasbourg Alsace": "Strasbourg",
  "FC Nantes": "Nantes", "RC Lens": "Lens", "Toulouse FC": "Toulouse",
  "Stade Brestois 29": "Brest", "Le Havre AC": "Le Havre",
  "Eintracht Frankfurt": "Eintracht Frankfurt",
  "1. FC Heidenheim": "Heidenheim", "FC Augsburg": "Augsburg",
  "TSG Hoffenheim": "Hoffenheim", "VfL Bochum": "Bochum",
  "UD Las Palmas": "Las Palmas", "CD Leganés": "Leganés",
  "Real Valladolid CF": "Valladolid", "Venezia FC": "Venezia",
  "AC Monza": "Monza", "Stade de Reims": "Reims",
  "Montpellier HSC": "Montpellier", "AJ Auxerre": "Auxerre", "Angers SCO": "Angers",
  "HSV": "Hamburger SV", "FC St. Pauli": "St. Pauli",
};

function normalize(name) { return NAME_MAP[name] || name; }

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "https://mr-edge.vercel.app",
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
  if (!apiKey) return res.status(500).json({ error: "Server configuration error." });

  const league = req.query.league || "EPL";
  const code = LEAGUE_CODE_MAP[league];
  if (!code) return res.status(400).json({ error: "Unknown league." });

  try {
    // Fetch standings + recent matches in parallel for form calculation
    const dateFrom = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo   = new Date().toISOString().split('T')[0];

    const [standingsRes, matchesRes] = await Promise.all([
      fetch(`https://api.football-data.org/v4/competitions/${code}/standings`,
        { headers: { "X-Auth-Token": apiKey } }),
      fetch(`https://api.football-data.org/v4/competitions/${code}/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": apiKey } }),
    ]);

    if (!standingsRes.ok) return res.status(200).json({ standings: [], season: null });

    const data = await standingsRes.json();
    const standingsArr = data.standings || [];
    const total = standingsArr.find(s => s.type === "TOTAL") || standingsArr[0];
    const table = total?.table || [];

    // Extract home/away splits if available
    const homeTable = (standingsArr.find(s => s.type === "HOME") || {}).table || [];
    const awayTable = (standingsArr.find(s => s.type === "AWAY") || {}).table || [];

    // Build lookup maps: teamId → row
    const homeMap = {};
    for (const r of homeTable) homeMap[r.team?.id] = r;
    const awayMap = {};
    for (const r of awayTable) awayMap[r.team?.id] = r;

    // Build form map from recent matches { teamName: ["W","D","L",...] }
    const formMap = {};
    if (matchesRes.ok) {
      const matchData = await matchesRes.json();
      for (const m of (matchData.matches || [])) {
        const home = normalize(m.homeTeam.shortName || m.homeTeam.name);
        const away = normalize(m.awayTeam.shortName || m.awayTeam.name);
        const hg = m.score?.fullTime?.home;
        const ag = m.score?.fullTime?.away;
        if (hg === null || hg === undefined || ag === null || ag === undefined) continue;
        if (!formMap[home]) formMap[home] = [];
        if (!formMap[away]) formMap[away] = [];
        formMap[home].push(hg > ag ? "W" : hg < ag ? "L" : "D");
        formMap[away].push(ag > hg ? "W" : ag < hg ? "L" : "D");
      }
    }

    const standings = table.map(row => {
      const teamName = normalize(row.team.shortName || row.team.name);
      const recentForm = (formMap[teamName] || []).slice(-5);
      const teamId = row.team?.id;
      const hr = homeMap[teamId];
      const ar = awayMap[teamId];
      return {
        position: row.position,
        team: teamName,
        crest: row.team.crest || "",
        played: row.playedGames,
        won: row.won,
        draw: row.draw,
        lost: row.lost,
        gf: row.goalsFor,
        ga: row.goalsAgainst,
        gd: row.goalDifference,
        points: row.points,
        form: recentForm.join(","),
        // Home/Away splits
        homePlayed: hr?.playedGames ?? null,
        homeWon:    hr?.won         ?? null,
        homeDraw:   hr?.draw        ?? null,
        homeLost:   hr?.lost        ?? null,
        homeGf:     hr?.goalsFor    ?? null,
        homeGa:     hr?.goalsAgainst ?? null,
        awayPlayed: ar?.playedGames ?? null,
        awayWon:    ar?.won         ?? null,
        awayDraw:   ar?.draw        ?? null,
        awayLost:   ar?.lost        ?? null,
        awayGf:     ar?.goalsFor    ?? null,
        awayGa:     ar?.goalsAgainst ?? null,
      };
    });

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.json({ standings, season: data.season?.currentMatchday || null });
  } catch {
    return res.status(200).json({ standings: [], season: null });
  }
}
