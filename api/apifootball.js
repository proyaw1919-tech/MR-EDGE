// api/apifootball.js — Injuries, form, predictions from api-sports.io
// Env var required: API_FOOTBALL_KEY

const LEAGUE_IDS = { EPL:39, Championship:40, LaLiga:140, SerieA:135, Bundesliga:78, Ligue1:61, UCL:2, UEL:3, Eredivisie:88, PrimeiraLiga:94, Brasileirao:71 };
const getSeason = () => { const n=new Date(); return n.getMonth()>=7?n.getFullYear():n.getFullYear()-1; };
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');
async function apiFetch(path,key){try{const r=await fetch(`https://v3.football.api-sports.io${path}`,{headers:{'x-apisports-key':key}});if(!r.ok)return null;return r.json();}catch{return null;}}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS')return res.status(204).end();
  const key=process.env.API_FOOTBALL_KEY;
  if(!key)return res.status(200).json({injuries:null,prediction:null,debug:'no_key'});
  const{home,away,date,league}=req.query;
  if(!home||!away||!date||!league)return res.status(200).json({injuries:null,prediction:null,debug:'missing_params'});
  const leagueId=LEAGUE_IDS[league];
  if(!leagueId)return res.status(200).json({injuries:null,prediction:null,debug:'unknown_league'});
  try{
    const season=getSeason();
    const fd=await apiFetch(`/fixtures?date=${date}&league=${leagueId}&season=${season}`,key);
    if(!fd)return res.status(200).json({injuries:null,prediction:null,debug:'api_error'});
    const rawErr=fd?.errors;const rawMsg=fd?.message;
    const mH=norm(home),mA=norm(away);
    const fix=fd?.response?.find(f=>{const fH=norm(f.teams?.home?.name||''),fA=norm(f.teams?.away?.name||'');return(fH.includes(mH.slice(0,5))||mH.includes(fH.slice(0,5)))&&(fA.includes(mA.slice(0,5))||mA.includes(fA.slice(0,5)));});
    if(!fix)return res.status(200).json({injuries:null,prediction:null,debug:`no_fixture_found_from_${fd?.response?.length||0}_results`,season,errors:rawErr,message:rawMsg,sampleTeams:fd?.response?.slice(0,3).map(f=>f.teams?.home?.name+' vs '+f.teams?.away?.name)});
    const fid=fix.fixture.id,hid=fix.teams.home.id,aid=fix.teams.away.id;
    const[injD,predD]=await Promise.all([apiFetch(`/injuries?fixture=${fid}`,key),apiFetch(`/predictions?fixture=${fid}`,key)]);
    let injuries=null;
    if(injD?.response?.length){const hI=injD.response.filter(p=>p.team?.id===hid).map(p=>`${p.player?.name} (${p.player?.reason||p.player?.type||'injury'})`);const aI=injD.response.filter(p=>p.team?.id===aid).map(p=>`${p.player?.name} (${p.player?.reason||p.player?.type||'injury'})`);injuries={home:hI,away:aI};}
    let prediction=null;
    if(predD?.response?.[0]){const p=predD.response[0],pr=p.predictions,ht=p.teams?.home,at=p.teams?.away;prediction={winner:pr?.winner?.name,advice:pr?.advice,percent:pr?.percent,goals:pr?.goals,homeForm:ht?.last_5?.form,awayForm:at?.last_5?.form,homeAtt:ht?.last_5?.att,homeDef:ht?.last_5?.def,awayAtt:at?.last_5?.att,awayDef:at?.last_5?.def,homeGoalsFor:ht?.last_5?.goals?.for?.average,homeGoalsAgainst:ht?.last_5?.goals?.against?.average,awayGoalsFor:at?.last_5?.goals?.for?.average,awayGoalsAgainst:at?.last_5?.goals?.against?.average};}
    return res.status(200).json({injuries,prediction,debug:'ok',fixtureId:fid});
  }catch(e){return res.status(200).json({injuries:null,prediction:null,debug:'exception:'+e.message});}
}
