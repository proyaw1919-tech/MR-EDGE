// api/teamstats.js — Team xG-level statistics from Sofascore via RapidAPI

// Sofascore { teamId, tournamentId, seasonId } per normalised team name
const TEAM_MAP = {
  // EPL (t=17, s=76986)
  "Arsenal":             { id: 42,    t: 17, s: 76986 },
  "Man City":            { id: 17,    t: 17, s: 76986 },
  "Man United":          { id: 35,    t: 17, s: 76986 },
  "Liverpool":           { id: 44,    t: 17, s: 76986 },
  "Chelsea":             { id: 38,    t: 17, s: 76986 },
  "Tottenham":           { id: 33,    t: 17, s: 76986 },
  "Aston Villa":         { id: 40,    t: 17, s: 76986 },
  "Newcastle United":    { id: 39,    t: 17, s: 76986 },
  "Brighton":            { id: 30,    t: 17, s: 76986 },
  "West Ham United":     { id: 37,    t: 17, s: 76986 },
  "Wolves":              { id: 3,     t: 17, s: 76986 },
  "Nottingham Forest":   { id: 14,    t: 17, s: 76986 },
  "Brentford":           { id: 55,    t: 17, s: 76986 },
  "Fulham":              { id: 43,    t: 17, s: 76986 },
  "Crystal Palace":      { id: 7,     t: 17, s: 76986 },
  "Everton":             { id: 48,    t: 17, s: 76986 },
  "Bournemouth":         { id: 60,    t: 17, s: 76986 },
  "Southampton":         { id: 45,    t: 17, s: 76986 },
  "Ipswich":             { id: 6,     t: 17, s: 76986 },
  "Leicester":           { id: 31,    t: 17, s: 76986 },
  // LaLiga (t=8, s=77559)
  "Real Madrid":         { id: 2829,  t: 8,  s: 77559 },
  "Barcelona":           { id: 2817,  t: 8,  s: 77559 },
  "Atletico Madrid":     { id: 2836,  t: 8,  s: 77559 },
  "Sevilla":             { id: 2833,  t: 8,  s: 77559 },
  "Athletic Bilbao":     { id: 2825,  t: 8,  s: 77559 },
  "Real Betis":          { id: 2838,  t: 8,  s: 77559 },
  "Villarreal":          { id: 2819,  t: 8,  s: 77559 },
  "Real Sociedad":       { id: 2830,  t: 8,  s: 77559 },
  "Osasuna":             { id: 2820,  t: 8,  s: 77559 },
  "Girona":              { id: 14232, t: 8,  s: 77559 },
  "Celta Vigo":          { id: 2821,  t: 8,  s: 77559 },
  "Valencia":            { id: 2828,  t: 8,  s: 77559 },
  "Getafe":              { id: 2826,  t: 8,  s: 77559 },
  "Rayo Vallecano":      { id: 2823,  t: 8,  s: 77559 },
  "Mallorca":            { id: 2827,  t: 8,  s: 77559 },
  "Alaves":              { id: 2832,  t: 8,  s: 77559 },
  "Las Palmas":          { id: 6912,  t: 8,  s: 77559 },
  "Espanol":             { id: 2816,  t: 8,  s: 77559 },
  "Leganes":             { id: 6351,  t: 8,  s: 77559 },
  // Bundesliga (t=35, s=77333)
  "Bayern Munich":       { id: 2672,  t: 35, s: 77333 },
  "Borussia Dortmund":   { id: 2673,  t: 35, s: 77333 },
  "Bayer Leverkusen":    { id: 2677,  t: 35, s: 77333 },
  "RB Leipzig":          { id: 35207, t: 35, s: 77333 },
  "Eintracht Frankfurt": { id: 2674,  t: 35, s: 77333 },
  "Stuttgart":           { id: 2671,  t: 35, s: 77333 },
  "Wolfsburg":           { id: 2679,  t: 35, s: 77333 },
  "Freiburg":            { id: 2076,  t: 35, s: 77333 },
  "Mainz":               { id: 2680,  t: 35, s: 77333 },
  "Hoffenheim":          { id: 2678,  t: 35, s: 77333 },
  "Augsburg":            { id: 2675,  t: 35, s: 77333 },
  "Union Berlin":        { id: 10189, t: 35, s: 77333 },
  "Werder Bremen":       { id: 2076,  t: 35, s: 77333 },
  "Heidenheim":          { id: 12987, t: 35, s: 77333 },
  "St. Pauli":           { id: 14873, t: 35, s: 77333 },
  "Hamburger SV":        { id: 2681,  t: 35, s: 77333 },
  // SerieA (t=23, s=76457)
  "Inter Milan":         { id: 2697,  t: 23, s: 76457 },
  "AC Milan":            { id: 2699,  t: 23, s: 76457 },
  "Juventus":            { id: 2686,  t: 23, s: 76457 },
  "Roma":                { id: 2696,  t: 23, s: 76457 },
  "Napoli":              { id: 2714,  t: 23, s: 76457 },
  "Fiorentina":          { id: 2698,  t: 23, s: 76457 },
  "Atalanta":            { id: 2692,  t: 23, s: 76457 },
  "Lazio":               { id: 2690,  t: 23, s: 76457 },
  "Torino":              { id: 2700,  t: 23, s: 76457 },
  "Bologna":             { id: 2693,  t: 23, s: 76457 },
  "Udinese":             { id: 2704,  t: 23, s: 76457 },
  "Empoli":              { id: 2703,  t: 23, s: 76457 },
  "Genoa":               { id: 2705,  t: 23, s: 76457 },
  "Cagliari":            { id: 2706,  t: 23, s: 76457 },
  "Hellas Verona":       { id: 2713,  t: 23, s: 76457 },
  "Parma":               { id: 2709,  t: 23, s: 76457 },
  "Venezia":             { id: 7400,  t: 23, s: 76457 },
  "Monza":               { id: 22326, t: 23, s: 76457 },
  "Lecce":               { id: 4483,  t: 23, s: 76457 },
  "Como":                { id: 9889,  t: 23, s: 76457 },
  // Ligue 1 (t=34, s=77356)
  "Paris Saint-Germain": { id: 1644,  t: 34, s: 77356 },
  "Marseille":           { id: 1641,  t: 34, s: 77356 },
  "Lyon":                { id: 1643,  t: 34, s: 77356 },
  "Monaco":              { id: 1631,  t: 34, s: 77356 },
  "Lille":               { id: 1636,  t: 34, s: 77356 },
  "Rennes":              { id: 1638,  t: 34, s: 77356 },
  "Lens":                { id: 1634,  t: 34, s: 77356 },
  "Nice":                { id: 1637,  t: 34, s: 77356 },
  "Strasbourg":          { id: 1635,  t: 34, s: 77356 },
  "Nantes":              { id: 1632,  t: 34, s: 77356 },
  "Brest":               { id: 2938,  t: 34, s: 77356 },
  "Reims":               { id: 1642,  t: 34, s: 77356 },
  "Toulouse":            { id: 1640,  t: 34, s: 77356 },
  "Le Havre":            { id: 2935,  t: 34, s: 77356 },
  "Montpellier":         { id: 1639,  t: 34, s: 77356 },
  "Auxerre":             { id: 1630,  t: 34, s: 77356 },
  "Angers":              { id: 1633,  t: 34, s: 77356 },
};

