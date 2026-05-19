// api/odds.js — Pre-match H2H betting odds + opening odds movement via Upstash Redis

import { Redis } from '@upstash/redis';

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

function getRedis() {
  const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function movePct(opening, current) {
  if (!opening || !current) return null;
  return parseFloat(((current - opening) / opening * 100).toFixed(1));
}

function moveLabel(pct) {
  if (pct === null) return "";
  if (pct <= -10) return "SHARP MONEY ▼";
  if (pct <= -5)  return "market backing ▼";
  if (pct >= 10)  return "drifting ▲";
  if (pct >= 5)   return "slight drift ▲";
  return "stable";
}

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

    const redis = getRedis();

    const odds = await Promise.all(data.map(async event => {
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

      const homeOdds = avg(prices.home);
      const drawOdds = avg(prices.draw);
      const awayOdds = avg(prices.away);
      const home = normalize(event.home_team);
      const away = normalize(event.away_team);

      // Opening odds tracking via Redis
      let openingHome = null, openingDraw = null, openingAway = null;
      if (redis && homeOdds && drawOdds && awayOdds) {
        const key = `odds:${home}:${away}`.replace(/\s+/g, '_').toLowerCase();
        try {
          const stored = await redis.get(key);
          if (stored) {
            openingHome = stored.h;
            openingDraw = stored.d;
            openingAway = stored.a;
          } else {
            // First time we see this match — store as opening odds (TTL 8 days)
            await redis.set(key, { h: homeOdds, d: drawOdds, a: awayOdds }, { ex: 8 * 24 * 3600 });
            openingHome = homeOdds;
            openingDraw = drawOdds;
            openingAway = awayOdds;
          }
        } catch { /* Redis error — skip movement tracking */ }
      }

      const homeMov  = movePct(openingHome, homeOdds);
      const drawMov  = movePct(openingDraw, drawOdds);
      const awayMov  = movePct(openingAway, awayOdds);

      return {
        home, away, homeOdds, drawOdds, awayOdds,
        commence: event.commence_time,
        // Opening odds
        openingHome, openingDraw, openingAway,
        // Movement % (negative = odds shortened = more backed)
        homeMove: homeMov, drawMove: drawMov, awayMove: awayMov,
        homeSignal: moveLabel(homeMov),
        drawSignal: moveLabel(drawMov),
        awaySignal: moveLabel(awayMov),
      };
    }));

    const filtered = odds.filter(o => o.homeOdds && o.drawOdds && o.awayOdds);
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.json({ odds: filtered });
  } catch {
    return res.status(200).json({ odds: [] });
  }
}
