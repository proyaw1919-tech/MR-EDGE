// api/apifootball.js — Injuries, form, predictions, lineups, team stats, corners
// Supports BOTH purchase channels (set whichever key you have in Vercel env):
//   APIFOOTBALL_KEY — bought direct from api-football.com (v3.football.api-sports.io)
//   RAPID_API_KEY   — bought via RapidAPI marketplace (api-football-v1.p.rapidapi.com)
// Requests per call: 1 fixture lookup + 5 parallel (injuries, predictions, lineups, 2× team stats)
//   + corners (up to 2×(1 fixtures list + 7 statistics) = 16, but cached 12h in Redis)

import { Redis } from '@upstash/redis';

const LEAGUE_IDS = { EPL:39, Championship:40, LaLiga:140, SerieA:135, Bundesliga:78, Ligue1:61, UCL:2, UEL:3, Eredivisie:88, PrimeiraLiga:94, Brasileirao:71 };
const getSeason = () => { const n=new Date(); return n.getMonth()>=7?n.getFullYear():n.getFullYear()-1; };
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');

// Pick API host based on which key is configured (direct api-sports key takes priority)
function getApiConfig(){
  const direct=process.env.APIFOOTBALL_KEY;
  if(direct)return{base:'https://v3.football.api-sports.io',headers:{'x-apisports-key':direct}};
  const rapid=process.env.RAPID_API_KEY;
  if(rapid)return{base:'https://api-football-v1.p.rapidapi.com/v3',headers:{'x-rapidapi-key':rapid,'x-rapidapi-host':'api-football-v1.p.rapidapi.com'}};
  return null;
}
async function apiFetch(path,cfg){try{const r=await fetch(`${cfg.base}${path}`,{headers:cfg.headers});if(!r.ok)return null;return r.json();}catch{return null;}}

function getRedis(){
  const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
  const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
  if(!url||!token)return null;
  try{return new Redis({url,token});}catch{return null;}
}

// Average corners AND cards (won/conceded) over a team's recent finished matches.
// Both come from the same /fixtures/statistics responses — no extra API calls.
// Cached 12h in Redis. Returns { corners:{for,against}, cards:{for,against}, games }.
async function fetchTeamMatchAvgs(teamId,season,cfg,redis){
  const cacheKey=`tmstats:v1:${season}:${teamId}`;
  if(redis){try{const c=await redis.get(cacheKey);if(c)return c;}catch{}}
  const fl=await apiFetch(`/fixtures?team=${teamId}&last=7`,cfg);
  const fixtures=(fl?.response||[]).filter(f=>['FT','AET','PEN'].includes(f.fixture?.status?.short));
  if(!fixtures.length)return null;
  const statArr=await Promise.all(fixtures.map(f=>apiFetch(`/fixtures/statistics?fixture=${f.fixture.id}`,cfg)));
  const getStat=(t,type)=>{const s=(t?.statistics||[]).find(x=>x.type===type);return s&&s.value!=null?Number(s.value):null;};
  const cards=t=>{const y=getStat(t,'Yellow Cards'),r=getStat(t,'Red Cards');if(y==null&&r==null)return null;return (y||0)+(r||0);};
  let cFor=0,cAgainst=0,cGames=0;       // corners
  let kFor=0,kAgainst=0,kGames=0;       // cards
  for(const sd of statArr){
    const resp=sd?.response;if(!resp||resp.length<2)continue;
    const mine=resp.find(t=>t.team?.id===teamId);
    const opp=resp.find(t=>t.team?.id!==teamId);
    const cf=getStat(mine,'Corner Kicks'),ca=getStat(opp,'Corner Kicks');
    if(cf!=null){cFor+=cf;cAgainst+=(ca??0);cGames++;}
    const kf=cards(mine),ka=cards(opp);
    if(kf!=null){kFor+=kf;kAgainst+=(ka??0);kGames++;}
  }
  if(!cGames&&!kGames)return null;
  const result={
    corners: cGames?{for:parseFloat((cFor/cGames).toFixed(1)),against:parseFloat((cAgainst/cGames).toFixed(1)),games:cGames}:null,
    cards:   kGames?{for:parseFloat((kFor/kGames).toFixed(1)),against:parseFloat((kAgainst/kGames).toFixed(1)),games:kGames}:null,
  };
  if(redis){try{await redis.set(cacheKey,result,{ex:12*3600});}catch{}}
  return result;
}

// Extract the useful subset of /teams/statistics
function parseTeamStats(d){
  const s=d?.response;
  if(!s||!s.fixtures)return null;
  const mostUsedFormation=(s.lineups||[]).sort((a,b)=>(b.played||0)-(a.played||0))[0]?.formation||null;
  return {
    form:(s.form||'').slice(-5),
    cleanSheets:s.clean_sheet?.total??null,
    failedToScore:s.failed_to_score?.total??null,
    avgGoalsFor:s.goals?.for?.average?.total??null,
    avgGoalsAgainst:s.goals?.against?.average?.total??null,
    formation:mostUsedFormation,
    winStreak:s.biggest?.streak?.wins??null,
    penScored:s.penalty?.scored?.total??null,
    penMissed:s.penalty?.missed?.total??null,
  };
}

