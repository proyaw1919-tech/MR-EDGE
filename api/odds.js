// api/odds.js — Pre-match H2H betting odds from The Odds API

const SPORT_KEY_MAP = {
  EPL:          'soccer_epl',
  Championship: 'soccer_england_championship',
  LaLiga:       'soccer_spain_la_liga',
  SerieA:       'soccer_italy_serie_a',
  Bundesliga:   'soccer_germany_bundesliga',
  Ligue1:       'soccer_france_ligue_one',
  Eredivisie:   'soccer_netherlands_eredivisie',
  PrimeiraLiga: 'soccer_portugal_primeira_liga',
  UCL:          'soccer_uefa_champs_league',
  UEL:          'soccer_uefa_europa_league',
  Brasileirao:  'soccer_brazil_campeonato',
};

const NAME_MAP = {
  "Manchester City":           "Man City",
  "Manchester United":         "Man United",
  "Tottenham Hotspur":         "Tottenham",
  "Wolverhampton Wanderers":   "Wolves",
  "Brighton and Hove Albion":  "Brighton",
  "Brighton & Hove Albion":    "Brighton",
  "Nottingham Forest":         "Nottingham Forest",
  "Newcastle United":          "Newcastle United",
  "West Ham United":           "West Ham United",
  "Aston Villa":               "Aston Villa",
  "FC Bayern Munich":          "Bayern Munich",
  "Bayern Munich":             "Bayern Munich",
  "Bayer Leverkusen":          "Bayer Leverkusen",
  "RasenBallsport Leipzig":    "RB Leipzig",
  "Borussia Dortmund":         "Borussia Dortmund",
  "Atletico Madrid":           "Atletico Madrid",
  "Atlético Madrid":           "Atletico Madrid",
  "Inter Milan":               "Inter Milan",
  "Paris Saint-Germain":       "Paris Saint-Germain",
  "Olympique Marseille":       "Marseille",
  "Olympique Lyonnais":        "Lyon",
  "AS Monaco":                 "Monaco",
  "Athletic Club":             "Athletic Bilbao",
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

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return res.status(200).json({ odds: [] });

  const league = req.query.league || "EPL";
  const sportKey = SPORT_KEY_MAP[league];
  if (!sportKey) return res.status(200).json({ odds: [] });

  try {
    const r = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso`,
    );
    if (!r.ok) return res.status(200).json({ odds: [] });

    const data = await r.json();
    if (!Array.isArray(data)) return res.status(200).json({ odds: [] });

    const odds = data.map(event => {
      const prices = { home: [], draw: [], away: [] };
      for (const bm of (event.bookmakers || [])) {
        const market = bm.markets?.find(m => m.key === 'h2h');
        if (!market) continue;
        for (const outcome of (market.outcomes || [])) {
          if (outcome.name === event.home_team)       prices.home.push(outcome.price);
          else if (outcome.name === event.away_team)  prices.away.push(outcome.price);
          else                                        prices.draw.push(outcome.price);
        }
      }
      const avg = arr => arr.length
        ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
        : null;
      return {
        home:      normalize(event.home_team),
        away:      normalize(event.away_team),
        homeOdds:  avg(prices.home),
        drawOdds:  avg(prices.draw),
        awayOdds:  avg(prices.away),
        commence:  event.commence_time,
      };
    }).filter(o => o.homeOdds && o.drawOdds && o.awayOdds);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    return res.json({ odds });
  } catch {
    return res.status(200).json({ odds: [] });
  }
}
