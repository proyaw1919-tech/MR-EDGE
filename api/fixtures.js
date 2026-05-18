// api/fixtures.js
// Fetches real football fixtures from football-data.org (free tier)
// Env var required: FOOTBALL_DATA_API_KEY

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const LEAGUE_MAP = {
  PL:  'EPL',
  ELC: 'Championship',
  PD:  'LaLiga',
  SA:  'SerieA',
  BL1: 'Bundesliga',
  FL1: 'Ligue1',
  DED: 'Eredivisie',
  PPL: 'PrimeiraLiga',
  CL:  'UCL',
  EL:  'UEL',
  BSA: 'Brasileirao',
  WC:  'WorldCup',
};

const NAME_MAP = {
  "Manchester City FC":           "Man City",
  "Manchester United FC":         "Man United",
  "Tottenham Hotspur FC":         "Tottenham",
  "Tottenham Hotspur":            "Tottenham",
  "Atlético Madrid":              "Atletico Madrid",
  "Club Atlético de Madrid":      "Atletico Madrid",
  "Paris Saint-Germain FC":       "Paris Saint-Germain",
  "Newcastle United FC":          "Newcastle United",
  "West Ham United FC":           "West Ham United",
  "Wolverhampton Wanderers FC":   "Wolves",
  "Wolverhampton Wanderers":      "Wolves",
  "FC Bayern München":            "Bayern Munich",
  "Bayern München":               "Bayern Munich",
  "Bayer 04 Leverkusen":          "Bayer Leverkusen",
  "RasenBallsport Leipzig":       "RB Leipzig",
  "FC Internazionale Milano":     "Inter Milan",
  "Atalanta BC":                  "Atalanta",
  "SS Lazio":                     "Lazio",
  "Juventus FC":                  "Juventus",
  "SSC Napoli":                   "Napoli",
  "AS Roma":                      "Roma",
  "AC Fiorentina":                "Fiorentina",
  "Olympique de Marseille":       "Marseille",
  "Olympique Lyonnais":           "Lyon",
  "Olympique Lyon":               "Lyon",
  "AS Monaco FC":                 "Monaco",
  "Stade Rennais FC 1901":        "Rennes",
  "RC Strasbourg Alsace":         "Strasbourg",
  "FC Nantes":                    "Nantes",
  "RC Lens":                      "Lens",
  "Toulouse FC":                  "Toulouse",
  "Stade Brestois 29":            "Brest",
  "Le Havre AC":                  "Le Havre",
  "Brighton & Hove Albion FC":    "Brighton",
  "Brighton & Hove Albion":       "Brighton",
  "Arsenal FC":                   "Arsenal",
  "Chelsea FC":                   "Chelsea",
  "Liverpool FC":                 "Liverpool",
  "Everton FC":                   "Everton",
  "Fulham FC":                    "Fulham",
  "Brentford FC":                 "Brentford",
  "Crystal Palace FC":            "Crystal Palace",
  "Nottingham Forest FC":         "Nottingham Forest",
  "Aston Villa FC":               "Aston Villa",
  "Eintracht Frankfurt":          "Eintracht Frankfurt",
  "VfB Stuttgart":                "Stuttgart",
  "VfL Wolfsburg":                "Wolfsburg",
  "SC Freiburg":                  "Freiburg",
  "1. FSV Mainz 05":              "Mainz",
  "Werder Bremen":                "Werder Bremen",
  "1. FC Union Berlin":           "Union Berlin",
  "Borussia Mönchengladbach":     "Borussia Mönchengladbach",
  "Athletic Club":                "Athletic Bilbao",
  "Real Betis Balompié":          "Real Betis",
  "RC Celta de Vigo":             "Celta Vigo",
  "RCD Mallorca":                 "Mallorca",
  "Real Sociedad de Fútbol":      "Real Sociedad",
  "Deportivo Alavés":             "Alaves",
  "Bologna FC 1909":              "Bologna",
  "Torino FC":                    "Torino",
  "Udinese Calcio":               "Udinese",
  "Genoa CFC":                    "Genoa",
  "Cagliari Calcio":              "Cagliari",
  "Hellas Verona FC":             "Hellas Verona",
  "Parma Calcio 1913":            "Parma",
  // football-data.org shortName variants
  "Barça":                        "Barcelona",
  "Atleti":                       "Atletico Madrid",
  "Atlético de M.":               "Atletico Madrid",
  "Alavés":                       "Alaves",
  "Alavés CF":                    "Alaves",
  "R. Betis":                     "Real Betis",
  "R. Sociedad":                  "Real Sociedad",
  "Athletic":                     "Athletic Bilbao",
  "Celta":                        "Celta Vigo",
  "Rayo":                         "Rayo Vallecano",
  "Man Utd":                      "Man United",
  "Man. United":                  "Man United",
  "Man. City":                    "Man City",
  "Nott'm Forest":                "Nottingham Forest",
  "Nottm Forest":                 "Nottingham Forest",
  "Nottingham":                   "Nottingham Forest",
  "Juve":                         "Juventus",
  "BVB":                          "Borussia Dortmund",
  "Dortmund":                     "Borussia Dortmund",
  "OM":                           "Marseille",
  "OL":                           "Lyon",
  "SGE":                          "Eintracht Frankfurt",
  "B04":                          "Bayer Leverkusen",
  "M'gladbach":                   "Borussia Mönchengladbach",
  "Werder":                       "Werder Bremen",
  "Union":                        "Union Berlin",
  "Toro":                         "Torino",
  "Verona":                       "Hellas Verona",
  "Viola":                        "Fiorentina",
  "LOSC Lille":                   "Lille",
  "Stade Brestois":               "Brest",
  "AJ Auxerre":                   "Auxerre",
  "Angers SCO":                   "Angers",
  "HSV":                          "Hamburger SV",
  "FC St. Pauli":                 "St. Pauli",
  "Leicester":                    "Leicester City",
  "FC Bayern":                    "Bayern Munich",
  "1. FC Heidenheim":             "Heidenheim",
  "FC Augsburg":                  "Augsburg",
  "TSG Hoffenheim":               "Hoffenheim",
  "VfL Bochum":                   "Bochum",
  "UD Las Palmas":                "Las Palmas",
  "Las Palmas":                   "Las Palmas",
  "CD Leganés":                   "Leganés",
  "Real Valladolid CF":           "Valladolid",
  "Venezia FC":                   "Venezia",
  "AC Monza":                     "Monza",
  "Stade de Reims":               "Reims",
  "Reims":                        "Reims",
  "Montpellier HSC":              "Montpellier",
  "Montpellier":                  "Montpellier",
  "RC Strasbourg":                "Strasbourg",
  "LOSC":                         "Lille",
  // Championship (ELC)
  "Leeds United FC":              "Leeds United",
  "Sheffield United FC":          "Sheffield United",
  "Middlesbrough FC":             "Middlesbrough",
  "Coventry City FC":             "Coventry City",
  "Bristol City FC":              "Bristol City",
  "Watford FC":                   "Watford",
  "Stoke City FC":                "Stoke City",
  "Queens Park Rangers FC":       "QPR",
  "Swansea City AFC":             "Swansea City",
  "Blackburn Rovers FC":          "Blackburn",
  "Norwich City FC":              "Norwich City",
  "Preston North End FC":         "Preston",
  "Hull City AFC":                "Hull City",
  "Millwall FC":                  "Millwall",
  "West Bromwich Albion FC":      "West Brom",
  "Cardiff City FC":              "Cardiff City",
  "Derby County FC":              "Derby County",
  "Plymouth Argyle FC":           "Plymouth",
  "Oxford United FC":             "Oxford United",
  "Portsmouth FC":                "Portsmouth",
  "Luton Town FC":                "Luton Town",
  "Burnley FC":                   "Burnley",
  "Sunderland AFC":               "Sunderland",
  // Eredivisie (DED)
  "AFC Ajax":                     "Ajax",
  "PSV Eindhoven":                "PSV",
  "Feyenoord Rotterdam":          "Feyenoord",
  "AZ Alkmaar":                   "AZ",
  "FC Utrecht":                   "Utrecht",
  "SC Heerenveen":                "Heerenveen",
  "FC Twente":                    "Twente",
  "Vitesse":                      "Vitesse",
  "Sparta Rotterdam":             "Sparta Rotterdam",
  "Go Ahead Eagles":              "Go Ahead Eagles",
  "NEC Nijmegen":                 "NEC",
  "FC Groningen":                 "Groningen",
  "RKC Waalwijk":                 "RKC Waalwijk",
  "PEC Zwolle":                   "Zwolle",
  "Almere City FC":               "Almere City",
  "Heracles Almelo":              "Heracles",
  // Primeira Liga (PPL)
  "Sport Lisboa e Benfica":       "Benfica",
  "FC Porto":                     "Porto",
  "Sporting CP":                  "Sporting CP",
  "SC Braga":                     "Braga",
  "Vitória SC":                   "Vitoria SC",
  "CF Os Belenenses":             "Belenenses",
  "Boavista FC":                  "Boavista",
  "FC Famalicão":                 "Famalicao",
  "Moreirense FC":                "Moreirense",
  "Rio Ave FC":                   "Rio Ave",
  "Gil Vicente FC":               "Gil Vicente",
  "FC Arouca":                    "Arouca",
  "CD Santa Clara":               "Santa Clara",
  "Estoril Praia":                "Estoril",
  // Brasileirão (BSA)
  "Flamengo":                     "Flamengo",
  "Fluminense FC":                "Fluminense",
  "Athletico Paranaense":         "Athletico PR",
  "SE Palmeiras":                 "Palmeiras",
  "CR Vasco da Gama":             "Vasco",
  "Sport Club Corinthians Paulista": "Corinthians",
  "São Paulo FC":                 "São Paulo",
  "Grêmio FBPA":                  "Grêmio",
  "Sport Club Internacional":     "Internacional",
  "Clube Atlético Mineiro":       "Atletico Mineiro",
  "Botafogo de Futebol e Regatas": "Botafogo",
  "Santos FC":                    "Santos",
  "Bahia":                        "Bahia",
  "Fortaleza EC":                 "Fortaleza",
  "EC Vitória":                   "Vitória",
};

