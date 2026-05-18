// api/weather.js — Match venue weather from OpenWeatherMap
// Env var required: WEATHER_API_KEY

const TEAM_CITY = {
  'Arsenal':'London','Chelsea':'London','Tottenham':'London','West Ham':'London','Crystal Palace':'London','Fulham':'London','Brentford':'London','QPR':'London','Millwall':'London','Charlton':'London',
  'Man City':'Manchester','Man United':'Manchester','Manchester City':'Manchester','Manchester United':'Manchester',
  'Liverpool':'Liverpool','Everton':'Liverpool',
  'Newcastle':'Newcastle upon Tyne','Sunderland':'Sunderland',
  'Leeds':'Leeds','Sheffield United':'Sheffield','Sheffield Wed':'Sheffield',
  'Aston Villa':'Birmingham','Birmingham':'Birmingham','WBA':'Birmingham',
  'Wolves':'Wolverhampton','Wolverhampton':'Wolverhampton',
  'Leicester':'Leicester','Nottm Forest':'Nottingham','Nottingham Forest':'Nottingham',
  'Southampton':'Southampton','Brighton':'Brighton','Bournemouth':'Bournemouth',
  'Burnley':'Burnley','Ipswich':'Ipswich','Hull City':'Kingston upon Hull',
  'Real Madrid':'Madrid','Atletico Madrid':'Madrid','Getafe':'Madrid','Rayo Vallecano':'Madrid',
  'Barcelona':'Barcelona','Espanyol':'Barcelona','Girona':'Girona',
  'Sevilla':'Seville','Real Betis':'Seville','Valencia':'Valencia',
  'Athletic Club':'Bilbao','Real Sociedad':'San Sebastian','Osasuna':'Pamplona',
  'Alaves':'Vitoria-Gasteiz','Celta Vigo':'Vigo','Mallorca':'Palma','Villarreal':'Villarreal',
  'Juventus':'Turin','Torino':'Turin','Inter':'Milan','AC Milan':'Milan',
  'Napoli':'Naples','Roma':'Rome','Lazio':'Rome',
  'Fiorentina':'Florence','Atalanta':'Bergamo','Bologna':'Bologna',
  'AC Pisa':'Pisa','Cagliari':'Cagliari','Lecce':'Lecce','Como':'Como',
  'Bayern Munich':'Munich','Borussia Dortmund':'Dortmund','RB Leipzig':'Leipzig',
  'Bayer Leverkusen':'Leverkusen','Eintracht Frankfurt':'Frankfurt',
  'Stuttgart':'Stuttgart','Freiburg':'Freiburg','Mainz':'Mainz',
  'Werder Bremen':'Bremen','Union Berlin':'Berlin','Augsburg':'Augsburg',
  'Paris Saint-Germain':'Paris','PSG':'Paris','Lyon':'Lyon',
  'Marseille':'Marseille','Monaco':'Monaco','Nice':'Nice','Lille':'Lille',
  'Rennes':'Rennes','Toulouse':'Toulouse','Reims':'Reims',
  'Ajax':'Amsterdam','PSV':'Eindhoven','Feyenoord':'Rotterdam',
  'Benfica':'Lisbon','Sporting CP':'Lisbon','Porto':'Porto',
};

function findCity(team){
  const l=team.toLowerCase();
  for(const[t,c]of Object.entries(TEAM_CITY)){if(l.includes(t.toLowerCase())||t.toLowerCase().includes(l))return c;}
  return null;
}

function buildResponse(res,data,date,city){
  const ts=new Date(date+'T15:00:00Z').getTime()/1000;
  const fc=data.list?.reduce((b,c)=>!b||Math.abs(c.dt-ts)<Math.abs(b.dt-ts)?c:b,null);
  if(!fc)return res.status(200).json({weather:null});
  return res.status(200).json({weather:{city,temp:Math.round(fc.main.temp),condition:fc.weather[0]?.description||'clear',windSpeed:Math.round((fc.wind?.speed||0)*3.6),humidity:fc.main.humidity,rain:Math.round((fc.rain?.['3h']||0)*10)/10}});
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  if(req.method==='OPTIONS')return res.status(204).end();
  const key=process.env.WEATHER_API_KEY;
  if(!key)return res.status(200).json({weather:null});
  const{home,date}=req.query;
  if(!home||!date)return res.status(200).json({weather:null});
  const city=findCity(home);
  if(!city)return res.status(200).json({weather:null});
  try{
    const base=`https://api.openweathermap.org/data/2.5/forecast?appid=${key}&units=metric&cnt=40`;
    let r=await fetch(`${base}&q=${encodeURIComponent(city)}`);
    if(!r.ok)return res.status(200).json({weather:null});
    return buildResponse(res,await r.json(),date,city);
  }catch{return res.status(200).json({weather:null});}
}
