// api/apifootball.js — Injuries, form, predictions, lineups, team stats
// Supports BOTH purchase channels (set whichever key you have in Vercel env):
//   APIFOOTBALL_KEY — bought direct from api-football.com (v3.football.api-sports.io)
//   RAPID_API_KEY   — bought via RapidAPI marketplace (api-football-v1.p.rapidapi.com)
// Requests per call: 1 fixture lookup + 5 parallel (injuries, predictions, lineups, 2× team stats) = 6

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
    const[injD,predD,lineD,hStatD,aStatD]=await Promise.all([
      apiFetch(`/injuries?fixture=${fid}`,cfg),
      apiFetch(`/predictions?fixture=${fid}`,cfg),
      apiFetch(`/fixtures/lineups?fixture=${fid}`,cfg),
      apiFetch(`/teams/statistics?league=${leagueId}&season=${season}&team=${hid}`,cfg),
      apiFetch(`/teams/statistics?league=${leagueId}&season=${season}&team=${aid}`,cfg),
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
    return res.status(200).json({injuries,prediction,lineups,teamSeasonStats,referee,debug:'ok',fixtureId:fid});
  }catch(e){return res.status(200).json({injuries:null,prediction:null,debug:'exception:'+e.message});}
}