function normalize(name) {
  return NAME_MAP[name] || name;
}

function fmtDate(d) {
  // Convert UTC → UTC+8 (Malaysia / Singapore time)
  const local = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${DAYS[local.getUTCDay()]} ${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]}`;
}

function fmtTime(d) {
  // Convert UTC → UTC+8
  const local = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${String(local.getUTCHours()).padStart(2,'0')}:${String(local.getUTCMinutes()).padStart(2,'0')}`;
}

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
  if (!apiKey) return res.status(500).json({ error: "Server configuration error." });

  const today = new Date();
  const from  = new Date(today); from.setDate(from.getDate() - 3);
  const to    = new Date(today); to.setDate(to.getDate() + 6);
  const dateFrom = from.toISOString().split('T')[0];
  const dateTo   = to.toISOString().split('T')[0];

  try {
    const headers = { 'X-Auth-Token': apiKey };

    const r = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      { headers }
    );

    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error(body.message || `football-data.org ${r.status}`);
    }

    const data = await r.json();
    const matches = [];
    let id = 1;

    for (const m of data.matches || []) {
      const league = LEAGUE_MAP[m.competition?.code];
      if (!league) continue;

      const isFinished = ['FINISHED', 'AWARDED'].includes(m.status);
      const isUpcoming = ['SCHEDULED', 'TIMED'].includes(m.status);
      if (!isFinished && !isUpcoming) continue;

      const utc = new Date(m.utcDate);
      const entry = {
        id: id++,
        matchId: m.id,   // original football-data.org ID for H2H lookup
        status: isFinished ? 'recent' : 'upcoming',
        date:   fmtDate(utc),
        league,
        home: normalize(m.homeTeam?.shortName || m.homeTeam?.name) || 'TBD',
        away: normalize(m.awayTeam?.shortName || m.awayTeam?.name) || 'TBD',
        homeCrest: m.homeTeam?.crest || '',
        awayCrest: m.awayTeam?.crest || '',
      };
      if (isUpcoming) entry.time = fmtTime(utc);
      if (isFinished) {
        entry.homeScore = m.score?.fullTime?.home ?? 0;
        entry.awayScore = m.score?.fullTime?.away ?? 0;
      }
      matches.push(entry);
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.json({ matches });
  } catch {
    return res.status(500).json({ error: "Failed to fetch fixtures." });
  }
}