const ALLOWED_ORIGINS = [
  "https://bm8-ai.vercel.app",
  "https://mr-edge.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

async function fetchStats(teamId, tournamentId, seasonId, apiKey) {
  const r = await fetch(
    `https://sofascore.p.rapidapi.com/teams/get-statistics?teamId=${teamId}&tournamentId=${tournamentId}&seasonId=${seasonId}`,
    { headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "sofascore.p.rapidapi.com" } }
  );
  if (!r.ok) return null;
  const data = await r.json();
  const s = data.statistics;
  if (!s || !s.matches) return null;
  const m = s.matches;
  return {
    games:       m,
    possession:  s.averageBallPossession ? parseFloat(s.averageBallPossession.toFixed(1)) : null,
    shotsPG:     s.shots          ? parseFloat((s.shots / m).toFixed(1))          : null,
    onTargetPG:  s.shotsOnTarget  ? parseFloat((s.shotsOnTarget / m).toFixed(1))  : null,
    bigChancesPG:s.bigChancesCreated ? parseFloat((s.bigChancesCreated / m).toFixed(1)) : null,
    goalsPG:     s.goalsScored    ? parseFloat((s.goalsScored / m).toFixed(2))    : null,
    concededPG:  s.goalsConceded  ? parseFloat((s.goalsConceded / m).toFixed(2))  : null,
    cleanSheets: s.cleanSheets    ?? null,
    avgRating:   s.avgRating      ? parseFloat(s.avgRating.toFixed(2))            : null,
  };
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

  const apiKey = process.env.RAPID_API_KEY;
  if (!apiKey) return res.status(200).json({ home: null, away: null });

  const { home, away } = req.query;
  if (!home || !away) return res.status(400).json({ error: "home and away required" });

  const homeEntry = TEAM_MAP[home];
  const awayEntry = TEAM_MAP[away];

  if (!homeEntry && !awayEntry) return res.status(200).json({ home: null, away: null });

  try {
    const [homeStats, awayStats] = await Promise.all([
      homeEntry ? fetchStats(homeEntry.id, homeEntry.t, homeEntry.s, apiKey) : Promise.resolve(null),
      awayEntry ? fetchStats(awayEntry.id, awayEntry.t, awayEntry.s, apiKey) : Promise.resolve(null),
    ]);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    return res.json({ home: homeStats, away: awayStats });
  } catch {
    return res.status(200).json({ home: null, away: null });
  }
}