// Extract confirmed lineup for one team from /fixtures/lineups
function parseLineup(entry){
  if(!entry)return null;
  return {
    formation:entry.formation||null,
    coach:entry.coach?.name||null,
    startXI:(entry.startXI||[]).map(p=>p.player?.name).filter(Boolean),
  };
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS')return res.status(204).end();
  const cfg=getApiConfig();
  if(!cfg)return res.status(200).json({injuries:null,prediction:null,debug:'no_key'});
  const{home,away,date,league}=req.query;
  if(!home||!away||!date||!league)return res.status(200).json({injuries:null,prediction:null,debug:'missing_params'});
  const leagueId=LEAGUE_IDS[league];
  if(!leagueId)return res.status(200).json({injuries:null,prediction:null,debug:'unknown_league'});
  try{
    const season=getSeason();
    const fd=await apiFetch(`/fixtures?date=${date}&league=${leagueId}&season=${season}`,cfg);
    if(!fd)return res.status(200).json({injuries:null,prediction:null,debug:'api_error'});
    const rawErr=fd?.errors;const rawMsg=fd?.message;
    const mH=norm(home),mA=norm(away);
    const fix=fd?.response?.find(f=>{const fH=norm(f.teams?.home?.name||''),fA=norm(f.teams?.away?.name||'');return(fH.includes(mH.slice(0,5))||mH.includes(fH.slice(0,5)))&&(fA.includes(mA.slice(0,5))||mA.includes(fA.slice(0,5)));});
    if(!fix)return res.status(200).json({injuries:null,prediction:null,debug:`no_fixture_found_from_${fd?.response?.length||0}_results`,season,errors:rawErr,message:rawMsg,sampleTeams:fd?.response?.slice(0,3).map(f=>f.teams?.home?.name+' vs '+f.teams?.away?.name)});
    const fid=fix.fixture.id,hid=fix.teams.home.id,aid=fix.teams.away.id;
    const redis=getRedis();
    const[injD,predD,lineD,hStatD,aStatD,hAvg,aAvg]=await Promise.all([
      apiFetch(`/injuries?fixture=${fid}`,cfg),
      apiFetch(`/predictions?fixture=${fid}`,cfg),
      apiFetch(`/fixtures/lineups?fixture=${fid}`,cfg),
      apiFetch(`/teams/statistics?league=${leagueId}&season=${season}&team=${hid}`,cfg),
      apiFetch(`/teams/statistics?league=${leagueId}&season=${season}&team=${aid}`,cfg),
      fetchTeamMatchAvgs(hid,season,cfg,redis),
      fetchTeamMatchAvgs(aid,season,cfg,redis),
    ]);
    let injuries=null;
    if(injD?.response?.length){const dedupe=a=>[...new Set(a)];const hI=dedupe(injD.response.filter(p=>p.team?.id===hid).map(p=>`${p.player?.name} (${p.player?.reason||p.player?.type||'injury'})`));const aI=dedupe(injD.response.filter(p=>p.team?.id===aid).map(p=>`${p.player?.name} (${p.player?.reason||p.player?.type||'injury'})`));injuries={home:hI,away:aI};}
    let prediction=null;
    if(predD?.response?.[0]){const p=predD.response[0],pr=p.predictions,ht=p.teams?.home,at=p.teams?.away;prediction={winner:pr?.winner?.name,advice:pr?.advice,percent:pr?.percent,goals:pr?.goals,homeForm:ht?.last_5?.form,awayForm:at?.last_5?.form,homeAtt:ht?.last_5?.att,homeDef:ht?.last_5?.def,awayAtt:at?.last_5?.att,awayDef:at?.last_5?.def,homeGoalsFor:ht?.last_5?.goals?.for?.average,homeGoalsAgainst:ht?.last_5?.goals?.against?.average,awayGoalsFor:at?.last_5?.goals?.for?.average,awayGoalsAgainst:at?.last_5?.goals?.against?.average};}
    // Confirmed lineups (only published ~20-40 min before kickoff; null before that)
    let lineups=null;
    if(lineD?.response?.length){
      const hL=parseLineup(lineD.response.find(l=>l.team?.id===hid));
      const aL=parseLineup(lineD.response.find(l=>l.team?.id===aid));
      if(hL||aL)lineups={home:hL,away:aL};
    }
    // Full-season team statistics
    let teamSeasonStats=null;
    const hS=parseTeamStats(hStatD),aS=parseTeamStats(aStatD);
    if(hS||aS)teamSeasonStats={home:hS,away:aS};
    const referee=fix.fixture?.referee||null;
    const hC=hAvg?.corners||null, aC=aAvg?.corners||null;
    const hK=hAvg?.cards||null,   aK=aAvg?.cards||null;
    let corners=null;
    if(hC||aC)corners={home:hC,away:aC};
    let cards=null;
    if(hK||aK)cards={home:hK,away:aK};
    return res.status(200).json({injuries,prediction,lineups,teamSeasonStats,referee,corners,cards,debug:'ok',fixtureId:fid});
  }catch(e){return res.status(200).json({injuries:null,prediction:null,debug:'exception:'+e.message});}
}
