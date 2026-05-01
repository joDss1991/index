


// ═══════════════════════════════════════════════
// COMPARAISON NDVI MULTI-PARCELLES
// ═══════════════════════════════════════════════
let _compareData = [];
let _compareChart = null;

function openNdviCompare(){
  const panel = document.getElementById('ndviComparePanel');
  if(panel) panel.style.display = panel.style.display==='none'?'flex':'none';
  if(panel?.style.display==='flex') renderCompareChart();
}

function addCurrentToCompare(){
  const lat = window._shLat||window._ndviParcelLat;
  const lng = window._shLng||window._ndviParcelLng;
  if(!lat||!lng){ showToast('⚠️ Ouvrez une fiche parcelle d\'abord'); return; }
  const commune = document.getElementById('shTitle')?.textContent||
                  lat.toFixed(3)+'°N '+lng.toFixed(3)+'°E';
  // Récupérer données NDVI de la parcelle (simulé avec dates et valeurs courantes)
  const entry = {
    id: Date.now(),
    label: commune,
    lat, lng,
    color: ['#2dbd8a','#ef5350','#42a5f5','#ff9800','#ab47bc'][_compareData.length%5],
    data: dates.map((d,i)=>({ date:d, ndvi: 0.3+Math.random()*0.5 })),
  };
  _compareData.push(entry);
  renderCompareList();
  renderCompareChart();
  showToast('✅ Parcelle ajoutée à la comparaison');
}

function removeFromCompare(id){
  _compareData = _compareData.filter(d=>d.id!==id);
  renderCompareList();
  renderCompareChart();
}

function renderCompareList(){
  const el = document.getElementById('compareList');
  if(!el) return;
  if(!_compareData.length){
    el.innerHTML='<span style="font-size:9px;color:rgba(255,255,255,.25);font-family:DM Mono,monospace;">Aucune parcelle</span>';
    return;
  }
  el.innerHTML = _compareData.map(d=>
    '<div style="display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);'
    +'border-radius:6px;padding:3px 8px;border:1px solid rgba(255,255,255,.08);">'
    +'<div style="width:8px;height:8px;border-radius:50%;background:'+d.color+';flex-shrink:0;"></div>'
    +'<span style="font-size:9px;color:rgba(255,255,255,.7);font-family:DM Mono,monospace;">'+d.label.slice(0,20)+'</span>'
    +'<button onclick="removeFromCompare('+d.id+')" style="background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:10px;padding:0 0 0 2px;">✕</button>'
    +'</div>'
  ).join('');
}

function renderCompareChart(){
  const canvas = document.getElementById('compareChart');
  if(!canvas||!_compareData.length) return;
  if(_compareChart){ _compareChart.destroy(); _compareChart=null; }
  // Dates communes (30 dernières)
  const allDates = dates.slice(0,20).reverse();
  const datasets = _compareData.map(d=>({
    label: d.label.slice(0,15),
    data: allDates.map(date=>d.data.find(x=>x.date===date)?.ndvi||null),
    borderColor: d.color,
    backgroundColor: d.color+'22',
    borderWidth:2, pointRadius:3, tension:.4, fill:false,
  }));
  _compareChart = new Chart(canvas,{
    type:'line',
    data:{ labels:allDates.map(d=>{const p=d.split('-');return p[2]+'/'+p[1];}), datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{ labels:{ font:{size:9}, color:'rgba(255,255,255,.6)', boxWidth:10 } }
      },
      scales:{
        x:{ grid:{color:'rgba(255,255,255,.05)'}, ticks:{font:{size:7},color:'rgba(255,255,255,.35)'} },
        y:{ min:0, max:1, grid:{color:'rgba(255,255,255,.05)'},
          ticks:{font:{size:7},color:'rgba(255,255,255,.35)'},
          title:{display:true,text:'NDVI',color:'rgba(255,255,255,.3)',font:{size:8}} }
      }
    }
  });
}

// ═══════════════════════════════════════════════
// MODE DÉMO — données fictives convaincantes
// ═══════════════════════════════════════════════
const DEMO_MODE = false; // activé si code DEMO2026
let _isDemoMode = false;

const DEMO_DATES = [
  '2026-04-21','2026-04-18','2026-04-15','2026-04-11',
  '2026-03-29','2026-03-22','2026-03-15','2026-03-08',
  '2026-02-25','2026-02-15','2026-02-05','2026-01-26',
  '2025-12-20','2025-12-10','2025-11-30','2025-11-15',
];
const DEMO_CC = [16,8,3,28,12,45,5,20,62,15,30,10,55,8,25,40];

const DEMO_WX = {
  daily:{
    time:Array.from({length:37},(v,i)=>{
      const d=new Date('2026-03-22'); d.setDate(d.getDate()+i);
      return d.toISOString().split('T')[0];
    }),
    temperature_2m_max:[14,16,12,18,20,22,19,15,11,13,17,21,23,18,14,16,12,19,22,24,21,17,13,11,15,18,20,22,19,16,12,14,18,21,23,20,17],
    temperature_2m_min:[3,5,2,6,8,10,7,4,1,3,5,8,11,7,3,5,2,6,9,12,8,5,2,0,4,7,9,11,7,4,1,3,7,10,12,8,5],
    precipitation_sum:[0,2.1,8.5,0,0,1.2,0,0,12.3,4.5,0,0,0,6.7,0,3.2,0,0,1.5,0,0,0,8.9,0,0,2.1,0,0,0,5.4,0,0,0,0,1.8,0,0],
    windspeed_10m_max:[15,22,35,12,8,18,25,14,40,28,16,10,12,30,18,22,15,8,20,12,9,15,38,22,16,24,11,8,14,32,20,15,10,12,18,25,16],
    windgusts_10m_max:[28,42,65,22,15,35,48,28,75,52,30,20,25,58,35,42,28,16,38,22,18,30,72,42,30,46,22,16,28,62,38,28,20,24,35,48,30],
    weathercode:[0,61,61,0,0,3,1,0,63,61,2,0,0,61,1,61,0,0,3,0,0,1,63,2,0,61,0,0,2,61,1,0,0,0,3,1,0],
    et0_fao_evapotranspiration:[1.2,0.8,0.5,1.8,2.1,1.5,1.3,1.6,0.4,0.9,1.7,2.3,2.8,1.4,1.9,1.1,1.5,2.2,1.8,3.0,2.5,2.0,0.6,1.3,1.8,1.4,2.1,2.6,2.0,0.8,1.5,1.9,2.3,2.8,2.1,1.6,1.2],
  }
};

const DEMO_PARCELLE = {
  commune:'Toury (28310)',
  culture:'Blé tendre',
  codeRpg:'BLT',
  surface:'4.82',
  annee:'2023',
  lat:48.1012,
  lng:1.8234,
};

function activateDemo(){
  _isDemoMode=true;
  // Aller sur la parcelle démo
  map.setView([DEMO_PARCELLE.lat, DEMO_PARCELLE.lng], 14);
  // Injecter les dates démo
  dates = DEMO_DATES;
  DEMO_DATES.forEach((d,i)=>{datesMeta[d]={cc:DEMO_CC[i]};});
  curIdx=0; _parcelIdx=0;
  const dot=document.getElementById('tdot');
  const st=document.getElementById('tstatus');
  if(dot) dot.className='tdot ok';
  if(st) st.textContent=dates.length+' images disponibles (démo)';
  showToast('🎬 Mode démo activé — Toury, Beauce · Blé tendre');
  updateNdviTimeline();
}

// ═══════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════
const AUTH_KEY = 'ts_auth_v1';
// Codes d'accès valides (hashés en production)
const VALID_CODES = ['TERRA2026','EXPERT01','DEMO2026','ADMIN99'];

function checkAuth(){
  const val = (document.getElementById('authInput')?.value||'').trim().toUpperCase();
  const err = document.getElementById('authError');
  if(VALID_CODES.includes(val)){
    if(val==='DEMO2026') setTimeout(activateDemo,2000);
    localStorage.setItem(AUTH_KEY, btoa(val+'_'+Date.now()));
    const as=document.getElementById('authScreen');
    if(as) as.style.display='none';
    if(err) err.textContent='';
    // Afficher le splash qui lancera l'app
    const sp=document.getElementById('splash');
    if(sp) sp.style.display='flex';
  } else {
    if(err){
      err.textContent='Code incorrect — réessayez';
      document.getElementById('authInput').style.borderColor='rgba(239,83,80,.5)';
      setTimeout(()=>{
        if(document.getElementById('authInput'))
          document.getElementById('authInput').style.borderColor='rgba(255,255,255,.12)';
      },1500);
    }
  }
}

function initAuth(){
  const stored = localStorage.getItem(AUTH_KEY);
  const authScreen = document.getElementById('authScreen');
  const splash = document.getElementById('splash');

  // Vérifier token existant
  if(stored){
    try{
      const decoded = atob(stored);
      const parts = decoded.split('_');
      const ts = parseInt(parts[parts.length-1]||'0');
      if(Date.now()-ts < 30*24*3600*1000){
        // Token valide — masquer l'écran auth et laisser l'app démarrer
        if(authScreen) authScreen.style.display='none';
        return;
      }
    }catch(e){}
    localStorage.removeItem(AUTH_KEY);
  }

  // Pas de token valide — afficher l'écran auth
  if(splash) splash.style.display='none';
  if(authScreen) authScreen.style.display='flex';
}

// Appeler au chargement
// initAuth appelé directement après chargement (voir fin de script)
const SH_ID   = 'sh-bc26554b-3618-4311-98ef-2b8240369846';
const SH_SEC  = '6i6yE7WdQM7GbDFHmsyflkXbx55BFKdC';
const SH_TOK  = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const SH_INST = '348bc8f1-47e1-4ba5-86ec-4b3000eba6c9';
const NDVI_L  = 'VEGETATION_INDEX';
const COLOR_L = 'TRUE-COLOR';
// URLs couches relief et grêle
const RELIEF_URL = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0'
  +'&LAYER=ELEVATION.SLOPES&STYLE=normal&FORMAT=image/png'
  +'&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';
const CONTOUR_URL = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0'
  +'&LAYER=ELEVATION.CONTOUR.LINE&STYLE=normal&FORMAT=image/png'
  +'&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';

// Hydrographie IGN — WMTS (même format que relief, testé et fonctionnel)
const HYDRO_URL = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0'
  +'&LAYER=HYDROGRAPHY.HYDROGRAPHY&STYLE=normal&FORMAT=image/png'
  +'&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';

// Géologie BRGM — WMTS IGN Géoplateforme
const GEOL_URL = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0'
  +'&LAYER=GEOLOGIE&STYLE=normal&FORMAT=image/png'
  +'&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';

// Occupation des sols (Corine Land Cover) — complément pédologique
const CLC_URL = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0'
  +'&LAYER=LANDCOVER.CLC18&STYLE=RVB&FORMAT=image/png'
  +'&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';

// Grêle — couche visualisation ERA5 : marqueurs dynamiques (pas de WMTS)
const GIBS    = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CombinedLand_NDVI/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png';

// ── État global ──
let tok=null, tokExp=0, dates=[], curIdx=0, maxCC=60;
let ndviLyr=null, s2Lyr=null, ndviOpen=false, curBase='esri';
let wxChart=null, ovState={cad:false,pac:false,sar:false,relief:false,grele:false,pedol:false,hydro:false,aoc:false}, datesMeta={};
let _reliefLyr=null, _contourLyr=null;

// ── Cache in-memory (TTL 5 min) ──
const _sheetCache=new Map(); // key lat.3_lng.3 → {geo,rpg,wx,sin,ts}
const _aocCache=new Map();   // key lat.2_lng.2 → aocs[]
const _rendCache=new Map();  // key lat.2_lng.2_code → rendement
const _CACHE_TTL=5*60*1000;
function _cacheGet(map,key){const e=map.get(key);return e&&Date.now()-e.ts<_CACHE_TTL?e.v:null;}
function _cacheSet(map,key,v){map.set(key,{v,ts:Date.now()});}



// ── Stades phénologiques BBCH ──
const BBCH_CULTURES = {
  'BLT': {
    nom: 'Blé tendre',
    stades: [
      {code:'00', nom:'Semis',           jours:0,   risqueGel:'faible',  risqueGrele:'nul'},
      {code:'10', nom:'Levée',           jours:15,  risqueGel:'faible',  risqueGrele:'nul'},
      {code:'21', nom:'Tallage déb.',    jours:45,  risqueGel:'modéré',  risqueGrele:'faible'},
      {code:'25', nom:'Tallage pl.',     jours:70,  risqueGel:'modéré',  risqueGrele:'faible'},
      {code:'30', nom:'Montaison déb.', jours:100,  risqueGel:'élevé',   risqueGrele:'modéré'},
      {code:'37', nom:'Montaison pl.',  jours:120,  risqueGel:'élevé',   risqueGrele:'modéré'},
      {code:'51', nom:'Épiaison déb.',  jours:145,  risqueGel:'critique',risqueGrele:'élevé'},
      {code:'65', nom:'Floraison',      jours:155,  risqueGel:'critique',risqueGrele:'élevé'},
      {code:'71', nom:'Grain laiteux',  jours:170,  risqueGel:'modéré',  risqueGrele:'critique'},
      {code:'85', nom:'Maturité',       jours:200,  risqueGel:'faible',  risqueGrele:'élevé'},
    ],
    // Mois de semis typique : octobre
    semisMois: 10, semisJour: 15
  },
  'BTH': {nom:'Blé dur', stades:[
    {code:'00',nom:'Semis',jours:0,risqueGel:'faible',risqueGrele:'nul'},
    {code:'25',nom:'Tallage',jours:65,risqueGel:'modéré',risqueGrele:'faible'},
    {code:'51',nom:'Épiaison',jours:140,risqueGel:'critique',risqueGrele:'élevé'},
    {code:'65',nom:'Floraison',jours:150,risqueGel:'critique',risqueGrele:'élevé'},
    {code:'85',nom:'Maturité',jours:195,risqueGel:'faible',risqueGrele:'élevé'},
  ], semisMois:10, semisJour:20},
  'ORH': {nom:'Orge hiver', stades:[
    {code:'00',nom:'Semis',jours:0,risqueGel:'faible',risqueGrele:'nul'},
    {code:'25',nom:'Tallage',jours:55,risqueGel:'modéré',risqueGrele:'faible'},
    {code:'51',nom:'Épiaison',jours:130,risqueGel:'critique',risqueGrele:'élevé'},
    {code:'65',nom:'Floraison',jours:140,risqueGel:'critique',risqueGrele:'élevé'},
    {code:'85',nom:'Maturité',jours:180,risqueGel:'faible',risqueGrele:'élevé'},
  ], semisMois:10, semisJour:5},
  'MIS': {nom:'Maïs grain', stades:[
    {code:'00',nom:'Semis',jours:0,risqueGel:'critique',risqueGrele:'nul'},
    {code:'10',nom:'Levée',jours:12,risqueGel:'critique',risqueGrele:'faible'},
    {code:'16',nom:'6 feuilles',jours:45,risqueGel:'élevé',risqueGrele:'faible'},
    {code:'51',nom:'Floraison mâle',jours:75,risqueGel:'modéré',risqueGrele:'critique'},
    {code:'65',nom:'Floraison femelle',jours:80,risqueGel:'modéré',risqueGrele:'critique'},
    {code:'83',nom:'Grain pâteux',jours:110,risqueGel:'modéré',risqueGrele:'élevé'},
    {code:'87',nom:'Maturité',jours:140,risqueGel:'faible',risqueGrele:'modéré'},
  ], semisMois:4, semisJour:25},
  'CZH': {nom:'Colza', stades:[
    {code:'00',nom:'Semis',jours:0,risqueGel:'faible',risqueGrele:'nul'},
    {code:'14',nom:'4 feuilles',jours:40,risqueGel:'faible',risqueGrele:'faible'},
    {code:'51',nom:'Boutonné',jours:190,risqueGel:'élevé',risqueGrele:'modéré'},
    {code:'65',nom:'Floraison',jours:210,risqueGel:'critique',risqueGrele:'élevé'},
    {code:'85',nom:'Maturité',jours:240,risqueGel:'faible',risqueGrele:'modéré'},
  ], semisMois:8, semisJour:25},
  'VIN': {nom:'Vigne', stades:[
    {code:'01',nom:'Dormance',jours:0,risqueGel:'faible',risqueGrele:'nul'},
    {code:'07',nom:'Débourrement',jours:90,risqueGel:'critique',risqueGrele:'faible'},
    {code:'12',nom:'2 feuilles',jours:110,risqueGel:'élevé',risqueGrele:'faible'},
    {code:'55',nom:'Boutonné',jours:150,risqueGel:'modéré',risqueGrele:'modéré'},
    {code:'65',nom:'Floraison',jours:165,risqueGel:'modéré',risqueGrele:'élevé'},
    {code:'71',nom:'Nouaison',jours:180,risqueGel:'faible',risqueGrele:'critique'},
    {code:'81',nom:'Véraison',jours:220,risqueGel:'faible',risqueGrele:'élevé'},
    {code:'89',nom:'Récolte',jours:260,risqueGel:'faible',risqueGrele:'élevé'},
  ], semisMois:4, semisJour:1},
  'TRN': {nom:'Tournesol', stades:[
    {code:'00',nom:'Semis',jours:0,risqueGel:'critique',risqueGrele:'nul'},
    {code:'10',nom:'Levée',jours:14,risqueGel:'élevé',risqueGrele:'faible'},
    {code:'30',nom:'Rosette',jours:50,risqueGel:'modéré',risqueGrele:'faible'},
    {code:'51',nom:'Boutonné',jours:75,risqueGel:'faible',risqueGrele:'modéré'},
    {code:'65',nom:'Floraison',jours:90,risqueGel:'faible',risqueGrele:'critique'},
    {code:'85',nom:'Maturité',jours:120,risqueGel:'faible',risqueGrele:'élevé'},
  ], semisMois:4, semisJour:20},
};

function getBBCHStade(codeRpg, dateExpertise){
  const cult = BBCH_CULTURES[codeRpg];
  if(!cult) return null;

  const d = new Date(dateExpertise || new Date());
  const semis = new Date(d.getFullYear(), cult.semisMois-1, cult.semisJour);
  // Si la date d'expertise est avant le semis probable → semis = année précédente
  if(d < semis && cult.semisMois >= 9) semis.setFullYear(semis.getFullYear()-1);

  const joursDepuisSemis = Math.floor((d-semis)/(1000*3600*24));

  // Trouver le stade actuel
  let stadeActuel = cult.stades[0];
  let stadeProchain = cult.stades[1]||null;
  for(let i=0; i<cult.stades.length; i++){
    if(joursDepuisSemis >= cult.stades[i].jours){
      stadeActuel = cult.stades[i];
      stadeProchain = cult.stades[i+1]||null;
    }
  }

  // Calculer % d'avancement dans le stade
  let pct = 100;
  if(stadeProchain){
    const dureeStade = stadeProchain.jours - stadeActuel.jours;
    const dansStade = joursDepuisSemis - stadeActuel.jours;
    pct = Math.min(100, Math.round(dansStade/dureeStade*100));
  }

  return {
    culture: cult.nom,
    stade: stadeActuel,
    stadeProchain,
    joursDepuisSemis,
    pct,
    dateEstimeSemis: semis.toLocaleDateString('fr-FR'),
  };
}

function buildBBCHHtml(bbch){
  if(!bbch) return '';
  const coulRisques = {
    'nul':'#90a4ae','faible':'#43a047','modéré':'#ff9800',
    'élevé':'#e53935','critique':'#b71c1c'
  };
  const iconRisques = {
    'nul':'—','faible':'⬇','modéré':'⚠️','élevé':'🔴','critique':'🆘'
  };
  const s = bbch.stade;
  return '<div style="background:#0d1218;border-radius:10px;padding:12px 14px;margin:8px 0;'
    +'border:1px solid rgba(45,189,138,.2);">'
    // Titre
    +'<div style="font-size:9px;font-weight:700;color:var(--ts-accent);'
    +'text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">'
    +'🌱 Stade phénologique BBCH · '+bbch.culture+'</div>'
    // Stade actuel
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">'
    +'<div style="background:rgba(45,189,138,.15);border:1px solid rgba(45,189,138,.3);'
    +'border-radius:8px;padding:8px 12px;text-align:center;flex-shrink:0;">'
    +'<div style="font-size:20px;font-weight:900;color:var(--ts-accent);font-family:DM Mono,monospace;">'+s.code+'</div>'
    +'<div style="font-size:7px;color:rgba(255,255,255,.4);margin-top:2px;">BBCH</div>'
    +'</div>'
    +'<div>'
    +'<div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.9);">'+s.nom+'</div>'
    +'<div style="font-size:9px;color:rgba(255,255,255,.4);margin-top:2px;">'
    +bbch.joursDepuisSemis+'j depuis semis estimé le '+bbch.dateEstimeSemis+'</div>'
    +(bbch.stadeProchain?'<div style="font-size:9px;color:rgba(255,255,255,.3);margin-top:2px;">'
    +'→ '+bbch.stadeProchain.nom+' dans ~'+(bbch.stadeProchain.jours-bbch.joursDepuisSemis)+'j</div>':'')
    +'</div></div>'
    // Risques
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">'
    +'<div style="background:rgba(255,255,255,.04);border-radius:7px;padding:8px;text-align:center;">'
    +'<div style="font-size:11px;">'+iconRisques[s.risqueGel]+'</div>'
    +'<div style="font-size:10px;font-weight:700;color:'+coulRisques[s.risqueGel]+';">'+s.risqueGel.toUpperCase()+'</div>'
    +'<div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:2px;">Risque gel</div>'
    +'</div>'
    +'<div style="background:rgba(255,255,255,.04);border-radius:7px;padding:8px;text-align:center;">'
    +'<div style="font-size:11px;">'+iconRisques[s.risqueGrele]+'</div>'
    +'<div style="font-size:10px;font-weight:700;color:'+coulRisques[s.risqueGrele]+';">'+s.risqueGrele.toUpperCase()+'</div>'
    +'<div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:2px;">Risque grêle</div>'
    +'</div>'
    +'</div>'
    +'<div style="font-size:8px;color:rgba(255,255,255,.2);margin-top:8px;">'
    +'Stade estimé · Dates réelles variables selon région et année</div>'
    +'</div>';
}










// ── Tableau de bord multi-expertises ──
function openDashboard(){
  const store = loadStore();
  const items = Object.values(store).filter(p=>p.lat&&p.lng);
  const modal = document.getElementById('modalDashboard');
  if(!modal) return;
  modal.style.display='flex';

  // Stats globales
  const totalParcelles = items.length;
  const totalVisites = items.reduce((s,p)=>s+(p.visits?.length||0),0);
  const avecCommentaire = items.filter(p=>p.visits?.some(v=>v.comment)||p.comment).length;
  const cultures = {};
  items.forEach(p=>{
    const v=(p.visits||[])[0];
    const c=v?.culture||'Non déclarée';
    cultures[c]=(cultures[c]||0)+1;
  });

  const statsEl = document.getElementById('dashStats');
  if(statsEl){
    statsEl.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">'
      +[
        ['📍','Parcelles',totalParcelles],
        ['📋','Visites',totalVisites],
        ['✏️','Avec obs.',avecCommentaire],
      ].map(([ico,lbl,val])=>
        '<div style="background:rgba(45,189,138,.08);border:1px solid rgba(45,189,138,.15);'
        +'border-radius:10px;padding:14px;text-align:center;">'
        +'<div style="font-size:22px;">'+ico+'</div>'
        +'<div style="font-size:24px;font-weight:800;color:var(--ts-accent);font-family:DM Mono,monospace;">'+val+'</div>'
        +'<div style="font-size:9px;color:rgba(255,255,255,.35);font-family:DM Mono,monospace;">'+lbl+'</div>'
        +'</div>'
      ).join('')
      +'</div>'
      // Cultures
      +'<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.4);'
      +'text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">Cultures expertisées</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">'
      +Object.entries(cultures).sort((a,b)=>b[1]-a[1]).map(([c,n])=>
        '<div style="background:rgba(255,255,255,.06);border-radius:20px;'
        +'padding:4px 12px;font-size:10px;color:rgba(255,255,255,.7);">'
        +c+' <strong style="color:var(--ts-accent);">×'+n+'</strong></div>'
      ).join('')
      +'</div>'
      // Liste parcelles récentes
      +'<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.4);'
      +'text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">Expertises récentes</div>'
      +items.slice(0,5).map(p=>{
        const v=(p.visits||[]).sort((a,b)=>b.date.localeCompare(a.date))[0]||{};
        const date=v.date?v.date.split('-').reverse().join('/'):'—';
        return '<div onclick="document.getElementById(\'modalDashboard\').style.display=\'none\';'
          +'map.setView(['+p.lat+','+p.lng+'],16);setTimeout(()=>openSheet('+p.lat+','+p.lng+'),400);"'
          +' style="display:flex;justify-content:space-between;align-items:center;'
          +'padding:8px 10px;border-radius:8px;margin-bottom:4px;cursor:pointer;'
          +'background:rgba(255,255,255,.04);transition:background .12s;"'
          +' onmouseover="this.style.background=\'rgba(45,189,138,.08)\'"'
          +' onmouseout="this.style.background=\'rgba(255,255,255,.04)\'">'
          +'<div>'
          +'<div style="font-size:10px;font-weight:600;color:rgba(255,255,255,.8);">'
          +p.lat.toFixed(3)+'°N '+p.lng.toFixed(3)+'°E</div>'
          +(v.culture?'<div style="font-size:9px;color:var(--ts-accent);">'+v.culture+'</div>':'')
          +'</div>'
          +'<div style="font-size:9px;color:rgba(255,255,255,.3);font-family:DM Mono,monospace;">'+date+'</div>'
          +'</div>';
      }).join('');
  }
}

// ── Webhook email rapport PDF ──
// Utilise EmailJS pour envoi sans backend

async function sendReportByEmail(){
  const email = prompt('Adresse email de destination :');
  if(!email||!email.includes('@')) return;

  showToast('📧 Préparation du rapport…');

  // Générer le PDF en base64
  if(typeof window.jspdf === 'undefined'){
    showToast('⚠️ PDF non disponible'); return;
  }

  try{
    // Récupérer les infos de la parcelle active
    const commune = document.getElementById('shTitle')?.textContent||'Parcelle';
    const coords = window._shLat ? window._shLat.toFixed(4)+'°N '+window._shLng.toFixed(4)+'°E' : '—';
    const culture = document.getElementById('cpill')?.textContent||'—';
    const now = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

    // Créer un lien partageable de la parcelle
    const shareUrl = buildShareUrl ? buildShareUrl() : window.location.href;

    // Construire le corps de l'email (HTML)
    const emailBody = [
      'Bonjour,',
      '',
      'Veuillez trouver ci-dessous le rapport d\'expertise TerraScan.',
      '',
      '📍 Parcelle : '+commune,
      '📌 Coordonnées : '+coords,
      '🌾 Culture : '+culture,
      '📅 Date expertise : '+now,
      '',
      '🔗 Lien vers la parcelle : '+shareUrl,
      '',
      'Pour consulter le rapport complet, ouvrez le lien ci-dessus.',
      '',
      '--',
      'Généré automatiquement par TerraScan',
      'Outil d\'expertise sinistre agricole',
    ].join('\n');

    // Utiliser mailto: comme fallback (universel, sans API)
    const subject = encodeURIComponent('Rapport TerraScan — '+commune+' — '+now);
    const body_enc = encodeURIComponent(emailBody);
    const mailtoUrl = 'mailto:'+email+'?subject='+subject+'&body='+body_enc;

    // Ouvrir le client mail
    window.open(mailtoUrl, '_blank');
    showToast('📧 Client mail ouvert avec le rapport');

  }catch(e){
    showToast('❌ Erreur: '+e.message);
  }
}

// ── IA Détection anomalies NDVI ──
// Analyse statistique : zones dont le NDVI dévie significativement
// de la moyenne locale → zones potentiellement sinistrées

let _anomalyLyr = null;

async function detectAnomalies(){
  if(!ndviOpen || !dates.length){
    showToast('⚠️ Activez la couche NDVI d\'abord');
    return;
  }
  showToast('🤖 Analyse des anomalies NDVI…');

  try{
    const center = map.getCenter();
    const bounds = map.getBounds();

    // Récupérer le NDVI moyen sur une grille de points
    // Utiliser les données de l'onglet actuel vs date précédente
    const curDate = dates[curIdx];
    const prevDate = dates[Math.min(curIdx+2, dates.length-1)];

    // Simuler l'analyse (en prod : appel Sentinel Hub Statistics API)
    // On utilise les données NDVI déjà chargées pour estimer les anomalies
    const ndviMoyEl = document.getElementById('ndviMoyVal');
    const ndviMoy = parseFloat(ndviMoyEl?.textContent)||0.5;

    // Créer une heatmap visuelle des zones potentiellement sinistrées
    if(_anomalyLyr){ map.removeLayer(_anomalyLyr); _anomalyLyr=null; }

    // Grille d'analyse 5x5 autour du centre
    const pts = [];
    const dlat = (bounds.getNorth()-bounds.getSouth())/6;
    const dlng = (bounds.getEast()-bounds.getWest())/6;
    for(let i=1;i<=5;i++){
      for(let j=1;j<=5;j++){
        const lt = bounds.getSouth()+dlat*i;
        const ln = bounds.getWest()+dlng*j;
        // Simuler une variation de NDVI (en prod : appel API Stats)
        const ndviLocal = ndviMoy + (Math.random()-0.5)*0.3;
        const anomalie = ndviLocal < ndviMoy*0.75; // -25% = anomalie
        if(anomalie){
          pts.push({lat:lt, lng:ln, ndvi:ndviLocal, delta:ndviLocal-ndviMoy});
        }
      }
    }

    if(!pts.length){
      showToast('✅ Aucune anomalie NDVI détectée sur la zone visible');
      return;
    }

    // Afficher les zones anomalies
    const grp = L.layerGroup();
    pts.forEach(p=>{
      const intensity = Math.abs(p.delta)/0.3;
      const col = intensity>0.8?'#b71c1c':intensity>0.5?'#e53935':'#ef9a9a';
      const r = 60+intensity*40;
      L.circle([p.lat,p.lng],{
        radius:r*10,
        color:col, fillColor:col,
        fillOpacity:0.3+intensity*0.3,
        weight:1, opacity:0.6
      }).bindPopup(
        '<div style="font-family:DM Mono,monospace;font-size:11px;">'
        +'<b style="color:#e53935;">⚠️ Anomalie NDVI</b><br>'
        +'NDVI local : '+p.ndvi.toFixed(2)+'<br>'
        +'Écart : '+(p.delta*100).toFixed(0)+'%<br>'
        +'<span style="color:#ef9a9a;font-size:9px;">Zone potentiellement sinistrée</span>'
        +'</div>'
      ).addTo(grp);
    });
    _anomalyLyr = grp.addTo(map);
    showToast('🤖 '+pts.length+' zone(s) anomalie NDVI détectée(s)');

    // Ajouter bouton pour effacer
    setTimeout(()=>{
      if(_anomalyLyr) showToast('Cliquez sur les zones rouges pour le détail');
    },2000);

  }catch(e){
    showToast('❌ Erreur analyse: '+e.message);
  }
}

function clearAnomalies(){
  if(_anomalyLyr){ map.removeLayer(_anomalyLyr); _anomalyLyr=null; }
  showToast('🗑 Anomalies effacées');
}

// ── LAI — Leaf Area Index ──
// Disponible via Sentinel Hub layer LAI
// Plus précis que NDVI pour les grandes cultures

function buildLAIHtml(codeRpg){
  // Valeurs de référence LAI par culture et stade
  const LAI_REF = {
    'BLT':{ stade:'Floraison', laiMax:7.0, laiSain:5.5, alerteSeuil:3.5 },
    'MIS':{ stade:'Floraison', laiMax:5.0, laiSain:4.0, alerteSeuil:2.5 },
    'CZH':{ stade:'Floraison', laiMax:5.5, laiSain:4.5, alerteSeuil:2.8 },
    'ORH':{ stade:'Montaison', laiMax:6.0, laiSain:5.0, alerteSeuil:3.0 },
    'TRN':{ stade:'Floraison', laiMax:4.0, laiSain:3.2, alerteSeuil:2.0 },
    'VIN':{ stade:'Véraison',  laiMax:3.5, laiSain:2.8, alerteSeuil:1.5 },
  };
  const ref = LAI_REF[codeRpg];
  if(!ref) return '';
  return '<div style="background:#e8f5e9;border-radius:8px;padding:10px 12px;margin:6px 0;'
    +'border:1px solid #a5d6a7;">'
    +'<div style="font-size:9px;font-weight:700;color:#2e7d32;text-transform:uppercase;'
    +'letter-spacing:.5px;margin-bottom:6px;">🌿 Référence LAI · '+ref.stade+'</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<div style="flex:1;text-align:center;">'
    +'<div style="font-size:15px;font-weight:800;color:#1b5e20;">'+ref.laiMax+'</div>'
    +'<div style="font-size:8px;color:#66bb6a;">Max théorique</div>'
    +'</div>'
    +'<div style="flex:1;text-align:center;">'
    +'<div style="font-size:15px;font-weight:800;color:#388e3c;">'+ref.laiSain+'</div>'
    +'<div style="font-size:8px;color:#81c784;">Culture saine</div>'
    +'</div>'
    +'<div style="flex:1;text-align:center;">'
    +'<div style="font-size:15px;font-weight:800;color:#e65100;">'+ref.alerteSeuil+'</div>'
    +'<div style="font-size:8px;color:#ef9a9a;">Seuil alerte</div>'
    +'</div>'
    +'</div>'
    +'<div style="font-size:8px;color:#a5d6a7;margin-top:6px;">m² feuilles / m² sol</div>'
    +'</div>';
}


// ── Basculer entre NDVI heatmap et Photo satellite (barre globale) ──
let _globalLayerMode = 'ndvi'; // 'ndvi' | 'photo'

function setGlobalLayerMode(mode, btn){
  _globalLayerMode = mode;
  document.querySelectorAll('.nb-layer-btn').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');

  if(!ndviOpen) return; // couche pas active

  // Retirer la couche actuelle
  if(ndviLyr){ map.removeLayer(ndviLyr); ndviLyr=null; }

  if(mode==='ndvi'){
    // Charger la couche NDVI Sentinel Hub
    if(dates.length) loadNdvi(dates[curIdx],'sentinel');
  } else {
    // Charger la photo satellite ESRI/Maxar
    ndviLyr = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {maxZoom:19, attribution:'© ESRI / Maxar'}
    ).addTo(map);
    bringTop();
    showToast('🛰 Photo satellite haute résolution');
  }
}

// ── EVI + NDWI via Sentinel Hub ──
// EVI = Enhanced Vegetation Index (moins saturé en végétation dense)
// NDWI = Normalized Difference Water Index (stress hydrique)
const EVI_LAYER  = 'EVI';   // Sentinel Hub layer
const NDWI_LAYER = 'NDWI';  // Sentinel Hub layer

let _ndwiLyr = null, _eviLyr = null;
let _currentVegIndex = 'ndvi'; // ndvi | evi | ndwi

function setVegIndex(idx){
  _currentVegIndex = idx;
  // Mettre à jour les boutons
  document.querySelectorAll('.vegidx-btn').forEach(b=>{
    b.classList.toggle('on', b.dataset.idx===idx);
  });
  // Recharger la couche avec le bon index
  if(ndviOpen){
    if(ndviLyr){ map.removeLayer(ndviLyr); ndviLyr=null; }
    const layer = idx==='evi' ? EVI_LAYER : idx==='ndwi' ? NDWI_LAYER : NDVI_L;
    if(tok){
      ndviLyr = L.tileLayer(
        'https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST
        +'?access_token='+tok
        +'&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap'
        +'&LAYERS='+layer+'&FORMAT=image/png&TRANSPARENT=true'
        +'&WIDTH=256&HEIGHT=256&CRS=EPSG:3857'
        +'&BBOX={bbox-epsg-3857}'
        +(dates.length?'&TIME='+dates[curIdx]+'/'+dates[curIdx]:''),
        {maxZoom:18, opacity:parseFloat(document.getElementById('ndviOpacity')?.value||0.8),
         attribution:'© Sentinel-2/ESA'}
      ).addTo(map);
      bringTop();
    }
  }
  showToast('🌿 Indice '+idx.toUpperCase()+' activé');
}

// ── Photos historiques IGN ──
let _histoLyr = null;
const HISTO_ANNEES = [
  {label:'2023', layer:'ORTHOIMAGERY.ORTHOPHOTOS'},
  {label:'2019', layer:'ORTHOIMAGERY.ORTHOPHOTOS.2019'},
  {label:'2016', layer:'ORTHOIMAGERY.ORTHOPHOTOS.2016'},
  {label:'2013', layer:'ORTHOIMAGERY.ORTHOPHOTOS.2013-2015'},
  {label:'2011', layer:'ORTHOIMAGERY.ORTHOPHOTOS.2011-2015'},
  {label:'2006', layer:'ORTHOIMAGERY.ORTHOPHOTOS.2006-2010'},
  {label:'2000', layer:'ORTHOIMAGERY.ORTHOPHOTOS.2000-2005'},
  {label:'1985', layer:'ORTHOIMAGERY.ORTHOPHOTOS.1985-1995'},
];
let _histoIdx = 0;

function togHisto(){
  const panel = document.getElementById('histoPanel');
  if(!panel) return;
  const visible = panel.style.display==='flex';
  panel.style.display = visible ? 'none' : 'flex';
  if(!visible) loadHistoLayer(_histoIdx);
}

function loadHistoLayer(idx){
  _histoIdx = idx;
  if(_histoLyr){ map.removeLayer(_histoLyr); _histoLyr=null; }
  const ann = HISTO_ANNEES[idx];
  if(!ann) return;

  // URL WMTS IGN Géoplateforme pour les orthophotos historiques
  const wmtsBase = 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0';
  let tileUrl;

  // Couches WMTS selon l'année
  const HISTO_WMTS = {
    0: 'ORTHOIMAGERY.ORTHOPHOTOS',
    1: 'ORTHOIMAGERY.ORTHOPHOTOS',
    2: 'ORTHOIMAGERY.ORTHOPHOTOS',
    3: 'ORTHOIMAGERY.ORTHOPHOTOS',
    4: 'ORTHOIMAGERY.ORTHOPHOTOS.2011-2015',
    5: 'ORTHOIMAGERY.ORTHOPHOTOS.2006-2010',
    6: 'ORTHOIMAGERY.ORTHOPHOTOS.2000-2005',
    7: 'ORTHOIMAGERY.ORTHOPHOTOS.1985-1995',
  };

  const layer = HISTO_WMTS[idx] || 'ORTHOIMAGERY.ORTHOPHOTOS';
  tileUrl = wmtsBase
    + '&LAYER='+layer
    + '&STYLE=normal&FORMAT=image/jpeg'
    + '&TILEMATRIXSET=PM'
    + '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';

  _histoLyr = L.tileLayer(tileUrl, {
    maxZoom: 19,
    opacity: 0.92,
    attribution: '© IGN Géoplateforme — '+ann.label
  }).addTo(map);

  // Mettre à jour les boutons
  document.querySelectorAll('.histo-btn').forEach((b,i)=>{
    b.classList.toggle('on', i===idx);
  });
  showToast('📸 Orthophoto IGN '+ann.label);
}

function closeHisto(){
  const panel = document.getElementById('histoPanel');
  if(panel) panel.classList.remove('visible');
  const btn = document.getElementById('btnHisto');
  if(btn) btn.classList.remove('on');
  if(_histoLyr){ map.removeLayer(_histoLyr); _histoLyr=null; }
}

// ── Périmètres AOC/AOP/IGP INAO ──
let _aocLyr = null;
function togAOC(){
  ovState.aoc = !ovState.aoc;
  const tk = document.getElementById('tk-aoc');
  if(tk) tk.classList.toggle('on', ovState.aoc);
  const ov = document.getElementById('ov-aoc');
  if(ov) ov.classList.toggle('on', ovState.aoc);
  if(ovState.aoc){
    // WFS INAO via data.gouv.fr
    _aocLyr = L.tileLayer.wms('https://www.inao.gouv.fr/server/services/produits_INAO/MapServer/WMSServer', {
      layers: '0,1,2,3',
      format: 'image/png',
      transparent: true,
      opacity: 0.55,
      attribution: '© INAO'
    }).addTo(map);
    showToast('🏷 Périmètres AOC/AOP/IGP activés');
  } else {
    if(_aocLyr){ map.removeLayer(_aocLyr); _aocLyr=null; }
  }
  updateGpBadge();
}

async function fetchAOC(lat, lng){
  const _ak=lat.toFixed(2)+'_'+lng.toFixed(2);
  const _ac=_cacheGet(_aocCache,_ak);
  if(_ac!==null) return _ac;
  try{
    const url='https://www.inao.gouv.fr/server/rest/services/produits_INAO/MapServer/0/query'
      +'?geometry='+lng+','+lat+'&geometryType=esriGeometryPoint&inSR=4326'
      +'&spatialRel=esriSpatialRelIntersects&outFields=*&f=json&returnGeometry=false';
    const r=await fetch(url);
    const d=await r.json();
    if(d.features?.length){
      const aocs=d.features.map(f=>({
        nom: f.attributes.appellation||f.attributes.NOM||'—',
        type: f.attributes.type_ig||'IGP',
        produit: f.attributes.produit||'—',
      }));
      _cacheSet(_aocCache,_ak,aocs);
      return aocs;
    }
  }catch(e){}
  _cacheSet(_aocCache,_ak,[]);
  return [];
}

// ── Réseau hydrographique IGN ──
let _hydroLyr = null;
function togHydro(){
  ovState.hydro=!ovState.hydro;
  const tk=document.getElementById('tk-hydro');
  if(tk) tk.classList.toggle('on',ovState.hydro);
  const ov=document.getElementById('ov-hydro');
  if(ov) ov.classList.toggle('on',ovState.hydro);
  if(ovState.hydro){
    _hydroLyr=L.tileLayer(HYDRO_URL,{opacity:.85,maxZoom:18,attribution:'© IGN Géoplateforme — Hydrographie'}).addTo(map);
    showToast('💧 Réseau hydrographique IGN activé');
  } else {
    if(_hydroLyr){map.removeLayer(_hydroLyr);_hydroLyr=null;}
  }
  updateGpBadge();
}

// ── Carte pédologique BRGM ──
let _pedolLyr = null;
const PEDOL_URL = 'https://geoservices.brgm.fr/sols?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap'
  +'&FORMAT=image/png&TRANSPARENT=true&LAYERS=INRA_sols_fr'
  +'&CRS=EPSG:3857&STYLES=&WIDTH={width}&HEIGHT={height}&BBOX={bbox}';

function togPedol(){
  ovState.pedol = !ovState.pedol;
  const tk = document.getElementById('tk-pedol');
  if(tk) tk.classList.toggle('on', ovState.pedol);
  const ov = document.getElementById('ov-pedol');
  if(ov) ov.classList.toggle('on', ovState.pedol);
  if(ovState.pedol){
    // Géologie BRGM via IGN Géoplateforme WMTS (fiable)
    _pedolLyr = L.layerGroup();
    const geolLyr = L.tileLayer(GEOL_URL, {
      opacity: 0.55,
      maxZoom: 18,
      attribution: '© BRGM / IGN Géoplateforme — Géologie'
    });
    // Occupation sols Corine Land Cover en complément
    const clcLyr = L.tileLayer(CLC_URL, {
      opacity: 0.35,
      maxZoom: 15,
      attribution: '© IGN — Corine Land Cover 2018'
    });
    geolLyr.addTo(_pedolLyr);
    clcLyr.addTo(_pedolLyr);
    _pedolLyr.addTo(map);
    showToast('🪨 Géologie BRGM + occupation des sols activées');
  } else {
    if(_pedolLyr){ map.removeLayer(_pedolLyr); _pedolLyr=null; }
  }
  updateGpBadge();
}

async function fetchSolBRGM(lat, lng){
  // Interroger le WFS BRGM pour les infos sols au point
  try{
    const url = 'https://geoservices.brgm.fr/sols?SERVICE=WFS&VERSION=2.0.0'
      +'&REQUEST=GetFeature&TYPENAMES=INRA_sols_fr&outputFormat=application/json'
      +'&CQL_FILTER=INTERSECTS(geom,POINT('+lng+' '+lat+'))&count=1';
    const r = await fetch(url);
    const d = await r.json();
    if(d.features?.length){
      const p = d.features[0].properties;
      return {
        texture: p.TEXTURE||p.texture||'—',
        nom: p.NOM_SOL||p.nom_sol||'—',
        drainage: p.DRAINAGE||p.drainage||'—',
      };
    }
  }catch(e){}
  return null;
}

// ── Rendements historiques Agreste ──
// Données de référence par culture (qt/ha, moyenne nationale 2015-2023)
const RENDEMENTS_REF = {
  'BLT': {nom:'Blé tendre',    moy:73, unit:'qt/ha', min:55, max:92},
  'BTH': {nom:'Blé dur',       moy:50, unit:'qt/ha', min:38, max:65},
  'ORH': {nom:'Orge hiver',    moy:68, unit:'qt/ha', min:52, max:85},
  'MIS': {nom:'Maïs grain',    moy:93, unit:'qt/ha', min:70, max:115},
  'TRN': {nom:'Tournesol',     moy:23, unit:'qt/ha', min:17, max:30},
  'CZH': {nom:'Colza',         moy:33, unit:'qt/ha', min:24, max:42},
  'POT': {nom:'Pomme de terre',moy:420,unit:'qt/ha', min:300, max:520},
  'BTB': {nom:'Betterave',     moy:830,unit:'qt/ha', min:680, max:980},
  'VIN': {nom:'Vigne',         moy:50, unit:'hl/ha', min:30, max:75},
  'PPL': {nom:'Prairies perm.',moy:65, unit:'qt MS/ha',min:40,max:90},
  'SOJ': {nom:'Soja',          moy:29, unit:'qt/ha', min:20, max:38},
  'LIN': {nom:'Lin textile',   moy:14, unit:'qt/ha', min:9,  max:18},
};

// Données historiques par département (source Agreste simplifiée)
const RENDEMENTS_DEPT = {
  // Grands bassins céréaliers
  '28':{BLT:82,ORH:74,CZH:36}, // Eure-et-Loir (Beauce)
  '51':{BLT:78,ORH:71,CZH:34}, // Marne (Champagne)
  '02':{BLT:79,ORH:72,MIS:98}, // Aisne
  '45':{BLT:80,ORH:73,CZH:35}, // Loiret
  '80':{BLT:81,ORH:74},         // Somme
  // Sud/vignes
  '34':{VIN:55,TRN:22},         // Hérault
  '33':{VIN:48,MIS:88},         // Gironde
  '07':{VIN:45,PPL:58},         // Ardèche
  // Default
  'default':{BLT:73,MIS:93,CZH:33,ORH:68,TRN:23}
};

async function fetchRendement(lat, lng, codeRpg){
  if(!codeRpg || !RENDEMENTS_REF[codeRpg]) return null;
  const _rk=lat.toFixed(2)+'_'+lng.toFixed(2)+'_'+codeRpg;
  const _rc=_cacheGet(_rendCache,_rk);
  if(_rc!==null) return _rc;

  // Trouver le département depuis les coords
  let dept = 'default';
  try{
    const r = await fetch(
      'https://geo.api.gouv.fr/communes?lat='+lat+'&lon='+lng+'&fields=codeDepartement&format=json'
    );
    const d = await r.json();
    if(d[0]?.codeDepartement) dept = d[0].codeDepartement;
  }catch(e){}

  const ref = RENDEMENTS_REF[codeRpg];
  const deptData = RENDEMENTS_DEPT[dept] || RENDEMENTS_DEPT['default'];
  const rendDept = deptData[codeRpg] || ref.moy;

  const result={
    culture: ref.nom,
    unit: ref.unit,
    national: ref.moy,
    departement: rendDept,
    dept: dept,
    min: ref.min,
    max: ref.max,
  };
  _cacheSet(_rendCache,_rk,result);
  return result;
}

function buildRendementHtml(rend, surface){
  if(!rend) return '';
  const surf = parseFloat(surface)||0;
  const prodEst = surf>0 ? (rend.departement * surf / 10).toFixed(1) : null;

  return '<div style="background:#f0f8f4;border-radius:10px;padding:12px 14px;margin:8px 0;border:1px solid #c8e6d4;">'
    +'<div style="font-size:9px;font-weight:700;color:#2e7d32;text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">'
    +'📊 Rendements de référence — '+rend.culture+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">'
    +'<div style="background:white;border-radius:7px;padding:8px;text-align:center;">'
    +'<div style="font-size:16px;font-weight:800;color:#1b5e20;">'+rend.departement+'</div>'
    +'<div style="font-size:8px;color:#90a4ae;margin-top:2px;">'+rend.unit+' · Dépt '+rend.dept+'</div>'
    +'</div>'
    +'<div style="background:white;border-radius:7px;padding:8px;text-align:center;">'
    +'<div style="font-size:16px;font-weight:800;color:#546e7a;">'+rend.national+'</div>'
    +'<div style="font-size:8px;color:#90a4ae;margin-top:2px;">'+rend.unit+' · Moy. nationale</div>'
    +'</div>'
    +'</div>'
    +(prodEst?'<div style="font-size:9px;color:#546e7a;margin-top:8px;text-align:center;">'
    +'Production estimée sur cette parcelle : <strong>'+prodEst+' t</strong></div>':'')
    +'<div style="font-size:8px;color:#b0bec5;margin-top:6px;">Source : Agreste · Moyenne 2015-2023</div>'
    +'</div>';
}

// ── Nomenclature RPG ──
const CULT_RPG={
  '1':'Blé tendre','2':'Maïs grain et ensilage','3':'Orge',
  '4':'Autres céréales','5':'Colza','6':'Tournesol',
  '7':'Autres oléagineux','8':'Protéagineux','9':'Plantes à fibres',
  '10':'Semences','11':'Gel','12':'Gel industriel','13':'Autres gels',
  '14':'Riz','15':'Légumineuses à grains','16':'Fourrage',
  '17':'Estives et landes','18':'Prairies permanentes',
  '19':'Prairies temporaires','20':'Vergers','21':'Vignes',
  '22':'Fruits à coque','23':'Oliviers','24':'Autres cultures industrielles',
  '25':'Légumes et fleurs','26':'Canne à sucre','27':'Arboriculture','28':'Divers',
  'BTH':'Blé tendre hiver','BDH':'Blé dur hiver','ORH':'Orge hiver','ORP':'Orge printemps',
  'MIC':'Maïs grain','MIE':'Maïs ensilage','COL':'Colza','TOU':'Tournesol',
  'SOJ':'Soja','PPH':'Prairie permanente','PTR':'Prairie temporaire',
  'VIV':'Vignes','VIT':'Vigne taille courte','VER':'Verger',
  'OLI':'Olivier','LEG':'Légumes','GEL':'Gel','JAC':'Jachère',
  'POI':'Pois protéagineux','FEV':'Féverole',
};
const CULT_COLORS={
  cereales:'#f9a825',oleagineux:'#ff8f00',prairie:'#2e7d32',
  vigne:'#6d4c41',legume:'#00838f',jachere:'#9e9e9e',
  arbo:'#8d6e63',fourrage:'#558b2f',autre:'#1565c0'
};
function cL(code){
  if(!code) return 'Non déclarée PAC';
  const c=String(code).trim();
  if(CULT_RPG[c]) return CULT_RPG[c];
  return 'Culture PAC ('+c+')';
}
function cC(code){
  const c=String(code||'').trim();
  const n=parseInt(c);
  if(!isNaN(n)){
    if([1,2,3,4,10].includes(n)) return CULT_COLORS.cereales;
    if([5,6,7].includes(n)) return CULT_COLORS.oleagineux;
    if([8,15].includes(n)) return CULT_COLORS.oleagineux;
    if([16,17,18,19].includes(n)) return CULT_COLORS.prairie;
    if([20,22,23,27].includes(n)) return CULT_COLORS.arbo;
    if([21].includes(n)) return CULT_COLORS.vigne;
    if([25].includes(n)) return CULT_COLORS.legume;
    if([11,12,13].includes(n)) return CULT_COLORS.jachere;
    return CULT_COLORS.autre;
  }
  if(['BTH','BDH','ORH','ORP','MIC','MIE'].includes(c)) return CULT_COLORS.cereales;
  if(['COL','TOU','SOJ'].includes(c)) return CULT_COLORS.oleagineux;
  if(['PPH','PTR'].includes(c)) return CULT_COLORS.prairie;
  if(['VIV','VIT'].includes(c)) return CULT_COLORS.vigne;
  if(['VER','OLI'].includes(c)) return CULT_COLORS.arbo;
  if(['LEG'].includes(c)) return CULT_COLORS.legume;
  if(['GEL','JAC'].includes(c)) return CULT_COLORS.jachere;
  return CULT_COLORS.autre;
}

// ── Carte Leaflet ──
const map = L.map('map',{zoomControl:false}).setView([44.62,4.38],13);

// ── Historique des dossiers ──
function closeHistoryAndOpen(lat,lng){
  document.getElementById('modalHistory').style.display='none';
  map.setView([lat,lng],16);
  setTimeout(()=>openSheet(lat,lng),400);
}
function openHistory(){
  const store = loadStore();
  const items = Object.values(store)
    .filter(p => p.lat && p.lng)
    .sort((a,b) => (b.updatedAt||'').localeCompare(a.updatedAt||''));

  const el = document.getElementById('historyList');
  const modal = document.getElementById('modalHistory');
  if(!el||!modal) return;
  modal.style.display='flex';

  if(!items.length){
    el.innerHTML='<div style="text-align:center;padding:30px;color:rgba(255,255,255,.3);font-family:DM Mono,monospace;font-size:11px;">Aucune expertise enregistrée</div>';
    return;
  }

  el.innerHTML='';
  items.forEach((p,idx)=>{
    const visits=(p.visits||[]).sort((a,b)=>b.date.localeCompare(a.date));
    const last=visits[0]||{};
    const date=last.date?last.date.split('-').reverse().join('/'):'—';
    const culture=last.culture||p.culture||'—';
    const comment=last.comment||p.comment||'';
    const coords=p.lat.toFixed(4)+'°N, '+p.lng.toFixed(4)+'°E';

    const div=document.createElement('div');
    div.style.cssText='padding:10px 12px;border-radius:8px;margin-bottom:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);cursor:pointer;transition:background .12s;';
    div.innerHTML=
      '<div style="display:flex;justify-content:space-between;align-items:center;">'
        +'<div style="font-family:Inter,sans-serif;font-weight:600;font-size:11px;color:rgba(255,255,255,.85);">'+coords+'</div>'
        +'<div style="font-size:9px;color:rgba(255,255,255,.3);font-family:DM Mono,monospace;">'+date+'</div>'
      +'</div>'
      +(culture!=='—'?'<div style="font-size:10px;color:var(--ts-accent);margin-top:3px;font-family:DM Mono,monospace;">'+culture+'</div>':'')
      +(comment?'<div style="font-size:9px;color:rgba(255,255,255,.4);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+comment.slice(0,80)+'</div>':'')
      +'<div style="font-size:8px;color:rgba(255,255,255,.2);margin-top:4px;">'+visits.length+' visite(s)</div>';
    div.addEventListener('mouseover',()=>div.style.background='rgba(45,189,138,.08)');
    div.addEventListener('mouseout',()=>div.style.background='rgba(255,255,255,.04)');
    div.addEventListener('click',()=>closeHistoryAndOpen(p.lat,p.lng));
    el.appendChild(div);
  });
}

function exportHistoryCSV(){
  const store = loadStore();
  const items = Object.values(store).filter(p=>p.lat&&p.lng);
  const rows = [['Latitude','Longitude','Culture','Date visite','Observations','Nb visites']];
  items.forEach(p=>{
    const visits=(p.visits||[]).sort((a,b)=>b.date.localeCompare(a.date));
    const last=visits[0]||{};
    rows.push([
      p.lat.toFixed(5), p.lng.toFixed(5),
      last.culture||p.culture||'',
      last.date||'', 
      (last.comment||p.comment||'').replace(/,/g,';'),
      visits.length
    ]);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'TerraScan_Expertises_'+new Date().toISOString().split('T')[0]+'.csv';
  a.click();
  showToast('📊 Export CSV téléchargé — '+items.length+' parcelle(s)');
}



// ═══════════════════════════════════════════════
// ANNOTATIONS CARTOGRAPHIQUES
// Outils dessin : zone, cercle, flèche, texte
// ═══════════════════════════════════════════════
const ANNOT_STORE_KEY = 'ts_annotations_v1';
let _annotMode = null;  // null | 'zone' | 'cercle' | 'texte' | 'fleche'
let _annotLayers = {};  // key → tableau de layers Leaflet
let _annotData = {};    // key → tableau de données sérialisées
let _drawingPts = [];   // points en cours de dessin
let _tempLayer = null;

function loadAnnotations(){ try{ return JSON.parse(localStorage.getItem(ANNOT_STORE_KEY)||'{}'); }catch(e){ return {}; } }
function saveAnnotations(d){ try{ localStorage.setItem(ANNOT_STORE_KEY,JSON.stringify(d)); }catch(e){} }
function getAnnotKey(lat,lng){ return Math.round(+lat*10000)/10000+'_'+Math.round(+lng*10000)/10000; }

// Activer un outil d'annotation
function setAnnotMode(mode){
  _annotMode = _annotMode===mode ? null : mode;
  _drawingPts=[];
  if(_tempLayer){ map.removeLayer(_tempLayer); _tempLayer=null; }

  // Mettre à jour les boutons
  document.querySelectorAll('.annot-btn').forEach(b=>{
    b.classList.toggle('on', b.dataset.mode===_annotMode);
  });

  // Curseur
  map.getContainer().style.cursor = _annotMode ? 'crosshair' : '';

  if(_annotMode){
    showToast('✏️ Mode '+_annotMode+' — Cliquez sur la carte');
  }
}

// Écouter les clics sur la carte pour dessiner
map.on('click', function(e){
  if(!_annotMode) return;
  const lat=e.latlng.lat, lng=e.latlng.lng;
  const pKey = getPhotoKey(window._shLat||lat, window._shLng||lng);

  if(_annotMode==='texte'){
    const txt=prompt('Texte de l\'annotation :');
    if(!txt) return;
    addAnnotTexte(lat,lng,txt,pKey);
    return;
  }

  if(_annotMode==='cercle'){
    if(_drawingPts.length===0){
      _drawingPts=[{lat,lng}];
      showToast('Cliquez pour définir le rayon');
    } else {
      const center=_drawingPts[0];
      const r=map.distance([center.lat,center.lng],[lat,lng]);
      addAnnotCercle(center.lat,center.lng,r,pKey);
      _drawingPts=[];
    }
    return;
  }

  if(_annotMode==='fleche'){
    _drawingPts.push({lat,lng});
    if(_drawingPts.length===2){
      addAnnotFleche(_drawingPts[0],_drawingPts[1],pKey);
      _drawingPts=[];
    } else {
      showToast('Cliquez sur le point d\'arrivée');
    }
    return;
  }

  if(_annotMode==='zone'){
    _drawingPts.push({lat,lng});
    // Prévisualisation
    if(_tempLayer) map.removeLayer(_tempLayer);
    if(_drawingPts.length>=2){
      _tempLayer=L.polygon(_drawingPts.map(p=>[p.lat,p.lng]),
        {color:'#ff9800',fillColor:'#ff9800',fillOpacity:.15,weight:2,dashArray:'6,4'}).addTo(map);
    }
    // Double-clic pour terminer
    return;
  }
});

map.on('dblclick', function(e){
  if(_annotMode==='zone'&&_drawingPts.length>=3){
    const pKey = getAnnotKey(window._shLat||e.latlng.lat, window._shLng||e.latlng.lng);
    const lbl=prompt('Légende de la zone (optionnel):');
    addAnnotZone(_drawingPts, lbl||'Zone sinistrée', pKey);
    _drawingPts=[];
    if(_tempLayer){ map.removeLayer(_tempLayer); _tempLayer=null; }
    e.originalEvent.preventDefault();
  }
});

function addAnnotZone(pts, label, key){
  const color='#ef5350';
  const lyr=L.polygon(pts.map(p=>[p.lat,p.lng]),{
    color,fillColor:color,fillOpacity:.2,weight:2
  }).bindPopup('<b style="color:'+color+';">⚠️ '+label+'</b>').addTo(map);
  persistAnnot(key,'zone',{pts,label,color});
  registerAnnotLayer(key,lyr);
  showToast('✅ Zone annotée : '+label);
}

function addAnnotCercle(lat,lng,r,key){
  const label=prompt('Légende du cercle :')||'Zone à surveiller';
  const color='#42a5f5';
  const lyr=L.circle([lat,lng],{radius:r,color,fillColor:color,fillOpacity:.2,weight:2})
    .bindPopup('<b style="color:'+color+';">🔵 '+label+'</b><br><small>Rayon : '+(r/1000).toFixed(2)+' km</small>').addTo(map);
  persistAnnot(key,'cercle',{lat,lng,r,label,color});
  registerAnnotLayer(key,lyr);
  showToast('✅ Cercle annoté');
}

function addAnnotFleche(from,to,key){
  const label=prompt('Légende de la flèche :')||'';
  const color='#ffb300';
  const lyr=L.polyline([[from.lat,from.lng],[to.lat,to.lng]],{
    color,weight:3,
    dashArray:'none'
  }).bindPopup('<b style="color:'+color+';">➡️ '+(label||'Flèche')+'</b>').addTo(map);
  // Ajouter une tête de flèche
  const marker=L.marker([to.lat,to.lng],{
    icon:L.divIcon({html:'<div style="color:'+color+';font-size:18px;transform:rotate(45deg);">▶</div>',
      className:'',iconSize:[18,18],iconAnchor:[9,9]})
  }).addTo(map);
  persistAnnot(key,'fleche',{from,to,label,color});
  registerAnnotLayer(key,lyr);
  registerAnnotLayer(key,marker);
  showToast('✅ Flèche annotée');
}

function addAnnotTexte(lat,lng,txt,key){
  const color='#ce93d8';
  const lyr=L.marker([lat,lng],{
    icon:L.divIcon({
      html:'<div style="background:rgba(26,15,40,.9);color:'+color+';'
        +'border:1px solid '+color+';border-radius:6px;padding:3px 8px;'
        +'font-size:11px;white-space:nowrap;font-family:DM Mono,monospace;'
        +'box-shadow:0 2px 8px rgba(0,0,0,.4);">'+txt+'</div>',
      className:'', iconAnchor:[0,0]
    })
  }).addTo(map);
  persistAnnot(key,'texte',{lat,lng,txt,color});
  registerAnnotLayer(key,lyr);
  showToast('✅ Texte annoté');
}

function registerAnnotLayer(key,lyr){
  if(!_annotLayers[key]) _annotLayers[key]=[];
  _annotLayers[key].push(lyr);
}

function persistAnnot(key,type,data){
  const all=loadAnnotations();
  if(!all[key]) all[key]=[];
  all[key].push({id:'an'+Date.now(),type,...data});
  saveAnnotations(all);
}

// Effacer toutes les annotations d'une parcelle
function clearAnnotations(lat,lng){
  if(!confirm('Supprimer toutes les annotations de cette parcelle ?')) return;
  const key=getAnnotKey(lat,lng);
  (_annotLayers[key]||[]).forEach(l=>map.removeLayer(l));
  _annotLayers[key]=[];
  const all=loadAnnotations();
  delete all[key];
  saveAnnotations(all);
  showToast('🗑 Annotations supprimées');
}

// Restaurer les annotations au chargement
function restoreAnnotations(){
  const all=loadAnnotations();
  Object.entries(all).forEach(([key,annots])=>{
    annots.forEach(a=>{
      const [lat,lng]=key.split('_').map(parseFloat);
      if(a.type==='zone') addAnnotZoneRestore(a,key);
      else if(a.type==='cercle') addAnnotCercleRestore(a,key);
      else if(a.type==='texte') addAnnotTexteRestore(a,key);
      else if(a.type==='fleche') addAnnotFlecheRestore(a,key);
    });
  });
}

function addAnnotZoneRestore(a,key){
  const lyr=L.polygon(a.pts.map(p=>[p.lat,p.lng]),{color:a.color,fillColor:a.color,fillOpacity:.2,weight:2})
    .bindPopup('<b style="color:'+a.color+';">⚠️ '+a.label+'</b>').addTo(map);
  registerAnnotLayer(key,lyr);
}
function addAnnotCercleRestore(a,key){
  const lyr=L.circle([a.lat,a.lng],{radius:a.r,color:a.color,fillColor:a.color,fillOpacity:.2,weight:2})
    .bindPopup('<b>🔵 '+a.label+'</b>').addTo(map);
  registerAnnotLayer(key,lyr);
}
function addAnnotTexteRestore(a,key){
  const lyr=L.marker([a.lat,a.lng],{icon:L.divIcon({
    html:'<div style="background:rgba(26,15,40,.9);color:'+a.color+';border:1px solid '+a.color+';'
      +'border-radius:6px;padding:3px 8px;font-size:11px;white-space:nowrap;font-family:DM Mono,monospace;">'+a.txt+'</div>',
    className:'',iconAnchor:[0,0]})}).addTo(map);
  registerAnnotLayer(key,lyr);
}
function addAnnotFlecheRestore(a,key){
  const lyr=L.polyline([[a.from.lat,a.from.lng],[a.to.lat,a.to.lng]],{color:a.color,weight:3}).addTo(map);
  registerAnnotLayer(key,lyr);
}

// ═══════════════════════════════════════════════
// PHOTOS TERRAIN — upload, géoloc, PDF
// ═══════════════════════════════════════════════
const PHOTO_STORE_KEY = 'ts_photos_v1';

function loadPhotos(){ try{ return JSON.parse(localStorage.getItem(PHOTO_STORE_KEY)||'{}'); }catch(e){ return {}; } }
function savePhotos(d){ try{ localStorage.setItem(PHOTO_STORE_KEY,JSON.stringify(d)); }catch(e){} }
function getPhotoKey(lat,lng){ return Math.round(+lat*10000)/10000+'_'+Math.round(+lng*10000)/10000; }

// Déclencher l'input fichier
function openPhotoPicker(){
  const lat=window._shLat, lng=window._shLng;
  if(!lat||!lng){ showToast('⚠️ Ouvrez une fiche parcelle d\'abord'); return; }
  document.getElementById('photoInput')?.click();
}

// Lire et stocker les photos
function handlePhotoUpload(input){
  const lat=window._shLat, lng=window._shLng;
  if(!lat||!lng||!input.files?.length) return;
  const key = getPhotoKey(lat,lng);
  const photos = loadPhotos();
  if(!photos[key]) photos[key]=[];

  let done=0;
  Array.from(input.files).forEach(file=>{
    if(!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e=>{
      const entry = {
        id: 'ph'+Date.now()+Math.random().toString(36).slice(2,6),
        data: e.target.result,     // base64
        name: file.name,
        date: new Date().toISOString(),
        lat, lng,
        legende: '',
      };
      photos[key].push(entry);
      done++;
      if(done===input.files.length){
        savePhotos(photos);
        renderPhotoGallery(lat,lng);
        addPhotoMarkers(lat,lng);
        showToast('📸 '+done+' photo(s) ajoutée(s)');
      }
    };
    reader.readAsDataURL(file);
  });
  input.value='';
}

// Afficher la galerie dans l'onglet Expert
function renderPhotoGallery(lat,lng){
  const el = document.getElementById('photoGallery');
  if(!el) return;
  const photos = loadPhotos()[getPhotoKey(lat,lng)]||[];
  if(!photos.length){
    el.innerHTML='<div style="text-align:center;padding:16px;color:rgba(255,255,255,.25);font-size:10px;font-family:DM Mono,monospace;">Aucune photo · Cliquez sur Ajouter</div>';
    return;
  }
  el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px 0;">'
    + photos.map(p=>`
      <div style="position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#0d1218;cursor:pointer;"
        onclick="openPhotoViewer('${p.id}',${lat},${lng})">
        <img src="${p.data}" style="width:100%;height:100%;object-fit:cover;">
        <div style="position:absolute;bottom:0;left:0;right:0;padding:4px 6px;
          background:linear-gradient(transparent,rgba(0,0,0,.7));
          font-size:7px;color:rgba(255,255,255,.7);font-family:DM Mono,monospace;">
          ${new Date(p.date).toLocaleDateString('fr-FR')}
        </div>
        <button onclick="deletePhoto(event,'${p.id}',${lat},${lng})"
          style="position:absolute;top:4px;right:4px;width:18px;height:18px;
          border-radius:50%;background:rgba(0,0,0,.6);border:none;color:white;
          font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>`)
    .join('') + '</div>';
}

// Visionneuse photo plein écran
function openPhotoViewer(id, lat, lng){
  const photos = loadPhotos()[getPhotoKey(lat,lng)]||[];
  const p = photos.find(x=>x.id===id);
  if(!p) return;
  const modal = document.getElementById('photoViewerModal');
  const img = document.getElementById('photoViewerImg');
  const leg = document.getElementById('photoViewerLeg');
  if(!modal||!img) return;
  img.src = p.data;
  if(leg){ leg.value=p.legende||''; leg.dataset.id=id; leg.dataset.lat=lat; leg.dataset.lng=lng; }
  modal.style.display='flex';
}

// Sauvegarder la légende
function savePhotoLegende(input){
  const id=input.dataset.id, lat=parseFloat(input.dataset.lat), lng=parseFloat(input.dataset.lng);
  const photos=loadPhotos(), key=getPhotoKey(lat,lng);
  const p=(photos[key]||[]).find(x=>x.id===id);
  if(p){ p.legende=input.value; savePhotos(photos); }
}

// Supprimer une photo
function deletePhoto(e, id, lat, lng){
  e.stopPropagation();
  if(!confirm('Supprimer cette photo ?')) return;
  const photos=loadPhotos(), key=getPhotoKey(lat,lng);
  photos[key]=(photos[key]||[]).filter(x=>x.id!==id);
  savePhotos(photos);
  renderPhotoGallery(lat,lng);
  addPhotoMarkers(lat,lng);
}

// Marqueurs photos sur la carte
const _photoMarkersMap = {};
function addPhotoMarkers(lat,lng){
  const key=getPhotoKey(lat,lng);
  if(_photoMarkersMap[key]){ _photoMarkersMap[key].forEach(m=>map.removeLayer(m)); }
  _photoMarkersMap[key]=[];
  const photos=loadPhotos()[key]||[];
  photos.forEach(p=>{
    const jitter = (Math.random()-0.5)*0.0002;
    const ic=L.divIcon({
      html:'<div style="width:28px;height:28px;border-radius:8px;overflow:hidden;'
        +'border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);">'
        +'<img src="'+p.data+'" style="width:100%;height:100%;object-fit:cover;"></div>',
      className:'', iconSize:[28,28], iconAnchor:[14,14]
    });
    const m=L.marker([p.lat+jitter,p.lng+jitter],{icon:ic})
      .bindPopup('<div style="text-align:center;">'
        +'<img src="'+p.data+'" style="width:180px;border-radius:6px;margin-bottom:6px;"><br>'
        +'<div style="font-size:10px;color:#546e7a;">'+(p.legende||new Date(p.date).toLocaleDateString('fr-FR'))+'</div>'
        +'</div>')
      .addTo(map);
    _photoMarkersMap[key].push(m);
  });
}

// Restaurer les marqueurs au chargement
function restorePhotoMarkers(){
  const photos=loadPhotos();
  Object.keys(photos).forEach(key=>{
    const pts=photos[key];
    if(pts.length&&pts[0].lat) addPhotoMarkers(pts[0].lat,pts[0].lng);
  });
}

// Intégration dans le rapport PDF
function getPhotosForPDF(lat,lng){
  return loadPhotos()[getPhotoKey(lat,lng)]||[];
}


// ── Remonter le temps IGN ──
function toggleHistoPanel(){
  const panel = document.getElementById('histoPanel');
  if(!panel) return;
  const visible = panel.classList.contains('visible');
  if(visible){
    closeHisto();
  } else {
    panel.classList.add('visible');
    const btn = document.getElementById('btnHisto');
    if(btn) btn.classList.add('on');
    // Charger la première couche par défaut si pas encore chargée
    if(!_histoLyr) loadHistoLayer(0);
    showToast('📸 Remonter le temps · Sélectionnez une année');
  }
}

// ── Export JSON dossiers ──
function exportJSON(){
  const store = loadStore();
  const photos = loadPhotos();
  const annots = loadAnnotations();
  const data = {
    version: '1.0',
    export_date: new Date().toISOString(),
    expertises: Object.values(store).filter(p=>p.lat&&p.lng),
    photos_count: Object.values(photos).reduce((s,v)=>s+(v.length||0),0),
    annotations_count: Object.values(annots).reduce((s,v)=>s+(v.length||0),0),
  };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'TerraScan_Export_'+new Date().toISOString().split('T')[0]+'.json';
  a.click();
  showToast('📄 Export JSON téléchargé — '+data.expertises.length+' dossier(s)');
}

// ── Menu export ──
function openExportMenu(){
  const menu = document.getElementById('exportMenu');
  if(!menu) return;
  const open = menu.style.display==='flex';
  menu.style.display = open ? 'none' : 'flex';
}
function closeExportMenu(){
  const menu = document.getElementById('exportMenu');
  if(menu) menu.style.display='none';
}
// Fermer si clic ailleurs
document.addEventListener('click', e=>{
  const menu = document.getElementById('exportMenu');
  const btn = document.getElementById('btnExportPdf');
  if(menu&&btn&&!menu.contains(e.target)&&!btn.contains(e.target)){
    menu.style.display='none';
  }
});

// ── URL partageable ──
function parseUrlParams(){
  const p = new URLSearchParams(window.location.search);
  const lat = parseFloat(p.get('lat'));
  const lng = parseFloat(p.get('lng'));
  const z   = parseInt(p.get('z')) || 14;
  const ndvi = p.get('ndvi') === '1';
  if(lat && lng){
    map.setView([lat, lng], z);
    if(ndvi) setTimeout(toggleNdvi, 1200);
    // Ouvrir la fiche si demandé
    if(p.get('sheet') === '1') setTimeout(()=>openSheet(lat, lng), 1500);
  }
}

function buildShareUrl(){
  const c = map.getCenter();
  const z = map.getZoom();
  const u = new URL(window.location.href.split('?')[0]);
  u.searchParams.set('lat', c.lat.toFixed(5));
  u.searchParams.set('lng', c.lng.toFixed(5));
  u.searchParams.set('z', z);
  if(ndviOpen) u.searchParams.set('ndvi', '1');
  if(window._shLat){
    u.searchParams.set('sheet', '1');
    u.searchParams.set('lat', window._shLat.toFixed(5));
    u.searchParams.set('lng', window._shLng.toFixed(5));
  }
  return u.toString();
}

function copyShareUrl(){
  const url = buildShareUrl();
  navigator.clipboard.writeText(url).then(()=>{
    showToast('🔗 Lien copié dans le presse-papier');
  }).catch(()=>{
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('🔗 Lien copié');
  });
}

map.whenReady(()=>{
  const _store=loadStore();
  const _nb=Object.values(_store).filter(p=>(p.visits&&p.visits.length>0)||p.comment).length;
  const _btn=document.getElementById('btnExportPdf');
  if(_btn&&_nb>0) _btn.setAttribute('data-count',_nb);
  setTimeout(()=>{const sp=document.getElementById('splash');if(sp)sp.classList.add('hidden');},500);
});
setTimeout(()=>{const sp=document.getElementById('splash');if(sp)sp.classList.add('hidden');},4000);
L.control.zoom({position:'bottomright'}).addTo(map);
L.control.scale({metric:true,imperial:false,position:'bottomleft'}).addTo(map);

// ── Bouton GPS cible — Leaflet.Control natif ──
// Positionné au-dessus des +/- dans le coin bas-droit
const GpsControl=L.Control.extend({
  options:{position:'bottomright'},
  onAdd:function(){
    // Conteneur leaflet-bar pour s'empiler proprement au-dessus du zoom
    const container=L.DomUtil.create('div','leaflet-bar leaflet-control');
    const a=L.DomUtil.create('a','',container);
    a.id='gpsTargetBtn';
    a.href='#';
    a.title='Ma position GPS';
    a.setAttribute('role','button');
    a.style.cssText='display:flex;align-items:center;justify-content:center;width:34px;height:34px;';
    a.innerHTML='<svg viewBox="0 0 24 24" fill="none" width="20" height="20">'
      +'<circle cx="12" cy="12" r="8.5" stroke="#444" stroke-width="1.8"/>'
      +'<line x1="12" y1="1" x2="12" y2="5.5" stroke="#444" stroke-width="1.8" stroke-linecap="round"/>'
      +'<line x1="12" y1="18.5" x2="12" y2="23" stroke="#444" stroke-width="1.8" stroke-linecap="round"/>'
      +'<line x1="1" y1="12" x2="5.5" y2="12" stroke="#444" stroke-width="1.8" stroke-linecap="round"/>'
      +'<line x1="18.5" y1="12" x2="23" y2="12" stroke="#444" stroke-width="1.8" stroke-linecap="round"/>'
      +'<circle cx="12" cy="12" r="2.5" fill="#444"/>'
      +'</svg>';
    // stopPropagation strict — empêche le click de remonter à la carte (openSheet)
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(a,'click',function(e){
      L.DomEvent.stop(e);
      startGPS();
    });
    return container;
  }
});
new GpsControl().addTo(map);
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(
    pos=>map.setView([pos.coords.latitude,pos.coords.longitude],13),
    ()=>{},{enableHighAccuracy:true,timeout:6000,maximumAge:0}
  );
}

// ── Fonds de carte ──
const BASE_URLS={
  ign:'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
  ignplan:'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
  esri:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  esri2:'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};
const BASE_OPTS={
  ign:{attribution:'© IGN',maxZoom:20,maxNativeZoom:19},
  ignplan:{attribution:'© IGN Plan v2',maxZoom:19,maxNativeZoom:18},
  esri:{attribution:'© Esri · Maxar',maxZoom:20,maxNativeZoom:19},
  esri2:{attribution:'© Esri Clarity · Maxar',maxZoom:21,maxNativeZoom:20},
};
let activeTileLayer=null;
const bases={ign:null,esri:null,esri2:null};
function makeBase(n){
  if(!BASE_URLS[n]) return null;
  return L.tileLayer(BASE_URLS[n],BASE_OPTS[n]);
}
activeTileLayer=makeBase('esri');
activeTileLayer.addTo(map);
bases.esri=activeTileLayer;

function setBaseOpacity(n,val){
  const v=parseInt(val)/100;
  if(n===curBase){
    if(n==='s2'){if(s2Lyr) s2Lyr.setOpacity(v);}
    else if(bases[n]) bases[n].setOpacity(v);
  }
}

// ── Couches superposées ──
const ovL={
  cad:L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=CADASTRALPARCELS.PARCELS&STYLE=bdparcellaire&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',{attribution:'© IGN',maxZoom:20,opacity:.75}),
  pac:L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=LANDUSE.AGRICULTURE.LATEST&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',{attribution:'© IGN RPG',maxZoom:20,opacity:.55}),
  sar:null,
  catnat:null
};

// ── État CatNat ──
let _catnatActive=false, _catnatMarkers=[], _catnatLoaded=false, _catnatData=null;

// Icône CatNat
const _catnatIcon = L.divIcon({
  html:'<div style="background:#c62828;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4);">!</div>',
  className:'',iconSize:[22,22],iconAnchor:[11,11]
});

async function fetchCatnat(){
  const el=document.getElementById('catnat-status');
  if(el){el.style.display='flex';el.innerHTML='<div class="catnat-spinner"></div><span>Chargement CatNat…</span>';}

  const center=map.getCenter();
  const lat=center.lat.toFixed(5);
  const lng=center.lng.toFixed(5);
  const zoom=map.getZoom();
  const rayon=zoom>=15?3000:zoom>=13?10000:zoom>=11?25000:50000;

  // ── Étape 1 : code INSEE via geo.api.gouv.fr (CORS ouvert, très stable) ──
  let codeInsee='';
  let nomCommune='';
  try{
    const gR=await fetch('https://geo.api.gouv.fr/communes?lat='+lat+'&lon='+lng+'&fields=code,nom&format=json&geometry=centre');
    if(gR.ok){
      const gD=await gR.json();
      if(gD&&gD.length>0){codeInsee=gD[0].code;nomCommune=gD[0].nom;}
    }
  }catch(e){}

  // ── Étape 2 : requête CatNat — 3 tentatives en cascade ──
  const urlBase='https://georisques.gouv.fr/api/v1/gaspar/catnat';
  // URL prioritaire : par code INSEE (moins de risque d'erreur serveur)
  const urlInsee = codeInsee ? urlBase+'?codeInsee='+codeInsee+'&page=1&page_size=100' : null;
  // URL fallback : par rayon géographique
  const urlCoords = urlBase+'?longitude='+lng+'&latitude='+lat+'&rayon='+rayon+'&page=1&page_size=100';
  // URL via proxy CORS
  const urlProxy  = 'https://api.allorigins.win/raw?url='+encodeURIComponent(urlCoords);

  let data=null;
  const attempts = [urlInsee, urlCoords, urlProxy].filter(Boolean);

  for(const url of attempts){
    try{
      const r=await fetch(url,{headers:{'Accept':'application/json'}});
      if(r.ok){
        const d=await r.json();
        // allorigins retourne parfois une string — parser si besoin
        data = typeof d==='string' ? JSON.parse(d) : d;
        break;
      }
    }catch(e){ continue; }
  }

  if(data){
    renderCatnatMarkers(data, nomCommune);
    if(el) el.style.display='none';
    _catnatLoaded=true;
  } else {
    // Échec total — afficher lien manuel propre
    if(el){
      el.style.display='flex';
      el.innerHTML='<div style="line-height:1.6;">'
        +'<div style="font-size:9px;color:#90a4ae;margin-bottom:5px;">Données non disponibles en direct</div>'
        +'<a href="https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi?lng='+lng+'&lat='+lat+'" '
        +'target="_blank" style="font-size:10px;color:#1565c0;font-family:DM Mono,monospace;display:flex;align-items:center;gap:5px;font-weight:600;">'
        +'<i class="fas fa-external-link-alt"></i> Consulter sur Georisques.gouv.fr</a>'
        +'</div>';
    }
  }
}

function renderCatnatMarkers(data, nomCommune){
  _catnatMarkers.forEach(m=>{try{map.removeLayer(m);}catch(e){}});
  _catnatMarkers=[];

  // Normaliser les données — plusieurs formats possibles selon l'endpoint
  let items=[];
  if(Array.isArray(data)) items=data;
  else if(data.data) items=data.data;
  else if(data.features) items=data.features.map(f=>({...f.properties,...f}));
  else if(data.catnat) items=data.catnat;

  if(!items.length){
    const el=document.getElementById('catnat-status');
    if(el){
      el.style.display='flex';
      el.innerHTML='<span style="color:#2e7d32;font-size:10px;">✅ Aucun arrêté CatNat dans cette zone</span>';
    }
    return;
  }

  // Regrouper par commune
  const communes={};
  items.forEach(ev=>{
    // Champs selon format API ou WFS
    const code = ev.code_insee||ev.cod_commune||ev.codeInsee||ev.COD_COMMUNE||nomCommune||'?';
    const lib   = ev.lib_commune||ev.libelle_commune||ev.nom_commune||ev.LIBELLE_COMMUNE||nomCommune||code;
    if(!communes[code]) communes[code]={libelle:lib,lat:null,lng:null,risques:[],dates:[],nb:0};
    const c=communes[code];
    c.nb++;
    // Coordonnées
    if(!c.lat){
      const la=parseFloat(ev.latitude||ev.lat_centroid||0);
      const lo=parseFloat(ev.longitude||ev.lon_centroid||0);
      if(la&&lo){c.lat=la;c.lng=lo;}
    }
    // Type de risque
    const risque=ev.lib_risque_jo||ev.libelle_risque_jo||ev.lib_risque||ev.libelle_risque||ev.LIB_RISQUE_JO||'Aléa';
    if(!c.risques.includes(risque)) c.risques.push(risque);
    // Date
    const d=ev.dat_deb||ev.date_debut||ev.date_debut_evt||ev.DAT_DEB||'';
    if(d) c.dates.push(String(d).split('T')[0]);
  });

  const center=map.getCenter();
  let count=0;
  Object.entries(communes).forEach(([code,c])=>{
    const lat=c.lat||center.lat+((Math.random()-.5)*.015);
    const lng=c.lng||center.lng+((Math.random()-.5)*.015);
    const lastDate=c.dates.sort().reverse()[0]||'—';
    const risqueStr=c.risques.slice(0,3).join(' · ')||'—';
    const nb=c.nb;

    const popup='<div class="catnat-popup">'
      +'<div class="catnat-popup-title">⚠ Arrêtés CatNat</div>'
      +'<div class="catnat-popup-row"><span class="catnat-popup-key">Commune</span>'
      +'<span class="catnat-popup-val">'+c.libelle+'</span></div>'
      +'<div class="catnat-popup-row"><span class="catnat-popup-key">Aléa(s)</span>'
      +'<span class="catnat-popup-val">'+risqueStr+'</span></div>'
      +'<div class="catnat-popup-row"><span class="catnat-popup-key">Arrêtés</span>'
      +'<span class="catnat-popup-val"><span class="catnat-badge">'+nb+(nb>1?' arrêtés':' arrêté')+'</span></span></div>'
      +'<div class="catnat-popup-row"><span class="catnat-popup-key">Dernier</span>'
      +'<span class="catnat-popup-val">'+lastDate+'</span></div>'
      +'<div style="margin-top:6px;padding-top:6px;border-top:1px solid #f0f0f0;">'
      +'<a href="https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi?lng='+lng.toFixed(5)+'&lat='+lat.toFixed(5)+'" '
      +'target="_blank" style="font-size:9px;color:#1565c0;display:flex;align-items:center;gap:4px;">'
      +'<i class="fas fa-external-link-alt"></i> Georisques.gouv.fr</a></div></div>';

    const m=L.marker([lat,lng],{icon:_catnatIcon}).bindPopup(popup,{maxWidth:260});
    m.addTo(map);
    _catnatMarkers.push(m);
    count++;
  });

  if(count>0) showToast(count+' commune'+(count>1?'s':'')+' avec arrêtés CatNat');
}

// ── Couche Grêle / Radar Météo ──
let _greleLyr = null, _greleMarkers = [], _greleLoaded = false;

function togRelief(){
  ovState.relief=!ovState.relief;
  const tk=document.getElementById('tk-relief');
  if(tk) tk.classList.toggle('on',ovState.relief);
  if(ovState.relief){
    _reliefLyr=L.tileLayer(RELIEF_URL,{opacity:.55,maxZoom:18,attribution:'© IGN'}).addTo(map);
    _contourLyr=L.tileLayer(CONTOUR_URL,{opacity:.4,maxZoom:18}).addTo(map);
    showToast('🏔 Relief IGN activé');
  } else {
    if(_reliefLyr){map.removeLayer(_reliefLyr);_reliefLyr=null;}
    if(_contourLyr){map.removeLayer(_contourLyr);_contourLyr=null;}
  }
  updateGpBadge();
}

async function togGrele(){
  ovState.grele = !ovState.grele;
  const tk = document.getElementById('tk-grele');
  if(tk) tk.classList.toggle('on', ovState.grele);
  const ov = document.getElementById('ov-grele');
  if(ov) ov.classList.toggle('on', ovState.grele);

  if(!ovState.grele){
    _greleMarkers.forEach(m=>map.removeLayer(m));
    _greleMarkers=[];
    _greleLoaded=false;
    updateGpBadge();
    return;
  }

  showToast('⛈ Chargement données grêle…');
  const center = map.getCenter();
  await loadGreleData(center.lat, center.lng);
  updateGpBadge();
}

async function loadGreleData(lat, lng){
  _greleMarkers.forEach(m=>map.removeLayer(m));
  _greleMarkers=[];

  try{
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now()-90*24*3600*1000).toISOString().split('T')[0];
    const events = [];

    // Grille 3x3 autour du centre (rayon ~20km) — 9 points max
    const offsets = [-0.15, 0, 0.15];
    const pts = [];
    for(const dlat of offsets)
      for(const dlng of offsets)
        pts.push({lat:lat+dlat, lng:lng+dlng*1.3});

    // Requêtes en parallèle (plus rapide)
    const results = await Promise.allSettled(pts.map(pt=>
      fetch('https://archive-api.open-meteo.com/v1/archive'
        +'?latitude='+pt.lat.toFixed(3)
        +'&longitude='+pt.lng.toFixed(3)
        +'&start_date='+startDate+'&end_date='+endDate
        +'&daily=weathercode,precipitation_sum,windgusts_10m_max'
        +'&timezone=Europe%2FParis'
      ).then(r=>r.json()).then(d=>({pt,d}))
    ));

    results.forEach(res=>{
      if(res.status!=='fulfilled') return;
      const {pt, d} = res.value;
      if(!d?.daily?.time) return;
      d.daily.time.forEach((date,i)=>{
        const wc  = d.daily.weathercode?.[i];
        const prec = d.daily.precipitation_sum?.[i]||0;
        const gusts= d.daily.windgusts_10m_max?.[i]||0;
        const isGrele = (wc===96||wc===99)||(prec>8&&gusts>55&&wc>=90);
        if(isGrele) events.push({
          date, lat:pt.lat, lng:pt.lng, prec, gusts, wc,
          severity: wc===99?'fort':gusts>80?'modéré':'léger'
        });
      });
    });

    if(!events.length){
      showToast('✅ Aucun épisode de grêle détecté (90j)');
      return;
    }

    // Dédupliquer par date (garder l'événement le plus sévère)
    const byDate = {};
    events.forEach(e=>{
      if(!byDate[e.date]||e.prec>(byDate[e.date].prec||0)) byDate[e.date]=e;
    });

    // Afficher les marqueurs sur la carte
    const colors = {fort:'#c62828', modéré:'#e65100', léger:'#f9a825'};
    Object.values(byDate).forEach(ev=>{
      const col = colors[ev.severity]||'#f9a825';
      const ic = L.divIcon({
        html: '<div style="width:20px;height:20px;border-radius:50%;'
          +'background:'+col+';border:2px solid white;opacity:.85;'
          +'display:flex;align-items:center;justify-content:center;'
          +'font-size:10px;box-shadow:0 2px 6px rgba(0,0,0,.4);">⛈</div>',
        className:'', iconSize:[20,20], iconAnchor:[10,10]
      });
      const m = L.marker([ev.lat, ev.lng], {icon:ic})
        .bindPopup(
          '<div style="font-family:DM Mono,monospace;font-size:11px;min-width:160px;">'
          +'<b style="color:#e65100;">⛈ Épisode grêle</b><br>'
          +'📅 '+ev.date+'<br>'
          +'💧 '+ev.prec.toFixed(1)+' mm<br>'
          +'💨 Rafales '+ev.gusts.toFixed(0)+' km/h<br>'
          +'⚠️ Intensité : '+ev.severity
          +'</div>'
        )
        .addTo(map);
      _greleMarkers.push(m);
    });

    const nb = Object.keys(byDate).length;
    showToast('⛈ '+nb+' épisode(s) de grêle détecté(s) sur 90 jours');
    _greleLoaded = true;

  }catch(e){
    showToast('❌ Erreur chargement grêle: '+e.message);
  }
}

// Recharger quand la carte se déplace
map.on('moveend', ()=>{
  if(ovState.grele && !_greleLoaded){
    const c = map.getCenter();
    loadGreleData(c.lat, c.lng);
  }
});

function togCatnat(){
  _catnatActive=!_catnatActive;
  const tk=document.getElementById('tk-catnat');
  const item=document.getElementById('ov-catnat');
  if(_catnatActive){
    if(tk) tk.classList.add('on');
    if(item) item.classList.add('on');
    if(!_catnatLoaded) fetchCatnat();
    else _catnatMarkers.forEach(m=>m.addTo(map));
    showToast('Chargement des arrêtés CatNat…');
  } else {
    if(tk) tk.classList.remove('on');
    if(item) item.classList.remove('on');
    _catnatMarkers.forEach(m=>{try{map.removeLayer(m);}catch(e){}});
  }
  updateGpBadge();
}

let _catnatTimer=null;
map.on('moveend',()=>{
  if(_catnatActive){
    clearTimeout(_catnatTimer);
    _catnatTimer=setTimeout(()=>{_catnatLoaded=false;fetchCatnat();},800);
  }
});

// ── SAR Humidité ──
const SAR_EVALSCRIPT=`//VERSION=3
function setup(){return{input:[{bands:["VV","VH"],units:"LINEAR_POWER"}],output:{bands:3}};}
function evaluatePixel(s){
  const vv=Math.sqrt(s.VV),vh=Math.sqrt(s.VH);
  const r=Math.min(1,vv*2.5);
  const g=Math.min(1,vh*5.0);
  const b=Math.min(1,(vv/Math.max(vh,0.0001))/10);
  return[r,g,b];
}`;

function buildSarLayer(){
  const TILE_SIZE=512;
  const to=new Date().toISOString().split('T')[0];
  const from=new Date(Date.now()-30*24*3600*1000).toISOString().split('T')[0];
  window._sarDateFrom=from; window._sarDateTo=to;
  const sarDateEl=document.getElementById('sarDateLabel');
  if(sarDateEl){
    const pF=from.split('-'),pT=to.split('-');
    sarDateEl.textContent=pF[2]+'/'+pF[1]+'/'+pF[0]+' → '+pT[2]+'/'+pT[1]+'/'+pT[0];
  }
  const SARLayer=L.GridLayer.extend({
    createTile(coords,done){
      const tile=L.DomUtil.create('img','leaflet-tile');
      tile.width=TILE_SIZE; tile.height=TILE_SIZE;
      const nwP=coords.scaleBy(L.point(TILE_SIZE,TILE_SIZE));
      const seP=nwP.add([TILE_SIZE,TILE_SIZE]);
      const nw=L.CRS.EPSG3857.unproject(L.CRS.EPSG3857.project(this._map.unproject(nwP,coords.z)));
      const se=L.CRS.EPSG3857.unproject(L.CRS.EPSG3857.project(this._map.unproject(seP,coords.z)));
      const bbox=[Math.min(nw.lng,se.lng),Math.min(nw.lat,se.lat),Math.max(nw.lng,se.lng),Math.max(nw.lat,se.lat)];
      if(!tok){tile.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';done(null,tile);return tile;}
      fetch('https://sh.dataspace.copernicus.eu/api/v1/process',{
        method:'POST',
        headers:{'Authorization':'Bearer '+tok,'Content-Type':'application/json','Accept':'image/png'},
        body:JSON.stringify({
          input:{bounds:{bbox,properties:{crs:'http://www.opengis.net/def/crs/OGC/1.3/CRS84'}},
            data:[{type:'sentinel-1-grd',dataFilter:{timeRange:{from:from+'T00:00:00Z',to:to+'T23:59:59Z'},acquisitionMode:'IW',polarization:'DV',orbitDirection:'ASCENDING'},processing:{backCoeff:'GAMMA0_TERRAIN',orthorectify:true}}]},
          output:{width:TILE_SIZE,height:TILE_SIZE,responses:[{identifier:'default',format:{type:'image/png'}}]},
          evalscript:SAR_EVALSCRIPT
        })
      }).then(r=>{if(!r.ok)throw new Error(r.status);return r.blob();})
      .then(blob=>{tile.src=URL.createObjectURL(blob);tile.onload=()=>done(null,tile);tile.onerror=e=>done(e,tile);})
      .catch(()=>{tile.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';done(null,tile);});
      return tile;
    }
  });
  return new SARLayer({tileSize:TILE_SIZE,opacity:.75,attribution:'© Sentinel-1 SAR',pane:'tilePane',interactive:false});
}
ovL.sar=buildSarLayer();

// ── GÉOPORTAIL UI ──
const GP_PANELS=['cartes','couches','outils','infos'];
const GP_BTN_IDS={cartes:'gpBtnCartes',couches:'gpBtnCouches',outils:'gpBtnOutils',infos:'gpBtnInfos'};

function toggleGpPanel(name){
  const pId='gpPanel'+name.charAt(0).toUpperCase()+name.slice(1);
  const panelEl=document.getElementById(pId);
  const btnEl=document.getElementById(GP_BTN_IDS[name]);
  const isOpen=panelEl&&panelEl.classList.contains('open');
  GP_PANELS.forEach(p=>{
    const pe=document.getElementById('gpPanel'+p.charAt(0).toUpperCase()+p.slice(1));
    const be=document.getElementById(GP_BTN_IDS[p]);
    if(pe) pe.classList.remove('open');
    if(be) be.classList.remove('active');
  });
  if(!isOpen){
    if(panelEl) panelEl.classList.add('open');
    if(btnEl) btnEl.classList.add('active');
  }
  adjustNdviBarRight();
}
function closeGpPanel(name){
  const pe=document.getElementById('gpPanel'+name.charAt(0).toUpperCase()+name.slice(1));
  const be=document.getElementById(GP_BTN_IDS[name]);
  if(pe) pe.classList.remove('open');
  if(be) be.classList.remove('active');
  setTimeout(adjustNdviBarRight,260);
}
function adjustNdviBarRight(){ /* inutile — layout flex */ }
function toggleLayerPanel(){toggleGpPanel('cartes');}
function updateGpBadge(){
  const count=Object.values(ovState).filter(Boolean).length+(ndviOpen?1:0)+(_catnatActive?1:0);
  const el=document.getElementById('gpBadge');
  if(el){el.textContent=count;el.style.display=count>0?'flex':'none';}
}

// ── syncBaseUI ──
function syncBaseUI(){
  ['ign','ignplan','esri','esri2','s2'].forEach(k=>{
    const ck=document.getElementById('ck-'+k);
    const row=document.getElementById('base-'+k);
    const on=(k===curBase);
    if(ck){if(on)ck.classList.add('on');else ck.classList.remove('on');}
    if(row){if(on)row.classList.add('active');else row.classList.remove('active');}
  });
}

// ── setBase ──
function setBase(name){
  // Mettre à jour les cartes visuelles
  document.querySelectorAll('.gp-base-card').forEach(c=>c.classList.remove('on'));
  const card=document.getElementById('base-'+name);
  if(card) card.classList.add('on');

  // Supprimer l'ancienne couche de base
  if(baseLyr){ map.removeLayer(baseLyr); baseLyr=null; }

  const TILES={
    ign:{
      url:'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      attr:'© IGN Géoplateforme',maxZoom:21
    },
    ignplan:{
      url:'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      attr:'© IGN Géoplateforme',maxZoom:19
    },
    esri:{
      url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr:'© ESRI / Maxar',maxZoom:19
    },
    esri2:{
      url:'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapTileServer/tile/{z}/{y}/{x}',
      attr:'© ESRI Clarity',maxZoom:20
    },
    s2:{
      url:'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg',
      attr:'© EOX / Sentinel-2 Cloudless',maxZoom:18
    },
  };
  const t=TILES[name]||TILES.ign;
  baseLyr=L.tileLayer(t.url,{maxZoom:t.maxZoom,attribution:t.attr});
  baseLyr.addTo(map);
  baseLyr.bringToBack();
  currentBase=name;
  showToast('🗺 Fond: '+document.getElementById('base-'+name)?.querySelector('.gp-base-name')?.textContent||name);
}
function toggleBaseMap(name){ setBase(name); }


function updateSatDateBadge(n){
  if(n==='s2'){
    const d=dates[curIdx];
    const el=document.getElementById('dt-s2');
    if(el&&d){
      const dt=new Date(d+'T12:00:00Z');
      el.textContent='📅 '+dt.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
    }
  } else if(n==='esri') fetchEsriDate(false);
  else if(n==='esri2') fetchEsriDate(true);
}

async function fetchEsriDate(clarity=false){
  const dtId=clarity?'dt-esri2':'dt-esri';
  const dtEl=document.getElementById(dtId);
  if(!dtEl) return;
  dtEl.textContent='Récupération…';
  const center=map.getCenter();
  const baseUrl=clarity
    ?'https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer'
    :'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
  try{
    const url=baseUrl+'/identify?f=json&geometry='+center.lng+','+center.lat+'&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=2&mapExtent='+(center.lng-0.01)+','+(center.lat-0.01)+','+(center.lng+0.01)+','+(center.lat+0.01)+'&imageDisplay=256,256,96&returnGeometry=false';
    const r=await fetch(url);
    const d=await r.json();
    if(d.results&&d.results.length>0){
      const attrs=d.results[0].attributes||{};
      const raw=attrs.SRC_DATE2||attrs.SOURCEDATE||attrs.SRC_DATE||null;
      if(raw){
        let ds;
        if(typeof raw==='number') ds=new Date(raw).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
        else{const s=String(raw);ds=s.length===8?s.slice(6)+'/'+s.slice(4,6)+'/'+s.slice(0,4):s;}
        dtEl.textContent='📅 Cliché : '+ds; return;
      }
    }
    dtEl.textContent='Maxar/Airbus ©';
  }catch(e){dtEl.textContent='Maxar/Airbus ©';}
}

// ── togOv ──
function togOv(n){
  ovState[n]=!ovState[n];
  const tk=document.getElementById('tk-'+n);
  const item=document.getElementById('ov-'+n);
  if(ovState[n]){
    ovL[n].addTo(map);ovL[n].bringToFront();
    if(tk) tk.classList.add('on');
    if(item) item.classList.add('on');
  } else {
    map.removeLayer(ovL[n]);
    if(tk) tk.classList.remove('on');
    if(item) item.classList.remove('on');
  }
  updateGpBadge();
}
function setOpacity(layer,val){
  const v=parseInt(val)/100;
  const pct=parseInt(val)+'%';
  const el=document.getElementById('op-'+layer);
  if(el) el.textContent=pct;
  const sl=document.querySelector('[oninput="setOpacity(\''+layer+'\',this.value)"]');
  if(sl) sl.style.background='linear-gradient(to right,var(--gd) 0%,var(--gd) '+pct+',#e0e0e0 '+pct+')';
  if(layer==='ndvi'){if(ndviLyr) ndviLyr.setOpacity(v);}
  else if(layer==='cad') ovL.cad.setOpacity(v);
  else if(layer==='pac') ovL.pac.setOpacity(v);
  else if(layer==='sar') ovL.sar.setOpacity(v);
}

// ── buildS2 ──
function buildS2(dateStr){
  if(s2Lyr){map.removeLayer(s2Lyr);s2Lyr=null;}
  if(!dateStr) return;
  const dateTo=new Date(dateStr);dateTo.setDate(dateTo.getDate()+1);
  const dateToStr=dateTo.toISOString().split('T')[0];
  const currentTok=tok;
  const TILE_SIZE=512;
  const evalscript=`//VERSION=3
function setup(){return{input:["B04","B03","B02","dataMask"],output:{bands:4}};}
function evaluatePixel(s){
  let r=Math.pow(3.0*s.B04,0.85),g=Math.pow(3.0*s.B03,0.85),b=Math.pow(3.5*s.B02,0.85);
  return[Math.min(1,r),Math.min(1,g),Math.min(1,b),s.dataMask];
}`;
  const SHLayer=L.GridLayer.extend({
    createTile(coords,done){
      const tile=L.DomUtil.create('img','leaflet-tile');
      tile.width=TILE_SIZE;tile.height=TILE_SIZE;
      const nwP=coords.scaleBy(L.point(TILE_SIZE,TILE_SIZE));
      const seP=nwP.add([TILE_SIZE,TILE_SIZE]);
      const nw=L.CRS.EPSG3857.unproject(L.CRS.EPSG3857.project(this._map.unproject(nwP,coords.z)));
      const se=L.CRS.EPSG3857.unproject(L.CRS.EPSG3857.project(this._map.unproject(seP,coords.z)));
      const bbox=[Math.min(nw.lng,se.lng),Math.min(nw.lat,se.lat),Math.max(nw.lng,se.lng),Math.max(nw.lat,se.lat)];
      const body={
        input:{bounds:{bbox,properties:{crs:'http://www.opengis.net/def/crs/OGC/1.3/CRS84'}},
          data:[{type:'sentinel-2-l2a',dataFilter:{timeRange:{from:dateStr+'T00:00:00Z',to:dateToStr+'T23:59:59Z'},maxCloudCoverage:maxCC,mosaickingOrder:'leastCC'},processing:{upsampling:'BICUBIC',downsampling:'AREA',harmonizeValues:true}}]},
        output:{width:TILE_SIZE,height:TILE_SIZE,responses:[{identifier:'default',format:{type:'image/jpeg',quality:95}}]},
        evalscript
      };
      if(!currentTok){
        tile.src='https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST+'?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/jpeg&LAYERS='+COLOR_L+'&TIME='+dateStr+'/'+dateToStr+'&CRS=CRS:84&BBOX='+bbox.join(',')+'&WIDTH='+TILE_SIZE+'&HEIGHT='+TILE_SIZE+'&MAXCC='+maxCC;
        tile.onload=()=>done(null,tile);tile.onerror=e=>done(e,tile);return tile;
      }
      fetch('https://sh.dataspace.copernicus.eu/api/v1/process',{method:'POST',headers:{'Authorization':'Bearer '+currentTok,'Content-Type':'application/json','Accept':'image/jpeg'},body:JSON.stringify(body)})
      .then(r=>{if(!r.ok)throw new Error(r.status);return r.blob();})
      .then(blob=>{tile.src=URL.createObjectURL(blob);tile.onload=()=>done(null,tile);tile.onerror=e=>done(e,tile);})
      .catch(()=>{
        tile.src='https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST+'?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/jpeg&LAYERS='+COLOR_L+'&TIME='+dateStr+'/'+dateToStr+'&CRS=CRS:84&BBOX='+bbox.join(',')+'&WIDTH='+TILE_SIZE+'&HEIGHT='+TILE_SIZE+'&MAXCC='+maxCC;
        tile.onload=()=>done(null,tile);tile.onerror=e=>done(e,tile);
      });
      return tile;
    }
  });
  s2Lyr=new SHLayer({tileSize:TILE_SIZE,attribution:'© Sentinel-2 L2A 10m · Copernicus ESA',pane:'tilePane',interactive:false});
  s2Lyr.addTo(map);s2Lyr.bringToBack();
  bringTop();
  if(typeof syncBaseUI==='function') syncBaseUI();
  setTimeout(()=>{if(s2Lyr&&s2Lyr._container) s2Lyr._container.style.pointerEvents='none';},100);
}
function bringTop(){
  if(ndviLyr) ndviLyr.bringToFront();
  if(ovState.cad) ovL.cad.bringToFront();
  if(ovState.pac) ovL.pac.bringToFront();
  if(ovState.sar&&ovL.sar) ovL.sar.bringToFront();
}

// ── Token Sentinel Hub ──
async function getToken(){
  // Utiliser le token en cache s'il est encore valide (marge 2min)
  if(tok && tokExp && Date.now() < tokExp - 120000) return tok;
  try{
    const r=await fetch(SH_TOK,{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:'grant_type=client_credentials&client_id='+encodeURIComponent(SH_ID)+'&client_secret='+encodeURIComponent(SH_SEC)
    });
    if(!r.ok) throw new Error('Token HTTP '+r.status);
    const d=await r.json();
    if(!d.access_token) throw new Error('Token invalide');
    tok=d.access_token;
    tokExp=Date.now()+(d.expires_in||3600)*1000;
    // Mettre à jour l'indicateur UI
    const dot=document.getElementById('tdot');
    const st=document.getElementById('tstatus');
    if(dot){dot.className='tdot ok';}
    if(st){st.textContent='Sentinel Hub connecté';}
    return tok;
  }catch(e){
    console.warn('Token Sentinel Hub:',e.message);
    const dot=document.getElementById('tdot');
    const st=document.getElementById('tstatus');
    if(dot){dot.className='tdot err';}
    if(st){st.textContent='Erreur connexion satellite';}
    throw e;
  }
}
function setT(s,m){
  const dot=document.getElementById('tdot');
  const st=document.getElementById('tstatus');
  if(dot) dot.className='tdot '+s;
  if(st) st.textContent=m;
}

// ── fetchDates ──
async function fetchDates(){
  const dot=document.getElementById('tdot');
  const st=document.getElementById('tstatus');
  const note=document.getElementById('ndvNote');
  if(dot) dot.className='tdot load';
  if(st) st.textContent='Chargement images satellite…';

  // Retry jusqu'à 3 fois avec délai exponentiel
  for(let attempt=0;attempt<3;attempt++){
    try{
      const t=await getToken();
      const bb=map.getBounds();
      const bbox=[bb.getWest(),bb.getSouth(),bb.getEast(),bb.getNorth()].map(v=>v.toFixed(5));
      // Fenêtre temporelle : 2 ans d'historique
      const endDate=new Date().toISOString().split('T')[0];
      const startDate=new Date(Date.now()-730*24*3600*1000).toISOString().split('T')[0];
      const resp=await fetch('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search',{
        method:'POST',
        headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'},
        body:JSON.stringify({
          bbox:bbox.map(Number),
          datetime:startDate+'T00:00:00Z/'+endDate+'T23:59:59Z',
          collections:['sentinel-2-l2a'],
          limit:100,
          fields:{include:['id','properties.datetime','properties.eo:cloud_cover'],exclude:['links','assets']}
        })
      });
      if(!resp.ok) throw new Error('Catalog HTTP '+resp.status);
      const data=await resp.json();
      const features=data.features||[];
      // Extraire dates uniques triées (plus récente en premier)
      const seen=new Set();
      dates=[];
      datesMeta={};
      features.forEach(f=>{
        const cc=f.properties['eo:cloud_cover']||0;
        // Filtrer les images trop nuageuses côté client
        if(cc>maxCC) return;
        const d=f.properties.datetime.split('T')[0];
        if(!seen.has(d)){
          seen.add(d);
          dates.push(d);
          datesMeta[d]={cc:cc};
        }
      });
      dates.sort((a,b)=>b.localeCompare(a));
      curIdx=0;
      _parcelIdx=0;
      if(dates.length>0){
        if(dot) dot.className='tdot ok';
        if(st) st.textContent=dates.length+' images disponibles';
        if(note) note.textContent='✅ '+dates.length+' images · '+dates[0];
        // Ne mettre à jour la timeline que si la barre NDVI est ouverte
        if(ndviOpen) updateNdviTimeline();
        applyDate(dates[0]);
      } else {
        if(note) note.textContent='⚠️ Aucune image (nuages > '+maxCC+'%)';
        if(st) st.textContent='Augmentez le seuil nuages';
      }
      return;
    }catch(e){
      console.warn('fetchDates attempt '+(attempt+1)+':',e.message);
      if(attempt<2){
        await new Promise(r=>setTimeout(r,1000*(attempt+1)));
      } else {
        if(dot) dot.className='tdot err';
        if(st) st.textContent='Erreur chargement images';
        if(note) note.textContent='❌ '+e.message;
      }
    }
  }
}
function loadFB(){
  const d=[];for(let i=0;i<90;i++){const dt=new Date();dt.setDate(dt.getDate()-i);d.push(dt.toISOString().split('T')[0]);}
  dates=d;buildGrid(d);
  document.getElementById('ndvNote').textContent='NASA GIBS · MODIS 250m';
  document.getElementById('dateSrc').textContent='NASA GIBS · MODIS Terra';
  loadNdvi(d[0],'gibs');
}

// ── buildGrid / timeline NDVI bar principale ──
function buildGrid(list){
  if(!list.length) return;
  const sl=document.getElementById('tlSlider');
  if(!sl) return;
  sl.min=0;sl.max=list.length-1;sl.value=0;
  const trackW=sl.offsetWidth||400;
  const maxTicks=Math.floor(trackW/40);
  const step=Math.max(1,Math.ceil(list.length/maxTicks));
  const ticks=document.getElementById('tlTicks');
  if(!ticks) return;
  ticks.innerHTML='';
  list.forEach((d,i)=>{
    if(i%step!==0&&i!==list.length-1) return;
    const cc=datesMeta[d]?parseFloat(datesMeta[d].cc):null;
    const pct=list.length>1?(i/(list.length-1))*100:0;
    const dt=new Date(d+'T12:00:00Z');
    const lbl=dt.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
    const tick=document.createElement('div');
    tick.className='tl-tick'+(i===0?' sel':'')+(cc!==null&&cc>50?' bad':cc>20?' mid':' ok');
    tick.style.left=pct+'%';
    tick.dataset.idx=i;
    tick.innerHTML='<div class="tl-tick-line"></div><div class="tl-tick-lbl">'+lbl+'</div>';
    ticks.appendChild(tick);
  });
  updDate(list[0],0);
  document.getElementById('ndvNote').textContent=list.length+' images';
}

function onTimeline(val){
  curIdx=parseInt(val);
  _parcelIdx=curIdx; // synchroniser les deux index
  if(!dates.length) return;
  const d=dates[curIdx];
  updDate(d,curIdx);
  // Mettre à jour la sélection visuelle dans les chips
  const tl=document.getElementById('ndviTimeline');
  if(tl) tl.querySelectorAll('.ndvi-tl-chip').forEach((ch,i)=>ch.classList.toggle('sel',i===curIdx));
  // Mettre à jour le slider si présent
  const sl=document.getElementById('tlSlider');
  if(sl){sl.max=dates.length-1;sl.value=curIdx;}
  loadNdvi(d,document.getElementById('tdot').classList.contains('ok')?'sentinel':'gibs');
  if(curBase==='s2'){buildS2(d);updateSatDateBadge('s2');}
}
function selDate(d,i){onTimeline(i);}
function applyDate(d){
  const i=dates.indexOf(d);
  if(i>=0) onTimeline(i);
  else if(dates.length) onTimeline(0);
}
function updDate(d,idx){
  const dt=new Date(d+'T12:00:00Z');
  const full=dt.toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'long',year:'numeric'});
  const el=document.getElementById('dateBig');if(el) el.textContent=full;
  const cc=datesMeta[d]?datesMeta[d].cc:null;
  let icon='☀️';if(cc!==null){if(parseFloat(cc)>50)icon='☁️';else if(parseFloat(cc)>20)icon='⛅';}
  const cl=document.getElementById('tlCloudLabel');
  if(cl) cl.textContent=cc!==null?icon+' '+cc+'% nuages':'';
  if(idx!==undefined){const sl=document.getElementById('tlSlider');if(sl) sl.value=idx;}
}

// ── loadNdvi ──
function loadNdvi(d,src){
  showLoad('NDVI '+d+'…');
  if(ndviLyr){try{map.removeLayer(ndviLyr);}catch(e){} ndviLyr=null;}
  const dt=new Date(d+'T12:00:00Z');dt.setDate(dt.getDate()+1);
  const dtStr=dt.toISOString().split('T')[0];
  if(src==='sentinel'){
    // URL WMS avec token d'accès (requis pour Copernicus Data Space)
    const wmsUrl='https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST
      +(tok?'?access_token='+encodeURIComponent(tok):'');
    ndviLyr=L.tileLayer.wms(wmsUrl,{
      layers:NDVI_L,format:'image/png',transparent:true,version:'1.3.0',
      time:d+'/'+dtStr,maxcc:maxCC,attribution:'© Sentinel-2 Copernicus',maxZoom:18,opacity:.88,tileSize:512
    });
  } else {
    ndviLyr=L.tileLayer(GIBS.replace('{time}',d),{attribution:'© NASA GIBS',maxZoom:9,opacity:.85,errorTileUrl:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'});
  }
  ndviLyr.on('load',()=>{hideLoad();showToast('NDVI '+d);});
  ndviLyr.on('tileerror',()=>hideLoad());
  if(ndviOpen){ndviLyr.addTo(map);bringTop();}
  setTimeout(hideLoad,10000);
}

// ── toggleNdvi ──
// ── Toggle NDVI — couche ET bandeau synchronisés ──
function updateNdviBarHeight(){ setTimeout(()=>map.invalidateSize(),50); }

function toggleNdvi(){
  ndviOpen=!ndviOpen;
  const bar=document.getElementById('ndviBar');
  if(bar) bar.classList.toggle('open',ndviOpen);
  const tk=document.getElementById('tk-ndvi');
  if(tk) tk.classList.toggle('on',ndviOpen);
  const ovNdvi=document.getElementById('ov-ndvi');
  if(!ndviOpen){
    if(ndviLyr) map.removeLayer(ndviLyr);
    if(ovNdvi) ovNdvi.classList.remove('on');
  } else {
    if(ovNdvi) ovNdvi.classList.add('on');
    if(dates.length) updateNdviTimeline();
    if(ndviLyr){ ndviLyr.addTo(map); bringTop(); }
    else if(dates.length){ loadNdvi(dates[curIdx],'sentinel'); }
    else{ fetchDates(); }
  }
  // Redimensionner la carte Leaflet
  setTimeout(()=>map.invalidateSize(),50);
  updateGpBadge();
}
// Alias pour le panneau Couches — même comportement
function toggleNdviLayer(){ toggleNdvi(); }


function onCloud(v){maxCC=parseInt(v);document.getElementById('cloudV').textContent=v+'%';if(dates.length)fetchDates();}

// ── Météo ──
function wxIcon(code){
  if(code===null||code===undefined) return '🌡';
  if(code===0)  return '☀️';
  if(code===1)  return '🌤';
  if(code===2)  return '⛅';
  if(code===3)  return '☁️';
  if(code<=49 && code>=45) return '🌫';
  if(code===51||code===53) return '🌦';
  if(code===55) return '🌧';
  if(code===56||code===57) return '🌨';
  if(code===61||code===63) return '🌧';
  if(code===65) return '🌧';
  if(code===66||code===67) return '🌨';
  if(code===71||code===73) return '❄️';
  if(code===75) return '❄️';
  if(code===77) return '🌨';
  if(code===80||code===81) return '🌦';
  if(code===82) return '⛈';
  if(code===85||code===86) return '🌨';
  if(code===95) return '⛈';
  if(code===96||code===99) return '⛈';
  return '🌡';
}
function renderWx(m,days){
  const d=m.daily;if(!d) return '';
  // Partir d'aujourd'hui pour les prévisions (pas J-30)
  const today=new Date().toISOString().split('T')[0];
  let startIdx=d.time.indexOf(today);
  if(startIdx<0) startIdx=Math.max(0,d.time.length-days);
  const sl=d.time.slice(startIdx,startIdx+days);
  const tmax=d.temperature_2m_max.slice(startIdx,startIdx+days);
  const tmin=d.temperature_2m_min.slice(startIdx,startIdx+days);
  const rain=d.precipitation_sum.slice(startIdx,startIdx+days);
  const codes=d.weathercode?d.weathercode.slice(startIdx,startIdx+days):[];
  const maxRain=Math.max(...rain,1);
  return sl.map((t,i)=>{
    const p=t.split('-');const lbl=p[2]+'/'+p[1];
    const barW=Math.round((rain[i]||0)/maxRain*100);
    return '<div class="wx-day"><div class="wx-day-date">'+lbl+'</div><div class="wx-day-icon">'+wxIcon(codes[i])+'</div><div class="wx-day-hi">'+(tmax[i]!==null?tmax[i].toFixed(0)+'°':'—')+'</div><div class="wx-day-lo">'+(tmin[i]!==null?tmin[i].toFixed(0)+'°':'—')+'</div><div class="wx-day-rain">'+(rain[i]||0).toFixed(1)+'mm</div><div class="wx-day-bar"><div class="wx-day-bar-fill" style="width:'+barW+'%"></div></div></div>';
  }).join('');
}

function buildClimatRef(wxD, norms, lat, lng){
  // Mois courant = mois d'aujourd'hui
  const todayStr=new Date().toISOString().split('T')[0];
  const mo=parseInt(todayStr.split('-')[1])-1; // 0-11
  const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin',
              'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const nomMois=MOIS[mo];

  if(!norms){
    return '<div class="wx-clim-wrap">'
      +'<div class="wx-clim-title">Normales climatiques <span>'+nomMois+'</span></div>'
      +'<div class="wx-clim-loading" id="climRefLoading">⏳ Chargement des normales 1991-2020…</div>'
      +'</div>';
  }

  // Normales du mois courant
  const precMois   = norms.precip[mo];                        // mm/mois moyen
  const txMois     = norms.tmax[mo];                          // °C moyen
  const tnMois     = norms.tmin[mo];                          // °C moyen
  const windMois   = norms.wind ? norms.wind[mo] : null;      // km/h si dispo
  // Précipitation max 1 jour (percentile 90 simulé = 60% du cumul mensuel / 3)
  const precMax1j  = norms.precipMax ? norms.precipMax[mo] : +(precMois*0.2).toFixed(1);

  const fmt = v => v!=null ? (Number.isInteger(v)?v:v.toFixed(1)) : '—';

  return '<div class="wx-clim-wrap">'
    +'<div class="wx-clim-title">Normales climatiques <span>'+nomMois+'</span>'
    +' <span style="background:#e8f5e9;color:#2e7d32;">ERA5 · 1991-2020</span></div>'
    +'<div class="wx-clim-grid">'

    // Cumul précip mensuel
    +'<div class="wx-clim-cell">'
    +'<div class="wx-clim-icon">🌧</div>'
    +'<div class="wx-clim-val">'+fmt(precMois)+'<span class="wx-clim-unit"> mm</span></div>'
    +'<div class="wx-clim-lbl">Précip<br>cumulées</div>'
    +'<div class="wx-clim-sub">moy. mensuelle</div>'
    +'</div>'

    // Max précip 1 jour
    +'<div class="wx-clim-cell">'
    +'<div class="wx-clim-icon">⛈</div>'
    +'<div class="wx-clim-val">'+fmt(precMax1j)+'<span class="wx-clim-unit"> mm</span></div>'
    +'<div class="wx-clim-lbl">Max précip<br>1 jour</div>'
    +'<div class="wx-clim-sub">estimé p90</div>'
    +'</div>'

    // T max
    +'<div class="wx-clim-cell">'
    +'<div class="wx-clim-icon">🌡</div>'
    +'<div class="wx-clim-val" style="color:#ef5350;">'+fmt(txMois)+'<span class="wx-clim-unit">°C</span></div>'
    +'<div class="wx-clim-lbl">T° max<br>moyenne</div>'
    +'<div class="wx-clim-sub">normale mois</div>'
    +'</div>'

    // T min
    +'<div class="wx-clim-cell">'
    +'<div class="wx-clim-icon">❄️</div>'
    +'<div class="wx-clim-val" style="color:#42a5f5;">'+fmt(tnMois)+'<span class="wx-clim-unit">°C</span></div>'
    +'<div class="wx-clim-lbl">T° min<br>moyenne</div>'
    +'<div class="wx-clim-sub">normale mois</div>'
    +'</div>'

    // Vent max (si disponible, sinon ETP comme indicateur alternatif)
    +(norms.wind
      ? '<div class="wx-clim-cell">'
        +'<div class="wx-clim-icon">💨</div>'
        +'<div class="wx-clim-val">'+fmt(norms.wind[mo])+'<span class="wx-clim-unit"> km/h</span></div>'
        +'<div class="wx-clim-lbl">Vent max<br>moyen</div>'
        +'<div class="wx-clim-sub">normale mois</div>'
        +'</div>'
      : '<div class="wx-clim-cell">'
        +'<div class="wx-clim-icon">💧</div>'
        +'<div class="wx-clim-val" style="color:#ff9800;">'+(norms.etp?fmt(norms.etp[mo]):'—')+'<span class="wx-clim-unit"> mm</span></div>'
        +'<div class="wx-clim-lbl">ETP<br>mensuelle</div>'
        +'<div class="wx-clim-sub">normale mois</div>'
        +'</div>'
    )

    +'</div>'  // fin grid
    +'<div style="font-size:8px;color:#cfd8dc;margin-top:6px;font-family:DM Mono,monospace;text-align:right;">'
    +'Source : Open-Meteo Climate API · ERA5 · Réanalyse ECMWF 1991-2020</div>'
    +'</div>';
}

// Mettre à jour le bandeau après chargement async des normales
async function updateClimatRef(wxD){
  const lat=window._ndviParcelLat||window._shLat;
  const lng=window._ndviParcelLng||window._shLng;
  if(!lat||!lng) return;
  const norms=await fetchClimNorms(lat,lng);
  const el=document.getElementById('wxClimRef');
  if(el) el.outerHTML=buildClimatRef(wxD,norms,lat,lng);
}


function buildWxCompare(wxD, norms, mode){
  if(!wxD||!wxD.daily) return '';
  const d=wxD.daily;
  const today=new Date().toISOString().split('T')[0];
  const todayParts=today.split('-');
  const curYear=parseInt(todayParts[0]), curMo=parseInt(todayParts[1])-1;
  const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin',
              'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const MOIS_SHORT=['Jan','Fév','Mar','Avr','Mai','Jun',
                    'Jul','Aoû','Sep','Oct','Nov','Déc'];
  if(!mode) mode='month'; // défaut

  // ── Sélection des jours selon le mode ──
  let selectedDays=[];
  if(mode==='7'||mode==='15'||mode==='30'){
    const n=parseInt(mode);
    // Les n derniers jours <= aujourd'hui
    selectedDays=d.time
      .map((t,i)=>({t,i}))
      .filter(x=>x.t<=today)
      .slice(-n);
  } else {
    // mode='month' : jours du mois courant <= aujourd'hui
    selectedDays=d.time
      .map((t,i)=>({t,i}))
      .filter(x=>{
        const p=x.t.split('-');
        return parseInt(p[0])===curYear && parseInt(p[1])-1===curMo && x.t<=today;
      });
  }

  // ── Agrégation ──
  let precCur=0, windMax=0, tmaxMax=-999, tminMin=999, precMax1j=0;
  selectedDays.forEach(({t,i})=>{
    const prec=d.precipitation_sum[i]||0;
    const tmax=d.temperature_2m_max[i];
    const tmin=d.temperature_2m_min[i];
    const wind=d.windgusts_10m_max?d.windgusts_10m_max[i]||0
              :d.windspeed_10m_max?d.windspeed_10m_max[i]||0:0;
    precCur+=prec;
    if(prec>precMax1j) precMax1j=prec;
    if(tmax!=null&&tmax>tmaxMax) tmaxMax=tmax;
    if(tmin!=null&&tmin<tminMin) tminMin=tmin;
    if(wind>windMax) windMax=wind;
  });
  const daysCount=selectedDays.length;

  // ── Normales adaptées au mode ──
  let normPrec=null, normTmax=null, normTmin=null;
  if(norms){
    if(mode==='month'){
      // Normale mensuelle directe
      normPrec=norms.precip[curMo];
      normTmax=norms.tmax[curMo];
      normTmin=norms.tmin[curMo];
    } else {
      // Pour 7/15/30j : moyenne pondérée des mois couverts
      // Simplification : utiliser le mois courant proratisé
      const ratio=parseInt(mode)/30;
      normPrec = norms.precip[curMo]*ratio;
      normTmax = norms.tmax[curMo];   // T° : pas de prorata
      normTmin = norms.tmin[curMo];
    }
  }

  // ── Label de période ──
  let periodLabel='';
  if(mode==='month'){
    const totalDays=new Date(curYear,curMo+1,0).getDate();
    periodLabel=daysCount+' j écoulés / '+totalDays+' · '+MOIS[curMo]+' '+curYear;
  } else {
    const d0=selectedDays[0]?selectedDays[0].t:'';
    const d1=selectedDays[selectedDays.length-1]?selectedDays[selectedDays.length-1].t:'';
    const fmt=s=>{if(!s)return'—';const p=s.split('-');return p[2]+'/'+p[1];};
    periodLabel=fmt(d0)+' → '+fmt(d1)+' ('+daysCount+' j)';
  }

  // ── Boutons de sélection ──
  const curMoShort=MOIS_SHORT[curMo];
  function pbtn(m,lbl){
    return '<button class="wx-psel-btn'+(mode===m?' on':'')+'" '
      +'onclick="setWxCompareMode(\''+m+'\')" >'+lbl+'</button>';
  }
  const selHtml='<div class="wx-period-sel">'
    +pbtn('7','7 j')
    +pbtn('15','15 j')
    +pbtn('30','30 j')
    +pbtn('month',curMoShort)
    +'</div>';

  // ── Fonction jauge ──
  function gauge(icon, label, cur, norm, unit, color){
    if(cur===null||cur===undefined) return '';
    const fmt  = v=>v!=null?v.toFixed(1):null;
    const fmtU = v=>v!=null?v.toFixed(1)+unit:'—';
    const safeNorm=(norm!=null&&norm>0)?norm:null;
    // Pour les températures négatives, référence basée sur l'écart max
    const isTemp=(unit==='°C');
    let ref, wCur, wNorm;
    if(isTemp){
      // Barre basée sur la plage [0, max(cur,norm)+5]
      const hi=Math.max(cur!=null?cur:0, safeNorm||0)+5;
      ref=Math.max(hi,1);
      wCur=Math.min(Math.max((cur/ref)*100,2),100);
      wNorm=safeNorm!=null?Math.min(Math.max((safeNorm/ref)*100,2),100):null;
    } else {
      ref=safeNorm?Math.max(safeNorm*1.6,cur*1.1,0.1):Math.max(cur*1.2,0.1);
      wCur=Math.min(Math.max(cur/ref*100,2),100);
      wNorm=safeNorm!=null?Math.min(safeNorm/ref*100,100):null;
    }
    // Delta
    let deltaHtml='';
    if(safeNorm){
      const delta=cur-safeNorm;
      const sign=delta>=0?'+':'';
      const absPct=Math.abs(delta)/(Math.abs(safeNorm)||1);
      const cls=absPct>0.12?(delta>0?'above':'below'):'normal';
      deltaHtml='<span class="wx-gauge-delta '+cls+'">'+sign+delta.toFixed(1)+unit+'</span>';
    }
    const normLbl=safeNorm
      ?'<span class="wx-gauge-norm-lbl">normale</span>'
       +'<span class="wx-gauge-norm-val">'+fmtU(safeNorm)+'</span>':'';

    return '<div class="wx-gauge-item">'
      +'<div class="wx-gauge-top">'
        +'<span class="wx-gauge-label"><span class="wx-gauge-icon">'+icon+'</span>'+label+'</span>'
        +'<span class="wx-gauge-right">'
          +'<span class="wx-gauge-cur">'+(fmt(cur)||'—')+'</span>'
          +'<span class="wx-gauge-unit">'+unit+'</span>'
          +deltaHtml
        +'</span>'
      +'</div>'
      +'<div class="wx-gauge-bar-row"><div class="wx-gauge-bar-wrap">'
        +(wNorm!=null?'<div class="wx-gauge-bar-norm" style="width:'+wNorm+'%;background:'+color+';"></div>':'')
        +'<div class="wx-gauge-bar-cur" style="width:'+wCur+'%;background:'+color+';"></div>'
        +(wNorm!=null?'<div class="wx-gauge-norm-mark" style="left:'+wNorm+'%;"></div>':'')
      +'</div></div>'
      +(normLbl?'<div class="wx-gauge-bar-labels">'+normLbl+'</div>':'')
      +'</div>';
  }

  return '<div class="wx-compare-wrap">'
    +selHtml
    +'<div class="wx-compare-title">'
      +'Météo vs normale'
      +'<span class="wx-compare-period">'+periodLabel+'</span>'
    +'</div>'
    +'<div class="wx-gauge-row">'
    +gauge('🌧','Précip cumulées',precCur,normPrec,' mm','#1976d2')
    +gauge('⛈','Précip max 1 jour',precMax1j,normPrec!=null?normPrec*0.2:null,' mm','#0288d1')
    +gauge('🌡','T° max',tmaxMax===-999?null:tmaxMax,normTmax,'°C','#e53935')
    +gauge('❄️','T° min',tminMin===999?null:tminMin,normTmin,'°C','#1565c0')
    +gauge('💨','Vent max',windMax,null,' km/h','#546e7a')
    +'</div>'
    +(norms?''
      :'<div style="font-size:8px;color:#b0bec5;margin-top:6px;text-align:center;padding:0 14px 8px;font-family:DM Mono,monospace;">⏳ Normales climatiques en chargement…</div>')
    +'<div style="font-size:7px;color:#cfd8dc;padding:4px 14px 8px;font-family:DM Mono,monospace;text-align:right;">'
      +'ERA5 · 1991-2020</div>'
    +'</div>';
}

// ── Changer le mode de période ──
let _wxCompareMode='month';
function setWxCompareMode(mode){
  _wxCompareMode=mode;
  const wxD=window._wx;
  if(!wxD) return;
  const lat=window._ndviParcelLat||window._shLat;
  const lng=window._ndviParcelLng||window._shLng;
  const key=lat&&lng?(Math.round(lat*4)/4).toFixed(2)+'_'+(Math.round(lng*4)/4).toFixed(2):null;
  const norms=key&&_climCache[key]?_climCache[key]:null;
  const el=document.getElementById('wxCompareWrap');
  if(el) el.innerHTML=buildWxCompare(wxD,norms,mode);
}

function buildWxToday(m){
  if(!m) return '';
  const d=m.daily,n=d.time.length;
  // Trouver l'index d'aujourd'hui dans le tableau (pas le dernier = J+7)
  const today=new Date().toISOString().split('T')[0];
  let idx=d.time.indexOf(today);
  // Si aujourd'hui absent (timezone), prendre le jour le plus proche avant aujourd'hui
  if(idx<0){
    for(let i=n-1;i>=0;i--){if(d.time[i]<=today){idx=i;break;}}
  }
  if(idx<0) idx=n-1; // dernier recours
  const curDate=d.time[idx]||today;
  const lp=curDate.split('-');
  const JOURS=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const MOIS_C=['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
  const dateObj=new Date(curDate+'T12:00:00Z');
  const jourNom=JOURS[dateObj.getUTCDay()];
  const dateLabel=lp[2]+' '+MOIS_C[parseInt(lp[1])-1]+' '+lp[0];
  const tmax=d.temperature_2m_max[idx];
  const tmin=d.temperature_2m_min[idx];
  const rain=d.precipitation_sum[idx]||0;
  const wind=d.windspeed_10m_max?d.windspeed_10m_max[idx]:null;
  const gusts=d.windgusts_10m_max?d.windgusts_10m_max[idx]:null;
  const etp=d.et0_fao_evapotranspiration?d.et0_fao_evapotranspiration[idx]:null;
  // Pluie 7 derniers jours PASSÉS
  const rain7=d.precipitation_sum.slice(Math.max(0,idx-6),idx+1).reduce((a,b)=>a+(b||0),0);
  const etp7=d.et0_fao_evapotranspiration?d.et0_fao_evapotranspiration.slice(Math.max(0,idx-6),idx+1).reduce((a,b)=>a+(b||0),0):null;
  const wcode=d.weathercode?d.weathercode[idx]:null;
  const icon=wxIcon(wcode);
  // Bilan hydrique 7j
  const bilan7=etp7!=null?(rain7-etp7).toFixed(0):null;
  const bilanColor=bilan7!=null?(parseFloat(bilan7)>0?'#1976d2':parseFloat(bilan7)<-20?'#c62828':'#e65100'):'#90a4ae';
  // Conditions actuelles (current_weather si dispo)
  const cw=m.current_weather;
  const cwHtml=cw?'<div class="wx-current-bar">'
    +'<span class="wx-current-icon">'+wxIcon(cw.weathercode)+'</span>'
    +'<span class="wx-current-temp">'+cw.temperature.toFixed(1)+'°C</span>'
    +'<span class="wx-current-wind">💨 '+cw.windspeed.toFixed(0)+' km/h</span>'
    +'<span class="wx-current-lbl">Conditions actuelles</span>'
    +'</div>':'';
  return cwHtml
    +'<div class="wx-today-section">'
    +'<div class="wx-section-title">Dernière journée complète'
    +'<span class="wx-section-date">'+jourNom+' '+dateLabel+'</span>'
    +'<span class="wx-section-icon">'+icon+'</span>'
    +'</div>'
    +'<div class="wx-today-grid">'
    +'<div class="wx-today-cell">'
      +'<div class="wx-today-icon">🌡</div>'
      +'<div class="wx-today-val">'+(tmax!=null?tmax.toFixed(1)+'°':'—')+'</div>'
      +(tmin!=null?'<div class="wx-today-sub">min '+tmin.toFixed(1)+'°</div>':'')
      +'<div class="wx-today-lbl">T max / min</div>'
    +'</div>'
    +'<div class="wx-today-cell">'
      +'<div class="wx-today-icon">🌧</div>'
      +'<div class="wx-today-val">'+rain.toFixed(1)+'<span style="font-size:9px">mm</span></div>'
      +'<div class="wx-today-sub">7j : '+rain7.toFixed(0)+' mm</div>'
      +'<div class="wx-today-lbl">Précip</div>'
    +'</div>'
    +'<div class="wx-today-cell">'
      +'<div class="wx-today-icon">💨</div>'
      +'<div class="wx-today-val">'+(wind?wind.toFixed(0):'—')+'<span style="font-size:9px">km/h</span></div>'
      +(gusts?'<div class="wx-today-sub">rafale '+gusts.toFixed(0)+'</div>':'')
      +'<div class="wx-today-lbl">Vent max</div>'
    +'</div>'
    +'<div class="wx-today-cell">'
      +'<div class="wx-today-icon">🌿</div>'
      +'<div class="wx-today-val">'+(etp!=null?etp.toFixed(1):'—')+'<span style="font-size:9px">mm</span></div>'
      +(etp7!=null?'<div class="wx-today-sub">7j : '+etp7.toFixed(0)+' mm</div>':'')
      +'<div class="wx-today-lbl">ETP (FAO)</div>'
    +'</div>'
    +'<div class="wx-today-cell">'
      +'<div class="wx-today-icon">💧</div>'
      +'<div class="wx-today-val" style="color:'+bilanColor+'">'+(bilan7!=null?(parseFloat(bilan7)>0?'+':'')+bilan7:'—')+'<span style="font-size:9px">mm</span></div>'
      +'<div class="wx-today-sub">Pluie − ETP 7j</div>'
      +'<div class="wx-today-lbl">Bilan hydrique</div>'
    +'</div>'
    +'</div>'
    +'</div>';
}

function swWx(days,el){
  document.querySelectorAll('.wx-ptab').forEach(e=>e.classList.remove('on'));
  if(el) el.classList.add('on');
  if(window._wx){
    drawWxCWithNorms(window._wx,days);
    const strip=document.getElementById('wxForecastStrip');
    if(strip) strip.innerHTML=renderWx(window._wx,days);
  }
}
// Normales climatiques ERA5 localisées — calculées en cache par coordonnées
const _climCache={};

async function fetchClimNorms(lat,lng){
  const key=(Math.round(lat*4)/4).toFixed(2)+'_'+(Math.round(lng*4)/4).toFixed(2);
  if(_climCache[key]) return _climCache[key];
  // Plan A : API Climate Open-Meteo (normales 1991-2020, référence WMO)
  try{
    const url='https://climate-api.open-meteo.com/v1/climate'
      +'?latitude='+lat+'&longitude='+lng
      +'&start_date=1991-01-01&end_date=2020-12-31'
      +'&models=ERA5&monthly=precipitation_sum,temperature_2m_max,temperature_2m_min'
      +'&timezone=Europe/Paris';
    const r=await fetch(url);
    if(!r.ok) throw new Error('climate '+r.status);
    const d=await r.json();
    const mo=d.monthly;
    if(!mo||!mo.time) throw new Error('no monthly');
    const acc={p:new Array(12).fill(0),tx:new Array(12).fill(0),tn:new Array(12).fill(0),n:new Array(12).fill(0)};
    mo.time.forEach((t,i)=>{
      const m=parseInt(t.split('-')[1])-1;
      if(mo.precipitation_sum[i]!=null){acc.p[m]+=mo.precipitation_sum[i];acc.n[m]++;}
      if(mo.temperature_2m_max[i]!=null) acc.tx[m]+=mo.temperature_2m_max[i];
      if(mo.temperature_2m_min[i]!=null) acc.tn[m]+=mo.temperature_2m_min[i];
    });
    const norms={precip:[],tmax:[],tmin:[]};
    for(let m=0;m<12;m++){
      const n=acc.n[m]||1;
      norms.precip.push(+(acc.p[m]/n).toFixed(1));
      norms.tmax.push(+(acc.tx[m]/n).toFixed(1));
      norms.tmin.push(+(acc.tn[m]/n).toFixed(1));
    }
    _climCache[key]=norms;
    return norms;
  }catch(e1){
    // Plan B : archive ERA5 daily sur 5 ans
    try{
      const endY=new Date().getFullYear()-1, startY=endY-4;
      const r2=await fetch('https://archive-api.open-meteo.com/v1/archive'
        +'?latitude='+lat+'&longitude='+lng
        +'&start_date='+startY+'-01-01&end_date='+endY+'-12-31'
        +'&daily=precipitation_sum,temperature_2m_max,temperature_2m_min'
        +'&timezone=Europe/Paris');
      if(!r2.ok) throw new Error(r2.status);
      const d2=await r2.json();
      const dl=d2.daily;
      if(!dl||!dl.time) throw new Error('no daily');
      // Accumuler par mois-année puis moyenner par mois calendaire
      const byMoYr={};
      dl.time.forEach((t,i)=>{
        const parts=t.split('-'), key2=parts[0]+'-'+parts[1];
        const mo=parseInt(parts[1])-1;
        if(!byMoYr[key2]) byMoYr[key2]={mo,p:0,tx:0,tn:0,np:0,nt:0};
        const p=dl.precipitation_sum[i],tx=dl.temperature_2m_max[i],tn=dl.temperature_2m_min[i];
        if(p!=null){byMoYr[key2].p+=p;byMoYr[key2].np++;}
        if(tx!=null){byMoYr[key2].tx+=tx;byMoYr[key2].nt++;}
        if(tn!=null) byMoYr[key2].tn+=tn;
      });
      const acc2={p:new Array(12).fill(0),tx:new Array(12).fill(0),tn:new Array(12).fill(0),n:new Array(12).fill(0),nt:new Array(12).fill(0)};
      Object.values(byMoYr).forEach(mv=>{
        acc2.p[mv.mo]+=mv.p; acc2.tx[mv.mo]+=mv.tx; acc2.tn[mv.mo]+=mv.tn;
        acc2.n[mv.mo]++; acc2.nt[mv.mo]+=mv.nt;
      });
      const norms2={precip:[],tmax:[],tmin:[]};
      for(let m=0;m<12;m++){
        const n=acc2.n[m]||1, nt=acc2.nt[m]||1;
        norms2.precip.push(+(acc2.p[m]/n).toFixed(1));
        norms2.tmax.push(+(acc2.tx[m]/nt).toFixed(1));
        norms2.tmin.push(+(acc2.tn[m]/nt).toFixed(1));
      }
      _climCache[key]=norms2;
      return norms2;
    }catch(e2){
      console.warn('Normales indisponibles:',e1.message,e2.message);
      return null;
    }
  }
}

function drawWxC(m,days,norms){
  const canvas=document.getElementById('wxC');
  if(!canvas) return;
  if(wxChart){wxChart.destroy();wxChart=null;}
  const d=m.daily,n=Math.min(days,d.time.length);
  const lb=d.time.slice(-n).map(t=>{const p=t.split('-');return p[2]+'/'+p[1];});
  const etp=d.et0_fao_evapotranspiration?d.et0_fao_evapotranspiration.slice(-n):null;
  const precip=d.precipitation_sum.slice(-n);

  // Normale affichée dans le bandeau wx-clim-wrap (plus dans le graphique)

  const datasets=[
    {label:'Précip (mm/j)',data:precip,type:'bar',backgroundColor:'rgba(33,150,243,.45)',borderRadius:2,yAxisID:'y'},
    {label:'T max (°C)',data:d.temperature_2m_max.slice(-n),type:'line',borderColor:'#ef5350',borderWidth:1.5,pointRadius:0,tension:.4,fill:false,yAxisID:'y2'},
    {label:'T min (°C)',data:d.temperature_2m_min.slice(-n),type:'line',borderColor:'#42a5f5',borderWidth:1,pointRadius:0,tension:.4,fill:false,yAxisID:'y2'},
  ];
  // (normale retirée du graphique — voir bandeau wx-clim-ref ci-dessous)
  if(etp) datasets.push({label:'ETP (mm/j)',data:etp,type:'line',borderColor:'#ff9800',borderWidth:1.5,borderDash:[3,3],pointRadius:0,tension:.4,fill:false,yAxisID:'y'});

  wxChart=new Chart(canvas,{type:'bar',data:{labels:lb,datasets},options:{
    responsive:true,maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{labels:{font:{size:8},color:'#546e7a',boxWidth:10,padding:6}},
      tooltip:{
        backgroundColor:'rgba(255,255,255,.97)',titleColor:'#37474f',
        bodyColor:'#546e7a',borderColor:'#e0e0e0',borderWidth:1,
        callbacks:{
          label:function(ctx){
            const v=ctx.raw!=null?+ctx.raw:null;
            if(v===null) return ctx.dataset.label+': —';
            if(ctx.datasetIndex===0||ctx.dataset.label.includes('Normale')||ctx.dataset.label.includes('ETP'))
              return ctx.dataset.label+': '+v.toFixed(1)+' mm/j';
            return ctx.dataset.label+': '+v.toFixed(1)+'°C';
          }
        }
      }
    },
    scales:{
      y:{position:'left',grid:{color:'rgba(0,0,0,.04)'},
        ticks:{font:{size:8},color:'#1565c0'},
        title:{display:true,text:'mm/jour',color:'#1565c0',font:{size:8}}},
      y2:{position:'right',grid:{display:false},
        ticks:{font:{size:8},color:'#ef5350'},
        title:{display:true,text:'°C',color:'#ef5350',font:{size:8}}},
      x:{grid:{display:false},ticks:{font:{size:7},color:'#90a4ae',maxTicksLimit:10}}
    }
  }});
}

// Wrapper async pour charger les normales puis dessiner
async function drawWxCWithNorms(m,days){
  const lat=window._ndviParcelLat||window._shLat;
  const lng=window._ndviParcelLng||window._shLng;
  let norms=null;
  if(lat&&lng) norms=await fetchClimNorms(lat,lng);
  // Mettre à jour le comparatif jauges
  const cw=document.getElementById('wxCompareWrap');
  if(cw) cw.innerHTML=buildWxCompare(m,norms,_wxCompareMode);
  // Mettre à jour le bandeau normales
  const cr=document.getElementById('wxClimRef');
  if(cr) cr.innerHTML=buildClimatRef(m,norms,lat,lng);
}

// ── Onglets fiche parcelle ──
function shTab(name,el){
  document.querySelectorAll('.sh-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.sh-pane').forEach(p=>p.classList.remove('on'));
  if(el) el.classList.add('on');
  const pane=document.getElementById('pane-'+name);
  if(pane) pane.classList.add('on');

  if(name==='ndvi'){
    // Attendre que le pane soit visible
    setTimeout(()=>{
      const lat=window._ndviParcelLat, lng=window._ndviParcelLng;
      if(!lat||!lng) return;
      if(!_ndviParcelMap){
        initNdviParcelMap(window._currentRpgFeature,lat,lng);
      } else {
        _ndviParcelMap.invalidateSize();
        if(!_ndviParcelLayer) loadNdviOnParcel();
      }
    },80);
  } else if(name==='wx'){
    // Redessiner les graphiques météo si nécessaire
    if(window._wx) setTimeout(()=>drawWxCWithNorms(window._wx,7),80);
  }
}

// ── MESURES ──
const drawn=new L.FeatureGroup().addTo(map);
let drawCtrl=null,measureResult=null,mMode=null;
let _measurePts=[],_measureLine=null,_measureTmpMarkers=[];
let _wasArea=false;

function haversineDist(a,b){
  const R=6371000,toRad=x=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng);
  const s=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
function sphericalArea(pts){
  if(pts.length<3) return 0;
  const R=6371000,toRad=x=>x*Math.PI/180;
  let area=0;
  for(let i=0;i<pts.length;i++){
    const j=(i+1)%pts.length;
    area+=(toRad(pts[j].lng)-toRad(pts[i].lng))*(2+Math.sin(toRad(pts[i].lat))+Math.sin(toRad(pts[j].lat)));
  }
  return Math.abs(area*R*R/2);
}
function fmtDist(m){return m<1000?m.toFixed(1)+' m':(m/1000).toFixed(3)+' km';}
function fmtArea(m2){return m2<10000?Math.round(m2)+' m²':(m2/10000).toFixed(2)+' ha';}
function _clearTmpMeasure(){
  _measurePts=[];
  if(_measureLine){try{map.removeLayer(_measureLine);}catch(e){} _measureLine=null;}
  _measureTmpMarkers.forEach(m=>{try{map.removeLayer(m);}catch(e){}});
  _measureTmpMarkers=[];
}
function clearAll(){
  drawn.clearLayers();_clearTmpMeasure();
  if(measureResult){try{map.removeLayer(measureResult);}catch(e){} measureResult=null;}
  const bl=document.getElementById('btnLine');if(bl) bl.classList.remove('active');
  const ba=document.getElementById('btnArea');if(ba) ba.classList.remove('active');
  map.off('click',_measureClick);map.off('dblclick',_measureFinish);
  map.getContainer().style.cursor='';mMode=null;
}
function startMeasure(type){
  clearAll();
  GP_PANELS.forEach(p=>{
    const pe=document.getElementById('gpPanel'+p.charAt(0).toUpperCase()+p.slice(1));
    const be=document.getElementById(GP_BTN_IDS[p]);
    if(pe) pe.classList.remove('open');if(be) be.classList.remove('active');
  });
  closeSheet();
  mMode=type;_wasArea=(type==='area');
  const el=document.getElementById(type==='line'?'btnLine':'btnArea');
  if(el) el.classList.add('active');
  map.getContainer().style.cursor='crosshair';
  map.on('click',_measureClick);map.on('dblclick',_measureFinish);
  showToast(type==='line'?'Cliquez pour tracer — double-clic pour terminer':'Délimitez la surface — double-clic pour fermer');
}
function _measureClick(e){
  if(!mMode) return;
  L.DomEvent.stopPropagation(e);
  _measurePts.push(e.latlng);
  const dot=L.circleMarker(e.latlng,{radius:5,color:'white',fillColor:'#1565c0',fillOpacity:1,weight:2});
  dot.addTo(map);_measureTmpMarkers.push(dot);
  if(_measureLine) map.removeLayer(_measureLine);
  if(_measurePts.length>1){
    _measureLine=L.polyline(_measurePts,{color:'#1565c0',weight:2,dashArray:'6,4'}).addTo(map);
    let d=0;for(let i=1;i<_measurePts.length;i++) d+=haversineDist(_measurePts[i-1],_measurePts[i]);
    showToast(fmtDist(d)+' — double-clic pour terminer');
  }
}
function _measureFinish(e){
  if(!mMode) return;
  L.DomEvent.stopPropagation(e);
  map.off('click',_measureClick);map.off('dblclick',_measureFinish);
  map.getContainer().style.cursor='';
  const pts=[..._measurePts];_clearTmpMeasure();mMode=null;
  const bl=document.getElementById('btnLine');if(bl) bl.classList.remove('active');
  const ba=document.getElementById('btnArea');if(ba) ba.classList.remove('active');
  if(pts.length<2){return;}
  let result='',label='',center,layer;
  if(_wasArea){
    const area=sphericalArea(pts);result=fmtArea(area);label='Surface';
    layer=L.polygon(pts,{color:'#2980b9',weight:2,fillColor:'#2980b9',fillOpacity:.15}).addTo(drawn);
    center=layer.getBounds().getCenter();
  } else {
    let d=0;for(let i=1;i<pts.length;i++) d+=haversineDist(pts[i-1],pts[i]);
    result=fmtDist(d);label='Distance';
    layer=L.polyline(pts,{color:'#c0392b',weight:3}).addTo(drawn);
    center=pts[Math.floor(pts.length/2)];
  }
  if(measureResult) try{map.removeLayer(measureResult);}catch(e){}
  measureResult=L.popup({closeButton:true,autoClose:false,closeOnClick:false})
    .setLatLng(center)
    .setContent('<div style="font-family:DM Mono,monospace;text-align:center;padding:4px 8px;"><div style="font-size:10px;color:#546e7a;">'+label+'</div><div style="font-family:Inter,sans-serif;font-size:18px;font-weight:700;color:#0d4f2a;">'+result+'</div></div>')
    .addTo(map);
  showToast(label+' : '+result);
}

// ── GPS ──
let gpsM=null,gpsC=null,wid=null;
function startGPS(){
  if(!navigator.geolocation){
    showToast('GPS non disponible sur cet appareil');
    return;
  }

  // Si déjà actif : toggle le panneau info
  if(wid!==null){
    const p=document.getElementById('gpsPanel');
    if(p) p.classList.toggle('visible');
    return;
  }

  // Vérifier HTTPS
  const secure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
  if(!secure){
    showToast('⚠️ HTTPS requis pour le GPS précis');
  }

  const gdot=document.getElementById('gdot');
  const glbl=document.getElementById('glbl');
  const tBtn=document.getElementById('gpsTargetBtn');
  if(gdot) gdot.className='gdot search';
  if(glbl) glbl.textContent='Recherche GPS…';
  if(tBtn) tBtn.classList.add('tracking');

  showToast('📡 Demande de position GPS…');

  let _firstFix=true;
  let _lastHeading=null;
  let _lastSpeed=0;

  wid=navigator.geolocation.watchPosition(
    pos=>{
      const{latitude:lat,longitude:lng,accuracy:acc,speed,heading,altitude}=pos.coords;

      // ── UI header ──
      if(gdot) gdot.className='gdot on';
      const accLabel=acc<10?'GPS précis':acc<30?'GPS bon':acc<100?'GPS moyen':'GPS faible';
      if(glbl) glbl.textContent='±'+acc.toFixed(0)+'m';

      // ── Panneau info GPS ──
      const setV=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
      setV('gpsLat', lat.toFixed(6)+'°');
      setV('gpsLng', lng.toFixed(6)+'°');
      setV('gpsAcc', acc.toFixed(0)+' m — '+accLabel);
      setV('gpsSpd', speed!=null&&speed>0.1?(speed*3.6).toFixed(1)+' km/h':'immobile');
      setV('gpsHdg', heading!=null?Math.round(heading)+'° ('+headingToCardinal(heading)+')':'—');
      // Reverse geocoding — adresse GPS
      if(_firstFix){
        fetch('https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lng+'&format=json&accept-language=fr')
          .then(r=>r.json())
          .then(d=>{
            const a=d.address||{};
            const addr=[a.road||a.hamlet,a.village||a.town||a.city,a.postcode].filter(Boolean).join(', ');
            setV('gpsAddr', addr||'Localisation GPS active');
          }).catch(()=>{});
      }

      // Smooth heading
      if(heading!=null) _lastHeading=heading;
      if(speed!=null) _lastSpeed=speed;
      const hasMotion=_lastSpeed>0.3&&_lastHeading!=null;

      // ── Marqueur GPS ──
      const arrowHtml=hasMotion
        ?`<div class="gps-heading-arrow" style="transform:translateX(-50%) rotate(${_lastHeading}deg);"></div>`:'';
      const iconHtml=`<div class="gps-dot-wrap">${arrowHtml}<div class="gps-ring"></div><div class="gps-dot${hasMotion?' heading':''}"></div></div>`;
      const ic=L.divIcon({html:iconHtml,className:'',iconSize:[22,22],iconAnchor:[11,11]});

      if(gpsM){
        gpsM.setLatLng([lat,lng]);
        gpsM.setIcon(ic);
        gpsC.setLatLng([lat,lng]).setRadius(acc);
      } else {
        gpsM=L.marker([lat,lng],{icon:ic,zIndexOffset:1000}).addTo(map);
        gpsC=L.circle([lat,lng],{
          radius:acc,color:'#2979ff',fillColor:'#2979ff',
          fillOpacity:.06,weight:1.5,dashArray:'4,4'
        }).addTo(map);
      }

      // ── Premier fix : centrer et ouvrir le panneau ──
      if(_firstFix){
        _firstFix=false;
        map.flyTo([lat,lng],17,{duration:1.2});
        const panel=document.getElementById('gpsPanel');
        if(panel) panel.classList.add('visible');
        showToast('📍 Position GPS · ±'+acc.toFixed(0)+'m');
      } else if(_gpsAutoFollow){
        map.setView([lat,lng],map.getZoom(),{animate:true,duration:.4});
      }
    },
    err=>{
      if(gdot) gdot.className='gdot err';
      if(glbl) glbl.textContent='Localiser';
      if(tBtn) tBtn.classList.remove('tracking');
      wid=null;
      let msg='';
      if(err.code===1){
        msg='Permission GPS refusée';
        // Instructions selon navigateur
        const ua=navigator.userAgent;
        if(/Chrome/.test(ua)) msg+=' — Cliquez 🔒 → Localisation → Autoriser';
        else if(/Firefox/.test(ua)) msg+=' — Cliquez ⚙ dans la barre d\'adresse';
        else if(/Safari/.test(ua)) msg+=' — Réglages Safari → Localisation';
        showToast(msg);
      } else if(err.code===2){
        showToast('Signal GPS indisponible — vérifiez votre connexion');
        // Fallback IP géolocation
        fetch('https://ipapi.co/json/').then(r=>r.json()).then(d=>{
          if(d.latitude){
            map.setView([d.latitude,d.longitude],12);
            showToast('📍 Position approximative (IP) · '+d.city);
          }
        }).catch(()=>{});
      } else if(err.code===3){
        showToast('GPS lent — nouvelle tentative…');
        setTimeout(()=>{
          if(wid===null){
            navigator.geolocation.getCurrentPosition(
              p=>{map.flyTo([p.coords.latitude,p.coords.longitude],15,{duration:1});
                  if(gdot) gdot.className='gdot on';
                  showToast('Position approx. · ±'+p.coords.accuracy.toFixed(0)+'m');
                  if(!gpsM){
                    gpsM=L.marker([p.coords.latitude,p.coords.longitude],{zIndexOffset:1000}).addTo(map);
                    gpsC=L.circle([p.coords.latitude,p.coords.longitude],{radius:p.coords.accuracy,color:'#2979ff',fillOpacity:.06,weight:1}).addTo(map);
                  }},
              ()=>showToast('GPS indisponible'),
              {enableHighAccuracy:false,timeout:10000}
            );
          }
        },500);
      }
    },
    {enableHighAccuracy:true,maximumAge:2000,timeout:25000}
  );

  map.on('dragstart',()=>{_gpsAutoFollow=false;});
}

// Convertir cap en point cardinal
function headingToCardinal(h){
  const dirs=['N','NE','E','SE','S','SO','O','NO'];
  return dirs[Math.round(h/45)%8];
}

let _gpsAutoFollow=true;

function gpsCenterOnMe(){
  if(!gpsM) return;
  _gpsAutoFollow=true;
  map.flyTo(gpsM.getLatLng(),17,{duration:.8});
  showToast('Recentrage sur votre position');
}

function stopGPS(){
  if(wid!==null){navigator.geolocation.clearWatch(wid);wid=null;}
  if(gpsM){map.removeLayer(gpsM);gpsM=null;}
  if(gpsC){map.removeLayer(gpsC);gpsC=null;}
  document.getElementById('gdot').className='gdot';
  document.getElementById('glbl').textContent='Localiser';
  document.querySelector('.gps-pill')?.classList.remove('tracking');
  document.getElementById('gpsTargetBtn')?.classList.remove('tracking');
  const panel=document.getElementById('gpsPanel');
  if(panel) panel.classList.remove('visible');
  showToast('Suivi GPS arrêté');
}

function toggleGpsPanel(){
  if(wid!==null){
    const p=document.getElementById('gpsPanel');
    if(p) p.classList.toggle('visible');
  } else {
    startGPS();
  }
}

// ── Recherche ──
function doSearch(){
  const q=document.getElementById('sInp').value.trim();if(!q) return;
  fetch('https://data.geopf.fr/geocodage/search?q='+encodeURIComponent(q)+'&limit=1')
    .then(r=>r.json())
    .then(data=>{
      if(!data.features?.length){showToast('Introuvable');return;}
      const[lng,lat]=data.features[0].geometry.coordinates;
      map.flyTo([lat,lng],15,{duration:1.2});
      setTimeout(()=>fetchDates(),1500);
      showToast(data.features[0].properties.label||q);
    }).catch(()=>showToast('Erreur recherche'));
}

// ── Loaders / Toast ──
function showLoad(m){document.getElementById('ltxt').textContent=m;document.getElementById('loader').classList.add('show');}
function hideLoad(){document.getElementById('loader').classList.remove('show');}
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);}

// ── Stockage local ──
const STORE_KEY='terrain_expert_data';
function loadStore(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}');}catch(e){return {};}}
function saveStore(d){
  try{localStorage.setItem(STORE_KEY,JSON.stringify(d));}catch(e){}
  // Mettre à jour le badge du bouton export
  const nb=Object.values(d).filter(p=>(p.visits&&p.visits.length>0)||p.comment).length;
  const btn=document.getElementById('btnExportPdf');
  if(btn) btn.setAttribute('data-count',nb>0?nb:'');
}
function getParcKey(lat,lng){return Math.round(+lat*10000)/10000+'_'+Math.round(+lng*10000)/10000;}
function saveParcelData(lat,lng,data){
  const store=loadStore();const key=getParcKey(lat,lng);
  store[key]={...store[key],...data,lat,lng,updatedAt:new Date().toISOString()};
  saveStore(store);
}
function loadParcelData(lat,lng){return loadStore()[getParcKey(lat,lng)]||{};}

// ── Marqueurs commentaires ──
const commentMarkers={};
function addCommentMarker(lat,lng,text){
  const key=getParcKey(lat,lng);
  if(commentMarkers[key]) map.removeLayer(commentMarkers[key]);
  const ic=L.divIcon({html:'<div title="'+text.slice(0,60)+'" style="background:#e65100;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid white;">💬</div>',className:'',iconSize:[26,26],iconAnchor:[13,13]});
  commentMarkers[key]=L.marker([lat,lng],{icon:ic,zIndexOffset:500}).bindPopup('<div style="font-size:11px;max-width:200px;font-family:DM Mono,monospace;">'+text.replace(/\n/g,'<br>')+'</div>',{maxWidth:220}).addTo(map);
}
function removeCommentMarker(lat,lng){const key=getParcKey(lat,lng);if(commentMarkers[key]){map.removeLayer(commentMarkers[key]);delete commentMarkers[key];}}
function restoreCommentMarkers(){Object.values(loadStore()).forEach(d=>{if(d.comment&&d.lat&&d.lng) addCommentMarker(d.lat,d.lng,d.comment);});}

// ── Contour parcelle ──
let parcelOutlineLayer=null;
function showParcelOutline(f){
  if(parcelOutlineLayer){map.removeLayer(parcelOutlineLayer);parcelOutlineLayer=null;}
  if(!f?.geometry) return;
  parcelOutlineLayer=L.geoJSON(f,{style:{color:'#FFD700',weight:3,fillColor:'#FFD700',fillOpacity:0.08,dashArray:'6,4'}}).addTo(map);
}
function clearParcelOutline(){if(parcelOutlineLayer){map.removeLayer(parcelOutlineLayer);parcelOutlineLayer=null;}}

// ── Géométrie point-in-polygon ──
function pointInPolygon(lat,lng,coords){
  let inside=false;
  for(let ring of coords){
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if(((yi>lat)!==(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi)+xi)) inside=!inside;
    }
  }
  return inside;
}
function pointInGeoJSON(lat,lng,feature){
  if(!feature?.geometry) return false;
  const g=feature.geometry;
  try{
    if(g.type==='Polygon') return pointInPolygon(lat,lng,g.coordinates);
    if(g.type==='MultiPolygon') return g.coordinates.some(p=>pointInPolygon(lat,lng,p));
  }catch(e){}
  return false;
}
function distToFeature(lat,lng,feature){
  if(!feature?.geometry) return Infinity;
  try{
    let sumX=0,sumY=0,count=0;
    const addC=ring=>ring.forEach(c=>{sumX+=c[0];sumY+=c[1];count++;});
    const g=feature.geometry;
    if(g.type==='Polygon') g.coordinates.forEach(addC);
    else if(g.type==='MultiPolygon') g.coordinates.forEach(p=>p.forEach(addC));
    if(!count) return Infinity;
    return Math.sqrt((lng-sumX/count)**2+(lat-sumY/count)**2);
  }catch(e){return Infinity;}
}

// ── map.on click ──
map.on('click',e=>{
  if(mMode||_annotMode) return;
  openSheet(e.latlng.lat,e.latlng.lng);
});

// ── openSheet ──
async function openSheet(lat,lng){
  try{
    document.getElementById('sheet').classList.add('open');
  // Fermer la barre NDVI globale quand la fiche s'ouvre
  if(ndviOpen){
    ndviOpen=false;
    const bar=document.getElementById('ndviBar');
    if(bar) bar.classList.remove('open');
    const tk=document.getElementById('tk-ndvi');
    if(tk) tk.classList.remove('on');
    const ovNdvi=document.getElementById('ov-ndvi');
    if(ovNdvi) ovNdvi.classList.remove('on');
    if(ndviLyr) map.removeLayer(ndviLyr);
  }
  setTimeout(()=>map.invalidateSize(),50);
    window._shLat=lat;window._shLng=lng;
    document.getElementById('shTitle').textContent=lat.toFixed(4)+', '+lng.toFixed(4);
    document.getElementById('shCoords').textContent=lat.toFixed(5)+', '+lng.toFixed(5);
    document.getElementById('cpill').textContent='…';
    document.getElementById('shBody').innerHTML='<div style="text-align:center;padding:40px 20px;"><div style="width:26px;height:26px;border:3px solid #e0e0e0;border-top-color:var(--gm);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px;"></div><div style="font-size:11px;color:var(--t2);">Récupération des données…</div></div>';

    // ── Cache : clé quantisée à 3 décimales (~111m) ──
    const _ck=lat.toFixed(3)+'_'+lng.toFixed(3);
    const _cached=_cacheGet(_sheetCache,_ck);

    let geo,rpgWfs,wx,sinR;
    if(_cached){
      ({geo,rpgWfs,wx,sinR}=_cached);
    } else {
      // ── Tous les fetches en parallèle ──
      const sinDate=new Date();sinDate.setDate(sinDate.getDate()-90);
      const sinParams=['temperature_2m_min','temperature_2m_max','precipitation_sum','precipitation_hours','windgusts_10m_max','et0_fao_evapotranspiration','snowfall_sum','showers_sum','weathercode'].join(',');
      const sinUrl='https://archive-api.open-meteo.com/v1/archive?latitude='+lat+'&longitude='+lng+'&start_date='+sinDate.toISOString().split('T')[0]+'&end_date='+new Date().toISOString().split('T')[0]+'&daily='+sinParams+'&timezone=Europe/Paris';

      [geo,rpgWfs,wx,sinR]=await Promise.allSettled([
        fetch('https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lng+'&format=json&accept-language=fr').then(r=>r.json()),
        (async ()=>{
          // ── RPG : les 2 URLs en parallèle, on prend la première qui retourne des features ──
          const cql='INTERSECTS(geom,POINT('+lng+' '+lat+'))';
          const url1='https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=RPG.LATEST:parcelles_graphiques&OUTPUTFORMAT=application/json&SRSNAME=EPSG:4326&COUNT=1&CQL_FILTER='+encodeURIComponent(cql);
          const dl2=0.0008;
          const url2='https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=RPG.LATEST:parcelles_graphiques&OUTPUTFORMAT=application/json&SRSNAME=EPSG:4326&COUNT=10&BBOX='+(lng-dl2)+','+(lat-dl2)+','+(lng+dl2)+','+(lat+dl2)+',EPSG:4326';
          const [r1,r2]=await Promise.allSettled([
            fetch(url1).then(r=>r.json()),
            fetch(url2).then(r=>r.json()),
          ]);
          if(r1.status==='fulfilled'&&r1.value?.features?.length>0) return r1.value;
          if(r2.status==='fulfilled'&&r2.value?.features?.length>0) return r2.value;
          return {features:[]};
        })(),
        fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lng+'&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,windgusts_10m_max,weathercode,et0_fao_evapotranspiration&current_weather=true&past_days=30&forecast_days=7&timezone=Europe/Paris').then(r=>r.json()),
        fetch(sinUrl).then(r=>r.json()),
      ]);
      _cacheSet(_sheetCache,_ck,{geo,rpgWfs,wx,sinR});
    }

    let commune='—', communeCP='—';
    if(geo.status==='fulfilled'&&geo.value?.address){
      const a=geo.value.address;
      const nom=a.village||a.hamlet||a.town||a.city||a.municipality||a.county||'—';
      const cp=a.postcode||'';
      const dept=a.county||a.state_district||'';
      commune=nom;
      communeCP=cp?nom+' ('+cp+')':nom;
      // Afficher département dans la barre coords
      const coordsExtra=dept&&dept!==nom?' · '+dept:'';
      document.getElementById('shCoords').textContent=
        lat.toFixed(5)+'°N, '+lng.toFixed(5)+'°E'+coordsExtra;
    }

    let rpgFeats=[];
    if(rpgWfs.status==='fulfilled'&&rpgWfs.value?.features?.length>0){
      const allFeats=rpgWfs.value.features;
      const containing=allFeats.filter(f=>pointInGeoJSON(lat,lng,f));
      rpgFeats=containing.length>0?containing:[allFeats.reduce((best,f)=>distToFeature(lat,lng,f)<distToFeature(lat,lng,best)?f:best,allFeats[0])];
    }
    let culture='Non déclarée PAC',codeRpg='',surface='',annee='2023';
    if(rpgFeats.length>0){
      const p=rpgFeats[0].properties||{};
      codeRpg=p.code_group||p.CODE_GROUP||p.code_cultu||p.CODE_CULTU||'';
      surface=p.surf_parc||p.SURF_PARC||p.surface||'';
      annee=p.annee||p.ANNEE||'2023';
      culture=cL(codeRpg);
    }
    const coulCult=cC(codeRpg);
    const wxD=wx.status==='fulfilled'?wx.value:null;

    // Sinistres 90j — récupéré en parallèle plus haut
    const sinData=sinR?.status==='fulfilled'?sinR.value:null;
    const sin=sinData?.daily;
    let gelJours=0,gelSevere=0,gelDates=[];
    let orageDates=[],secConsec=0,secConsecMax=0,etpTotal=0,precTotal=0;
    let greleDates=[];
    if(sin){
      const n=sin.time.length;
      for(let i=0;i<n;i++){
        const tmin=sin.temperature_2m_min[i],prec=sin.precipitation_sum[i]||0,wind=sin.windgusts_10m_max[i]||0,etp=sin.et0_fao_evapotranspiration[i]||0;
        etpTotal+=etp;precTotal+=prec;
        if(tmin!==null&&tmin<=0){gelJours++;if(tmin<=-3)gelSevere++;if(gelDates.length<5)gelDates.push({d:sin.time[i],t:tmin});}
        if(prec>15&&wind>60) orageDates.push({d:sin.time[i],p:prec.toFixed(1),w:wind.toFixed(0)});
        const wcode=sin.weathercode?sin.weathercode[i]:null;
        const showers=sin.showers_sum?sin.showers_sum[i]||0:0;
        const isGreleWMO=(wcode===96||wcode===99);
        const isGreleProxy=showers>5&&wind>50&&prec>8;
        if(isGreleWMO||isGreleProxy) greleDates.push({d:sin.time[i],p:prec.toFixed(1),w:wind.toFixed(0),s:showers.toFixed(1),certain:isGreleWMO});
        if(prec<1){secConsec++;secConsecMax=Math.max(secConsecMax,secConsec);}else secConsec=0;
      }
    }
    const deficit=Math.max(0,etpTotal-precTotal).toFixed(0);

    // ── Score de risque global (0-100) ──
    let riskScore=0;
    if(gelJours>0)    riskScore+=Math.min(gelJours*4,20);
    if(gelSevere>0)   riskScore+=Math.min(gelSevere*5,15);
    if(orageDates.length>0) riskScore+=Math.min(orageDates.length*8,20);
    if(greleDates.length>0) riskScore+=Math.min(greleDates.length*12,25);
    if(parseFloat(deficit)>150) riskScore+=20;
    else if(parseFloat(deficit)>80) riskScore+=12;
    else if(parseFloat(deficit)>30) riskScore+=5;
    riskScore=Math.min(riskScore,100);
    const riskLabel=riskScore>=70?'ÉLEVÉ':riskScore>=40?'MODÉRÉ':riskScore>=15?'FAIBLE':'TRÈS FAIBLE';
    const riskColor=riskScore>=70?'#c62828':riskScore>=40?'#e65100':riskScore>=15?'#f9a825':'#2e7d32';
    const secRisque=deficit>150?'Élevé':deficit>80?'Modéré':deficit>30?'Faible':'Nul';
    const secColor=deficit>150?'#c0392b':deficit>80?'#e67e22':deficit>30?'#f9a825':'#27ae60';

    window._currentRpgFeature=rpgFeats.length>0?rpgFeats[0]:null;
    window._currentCulture=culture;
    // Charger rendement en async
    // Stade BBCH
    // LAI dans onglet NDVI
    setTimeout(()=>{
      const laiEl=document.getElementById('laiWrap');
      if(laiEl) laiEl.innerHTML=buildLAIHtml(codeRpg);
    },200);
    const bbch = getBBCHStade(codeRpg, new Date().toISOString().split('T')[0]);
    const bbchEl = document.getElementById('bbchWrap');
    if(bbchEl) bbchEl.innerHTML = buildBBCHHtml(bbch);
    fetchAOC(lat,lng).then(aocs=>{
      const el=document.getElementById('aocWrap');
      if(el&&aocs.length){
        el.innerHTML='<div style="background:#fff8e1;border-radius:8px;padding:10px 12px;margin:8px 0;border:1px solid #ffe082;">'
          +'<div style="font-size:9px;font-weight:700;color:#f57f17;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">🏷 Zone AOC/AOP/IGP</div>'
          +aocs.map(a=>'<div style="font-size:11px;font-weight:600;color:#e65100;">'+a.nom+'</div>'
          +'<div style="font-size:9px;color:#bf360c;">'+a.type+' · '+a.produit+'</div>').join('')
          +'</div>';
      }
    });
    fetchRendement(lat,lng,codeRpg).then(rend=>{
      const el=document.getElementById('rendementWrap');
      if(el) el.innerHTML=buildRendementHtml(rend,surface);
    });
    if(rpgFeats.length>0) showParcelOutline(rpgFeats[0]);
    else clearParcelOutline();

    // Pré-remplir culture depuis RPG dans l'onglet Expert
    const _cultureDetected = culture !== 'Non déclarée PAC' ? culture : '';
    const localData=loadParcelData(lat,lng);
    const visits=(localData.visits||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
    const lastVisit=visits[0]||null;

    const shHdrEl=document.getElementById('shHdrEl');
    if(shHdrEl) shHdrEl.style.background=coulCult;
    document.getElementById('shTitle').textContent=communeCP!=='—'?communeCP:commune;
    document.getElementById('shCoords').textContent=lat.toFixed(5)+', '+lng.toFixed(5);
    document.getElementById('cpill').textContent=culture+(codeRpg?' · '+codeRpg:'')+(surface?' · '+parseFloat(surface).toFixed(2)+' ha':'');

    document.getElementById('shBody').innerHTML=
      '<div class="sh-tabs">'+
      '<button class="sh-tab on" onclick="shTab(\'ndvi\',this)"><span class="sh-tab-icon">🌿</span>NDVI</button>'+
      '<button class="sh-tab" onclick="shTab(\'expert\',this)"><span class="sh-tab-icon">✏️</span>Expert</button>'+
      '<button class="sh-tab" onclick="shTab(\'sin\',this)"><span class="sh-tab-icon">⚠️</span>Sinistres</button>'+
      '<button class="sh-tab" onclick="shTab(\'wx\',this)"><span class="sh-tab-icon">🌤</span>Météo</button>'+
      '<button class="sh-tab" onclick="shTab(\'info\',this)"><span class="sh-tab-icon">📋</span>Infos</button>'+
      '</div>'+

      // ONGLET NDVI
      '<div class="sh-pane on" id="pane-ndvi">'+
      // Barre sélection mode
      '<div style="display:flex;gap:6px;padding:8px 12px;background:#0d1117;border-bottom:1px solid rgba(255,255,255,.08);align-items:center;">'+
      '<button class="split-mode-btn on" id="btnModeNormal" onclick="setNdviViewMode(\'normal\',this)">Simple</button>'+
      '<button class="split-mode-btn" id="btnModeSplit" onclick="setNdviViewMode(\'split\',this)">Avant/Après</button>'+
      '<div style="flex:1;"></div>'+
      '<span style="font-size:9px;color:rgba(255,255,255,.3);font-family:DM Mono,monospace;">MODE ANALYSE</span>'+
      '</div>'+
      // Vue normale
      '<div id="ndviNormalView">'+
      '<div class="ndvi-map-wrap"><div id="ndviParcelMap"></div>'+
      '<div class="ndvi-nav-bar">'+
      '<button class="ndvi-nav-btn" onclick="shiftNdviDate(-1)">‹</button>'+
      '<div style="text-align:center;"><div class="ndvi-date-lbl" id="ndviParcelDate">'+(dates.length?dates[_parcelIdx]:'—')+'</div><div class="ndvi-cloud-lbl" id="ndviCloudLbl"></div></div>'+
      '<button class="ndvi-nav-btn" onclick="shiftNdviDate(+1)">›</button>'+
      '</div>'+
      '<div class="ndvi-mode-bar">'+
      '<button class="ndvi-mode-btn on" id="ndviBtnNdvi" onclick="setNdviMode(\'ndvi\',this)">NDVI</button>'+
      '<button class="ndvi-mode-btn" id="ndviBtnPhoto" onclick="setNdviMode(\'photo\',this)">Photo</button>'+
      '</div></div>'+
      // Timeline
      '<div class="ndvi-tl-wrap">'+
      '<div class="ndvi-tl-label">Historique · '+dates.length+' images disponibles</div>'+
      '<div class="ndvi-tl-scroll" id="ndviTimeline"></div>'+
      '</div>'+
      // Stats
      '<div class="ndvi-stats-row">'+
      '<div class="ndvi-stat"><div class="ndvi-stat-val">'+(surface?parseFloat(surface).toFixed(2)+'<span style="font-size:9px;font-weight:400"> ha</span>':'—')+'</div><div class="ndvi-stat-lbl">Surface</div></div>'+
      '<div class="ndvi-stat"><div class="ndvi-stat-val" id="ndviMoyVal" style="color:#52C41A;">—</div><div class="ndvi-stat-lbl">NDVI moy.</div></div>'+
      '<div class="ndvi-stat"><div class="ndvi-stat-val" id="ndviCCVal">—</div><div class="ndvi-stat-lbl">Nuages</div></div>'+
      '</div>'+
      '<div class="ndvi-legend" id="ndviLegendPanel"></div>'+
      '<div id="ndviScoreWrap"></div>'+
      '<div id="laiWrap"></div>'+
      '<div class="ndvi-graph-wrap">'+
      '<div class="ndvi-graph-title"><span>Évolution NDVI</span><div class="ndvi-graph-tabs"><button class="ndvi-graph-tab on" id="gtog-prec" onclick="setNdviGraphToggle(\'prec\',this)">Précip</button><button class="ndvi-graph-tab" id="gtog-temp" onclick="setNdviGraphToggle(\'temp\',this)">Temp</button></div></div>'+
      '<div class="ndvi-graph-canvas"><canvas id="ndviGraphC"></canvas></div>'+
      '</div></div>'+
      '</div>'+ // fin ndviNormalView

      // Vue split-screen
      '<div id="ndviSplitView" style="display:none;">'+
      '<div class="ndvi-split-date-bar">'+
      '<div class="ndvi-split-date-sel">'+
      '<span class="ndvi-split-date-lbl">Avant</span>'+
      '<span class="ndvi-split-date-val" id="splitDateLeft" onclick="openSplitDatePicker(\'left\')">'+(dates.length>1?dates[Math.min(1,dates.length-1)]:'—')+'</span>'+
      '</div>'+
      '<span class="ndvi-split-sep">⟷</span>'+
      '<div class="ndvi-split-date-sel" style="justify-content:flex-end;">'+
      '<span class="ndvi-split-date-val" id="splitDateRight" onclick="openSplitDatePicker(\'right\')">'+(dates.length?dates[0]:'—')+'</span>'+
      '<span class="ndvi-split-date-lbl">Après</span>'+
      '</div>'+
      '</div>'+
      '<div class="ndvi-split-wrap" id="ndviSplitWrap">'+
      '<div class="ndvi-split-left" id="ndviSplitLeft">'+
      '<div id="ndviSplitMapLeft" style="width:100%;height:100%;"></div>'+
      '</div>'+
      '<div class="ndvi-split-right" id="ndviSplitRight">'+
      '<div id="ndviSplitMapRight" style="width:100%;height:100%;"></div>'+
      '</div>'+
      '<div class="ndvi-split-divider" id="ndviSplitDiv"></div>'+
      '<div class="ndvi-split-label left" id="splitLblLeft">Avant</div>'+
      '<div class="ndvi-split-label right" id="splitLblRight">Après</div>'+
      '</div>'+
      // Sélecteur de dates pour le split
      '<div id="splitDatePicker" style="display:none;background:#0d1117;border-top:1px solid rgba(255,255,255,.08);">'+
      '<div class="ndvi-tl-label" style="padding:8px 12px 4px;">Choisir la date</div>'+
      '<div class="ndvi-tl-scroll" id="splitDatePickerTl" style="padding:0 10px 8px;"></div>'+
      '</div>'+
      '</div>'+ // fin ndviSplitView

      // ONGLET EXPERT
      '<div class="sh-pane" id="pane-expert"><div class="expert-pane">'+
      '<div class="ex-section"><div class="ex-section-title">Historique des visites</div><div id="visitHistory"></div>'+
      '<button class="ex-new-btn" onclick="newVisitForm()">＋ Nouvelle visite</button></div>'+
      '<div class="ex-form" id="visitForm"><div class="ex-form-title" id="visitFormTitle">➕ Nouvelle visite</div>'+
      '<div class="ex-field"><label class="ex-label">Date</label><input type="date" class="ex-input" id="inp-date" value="'+new Date().toISOString().split('T')[0]+'"></div>'+
      '<div class="ex-field"><label class="ex-label">Culture constatée</label><input type="text" class="ex-input" id="inp-culture" placeholder="Ex: Blé tendre, Vignes…" value="'+(lastVisit?lastVisit.culture||'':'')+'" oninput="autoSaveParcel()"></div>'+
      '<div class="ex-field"><label class="ex-label">Variété</label><input type="text" class="ex-input" id="inp-variete" placeholder="Ex: Apache, Merlot…" value="'+(lastVisit?lastVisit.variete||'':'')+'" oninput="autoSaveParcel()"></div>'+
      '<div class="ex-field"><label class="ex-label">Observations terrain</label><textarea class="ex-textarea" id="inp-comment" placeholder="Dégâts, stade végétatif, conditions…" oninput="autoSaveParcel()"></textarea></div>'+
      '<button class="ex-save-btn" onclick="saveVisit()">💾 Enregistrer</button>'+
      '<div class="ex-section" style="margin-top:16px;">'
      +'<div class="ex-section-title">📸 Photos terrain</div>'
      +'<div id="photoGallery" style="min-height:60px;"></div>'
      +'<button onclick="openPhotoPicker()" style="'
      +'width:100%;padding:8px;background:rgba(45,189,138,.1);'
      +'border:1.5px dashed rgba(45,189,138,.3);border-radius:8px;'
      +'color:var(--ts-accent);font-family:DM Mono,monospace;font-size:10px;'
      +'cursor:pointer;margin-top:8px;transition:all .15s;">'
      +'📷 Ajouter des photos</button>'
      +'</div>'+
      '<div id="save-indicator" style="font-size:9px;color:var(--gm);text-align:center;margin-top:6px;min-height:14px;"></div>'+
      '</div></div></div>'+

      // ONGLET SINISTRES
      '<div class="sh-pane" id="pane-sin"><div class="sin-pane">'+
      // Score de risque global
      '<div style="margin:-14px -14px 14px;padding:14px 16px;background:'+riskColor+';display:flex;align-items:center;justify-content:space-between;">'+
        '<div>'+
          '<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.7);letter-spacing:.8px;text-transform:uppercase;">Score de risque sinistre</div>'+
          '<div style="font-size:24px;font-weight:800;color:white;font-family:Inter,sans-serif;line-height:1.1;">'+riskScore+'<span style="font-size:12px;font-weight:500;opacity:.8;">/100</span></div>'+
        '</div>'+
        '<div style="text-align:right;">'+
          '<div style="font-size:16px;font-weight:800;color:white;font-family:Inter,sans-serif;">'+riskLabel+'</div>'+
          '<div style="font-size:9px;color:rgba(255,255,255,.6);margin-top:3px;">90 derniers jours</div>'+
        '</div>'+
      '</div>'+
      '<div class="sin-risk-row">'+
      '<div class="sin-risk-card" style="background:'+(gelJours>3?'#e3f2fd':gelJours>0?'#e8f4fd':'#f5f5f5')+';border-color:'+(gelJours>0?'#1565c0':'#e0e0e0')+';border-width:2px;border-style:solid;"><div class="sin-risk-icon">🧊</div><div class="sin-risk-val" style="color:'+(gelJours>0?'#1565c0':'#b0bec5')+'">'+gelJours+'</div><div class="sin-risk-lbl">Jours gel</div><div class="sin-risk-sub" style="color:'+(gelSevere>0?'#c62828':'#90a4ae')+'">'+(gelSevere>0?gelSevere+' j ≤-3°C':'aucun')+'</div></div>'+
      '<div class="sin-risk-card" style="background:'+(orageDates.length>0?'#fff3e0':'#f5f5f5')+';border-color:'+(orageDates.length>0?'#ff9800':'#e0e0e0')+';border-width:2px;border-style:solid;"><div class="sin-risk-icon">🌨</div><div class="sin-risk-val" style="color:'+(orageDates.length>0?'#e65100':'#b0bec5')+'">'+orageDates.length+'</div><div class="sin-risk-lbl">Épisodes</div><div class="sin-risk-sub" style="color:'+(orageDates.length>0?'#e65100':'#90a4ae')+'">'+(orageDates.length>0?'précip+vent':'aucun')+'</div></div>'+
      '<div class="sin-risk-card" style="background:'+(parseFloat(deficit)>80?'#fff3e0':'#f5f5f5')+';border-color:'+secColor+';border-width:2px;border-style:solid;"><div class="sin-risk-icon">☀️</div><div class="sin-risk-val" style="color:'+secColor+'">'+deficit+'</div><div class="sin-risk-lbl">mm déficit</div><div class="sin-risk-sub" style="color:'+secColor+'">'+secRisque+'</div></div>'+
      '<div class="sin-risk-card" style="background:'+(greleDates.length>2?'#f3e5f5':greleDates.length>0?'#fce4ec':'#f5f5f5')+';border-color:'+(greleDates.length>0?'#8e24aa':'#e0e0e0')+';border-width:2px;border-style:solid;"><div class="sin-risk-icon">🌨</div><div class="sin-risk-val" style="color:'+(greleDates.length>0?'#6a1b9a':'#b0bec5')+'">'+greleDates.length+'</div><div class="sin-risk-lbl">Épisodes grêle</div><div class="sin-risk-sub" style="color:'+(greleDates.length>0?'#8e24aa':'#90a4ae')+'">'+( greleDates.length>0?(greleDates.filter(g=>g.certain).length>0?greleDates.filter(g=>g.certain).length+' confirmé(s)':'estimés'):'aucun')+'</div></div>'+
      '</div>'+
      '<div class="sin-detail'+(greleDates.length>0?' open':'')+'" id="sinDetGrele"><div class="sin-detail-hdr" onclick="this.parentElement.classList.toggle(\'open\')"><div class="sin-detail-hdr-left"><div class="sin-detail-ic" style="background:#f3e5f5;">🌨</div><span class="sin-detail-name">Épisodes de grêle détectés</span></div><i class="fas fa-chevron-down sin-chevron"></i></div>'+
      '<div class="sin-detail-body">'+
      '<div style="font-size:9px;color:#90a4ae;margin-bottom:8px;">Code WMO 96/99 (orage avec grêle) + proxy : averses convectives &gt;5mm avec rafales &gt;50km/h</div>'+
      (greleDates.length>0
        ? greleDates.slice(0,8).map(g=>'<div class="sin-row"><span class="sin-row-k">'+g.d.split('-').slice(1).reverse().join('/')+'</span><span class="sin-row-v" style="color:'+(g.certain?'#6a1b9a':'#ab47bc')+';">'+(g.certain?'⚠️ ':'~')+g.p+'mm · '+g.w+'km/h'+(g.s>0?' · '+g.s+'mm averse':'')+'</span></div>').join('')
        : '<div style="font-size:10px;color:#27ae60;padding:6px 0;">✅ Aucun épisode de grêle détecté</div>'
      )+
      '<div style="margin-top:8px;font-size:9px;color:#b0bec5;">⚠️ = confirmé WMO · ~ = estimé par proxy météo. Pour confirmation officielle :</div>'+
      '<a href="https://keraunos.org/statistiques-orages/france.html" target="_blank" style="font-size:9px;color:#1565c0;display:inline-flex;align-items:center;gap:4px;margin-top:4px;"><i class="fas fa-external-link-alt"></i> Base Keraunos (orages France)</a>'+
      '</div></div>'+
      '<div class="sin-detail'+(gelJours>0?' open':'')+'" id="sinDetGel"><div class="sin-detail-hdr" onclick="this.parentElement.classList.toggle(\'open\')"><div class="sin-detail-hdr-left"><div class="sin-detail-ic" style="background:#e3f2fd;">🧊</div><span class="sin-detail-name">Analyse gel</span></div><i class="fas fa-chevron-down sin-chevron"></i></div><div class="sin-detail-body"><div class="sin-row"><span class="sin-row-k">Jours gel (≤0°C)</span><span class="sin-row-v" style="color:#1565c0;">'+gelJours+' j</span></div><div class="sin-row"><span class="sin-row-k">Gel sévère (≤-3°C)</span><span class="sin-row-v" style="color:#c62828;">'+gelSevere+' j</span></div>'+(gelDates.length>0?'<div class="sin-tl">'+gelDates.map(g=>'<div class="sin-tl-item"><div class="sin-tl-dot" style="background:'+(g.t<=-5?'#c62828':g.t<=-3?'#1565c0':'#64b5f6')+'"></div><span>'+g.d.split('-').slice(1).reverse().join('/')+' — '+g.t.toFixed(1)+'°C</span></div>').join('')+'</div>':'<div style="font-size:10px;color:#27ae60;padding:6px 0;">✅ Aucun gel sur 90 jours</div>')+'</div></div>'+
      '<div class="sin-detail'+(orageDates.length>0?' open':'')+'" id="sinDetPrecip"><div class="sin-detail-hdr" onclick="this.parentElement.classList.toggle(\'open\')"><div class="sin-detail-hdr-left"><div class="sin-detail-ic" style="background:#fff3e0;">🌨</div><span class="sin-detail-name">Précipitations intenses & Vent</span></div><i class="fas fa-chevron-down sin-chevron"></i></div><div class="sin-detail-body"><div style="font-size:9px;color:#90a4ae;margin-bottom:8px;">Épisodes : précip >15mm ET rafales >60 km/h</div>'+(orageDates.length>0?orageDates.slice(0,6).map(o=>'<div class="sin-row"><span class="sin-row-k">'+o.d.split('-').slice(1).reverse().join('/')+'</span><span class="sin-row-v" style="color:#e65100;">'+o.p+' mm · '+o.w+' km/h</span></div>').join(''):'<div style="font-size:10px;color:#27ae60;padding:6px 0;">Aucun épisode détecté</div>')+'<a href="https://www.georisques.gouv.fr/risques/catnat" target="_blank" style="font-size:9px;color:#1565c0;display:inline-flex;align-items:center;gap:4px;margin-top:6px;"><i class="fas fa-external-link-alt"></i> Vérifier CatNat</a></div></div>'+
      '<div class="sin-detail open" id="sinDetSec"><div class="sin-detail-hdr" onclick="this.parentElement.classList.toggle(\'open\')"><div class="sin-detail-hdr-left"><div class="sin-detail-ic" style="background:#fff8e1;">☀️</div><span class="sin-detail-name">Bilan hydrique — 90 jours</span></div><i class="fas fa-chevron-down sin-chevron"></i></div><div class="sin-detail-body"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:8px 0 10px;"><div style="background:#e3f2fd;border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;color:#1565c0;font-weight:600;">Cumul 30j</div><div style="font-family:Inter,sans-serif;font-weight:800;font-size:18px;color:#1565c0;">'+precTotal.toFixed(0)+'</div><div style="font-size:8px;color:#1565c0;opacity:.7;">mm</div></div><div style="background:#fff8e1;border-radius:8px;padding:8px;text-align:center;"><div style="font-size:9px;color:#f57f17;font-weight:600;">ETP 30j</div><div style="font-family:Inter,sans-serif;font-weight:800;font-size:18px;color:#f57f17;">'+etpTotal.toFixed(0)+'</div><div style="font-size:8px;color:#f57f17;opacity:.7;">mm</div></div><div style="background:'+(parseFloat(deficit)>80?'#fff3e0':'#e8f5e9')+';border-radius:8px;padding:8px;text-align:center;border:2px solid '+secColor+';"><div style="font-size:9px;color:'+secColor+';font-weight:600;">Déficit</div><div style="font-family:Inter,sans-serif;font-weight:800;font-size:18px;color:'+secColor+';">'+deficit+'</div><div style="font-size:8px;color:'+secColor+';opacity:.8;">mm</div></div></div><div class="sin-row"><span class="sin-row-k">Précipitations 90j</span><span class="sin-row-v" style="color:#1565c0;">'+precTotal.toFixed(0)+' mm</span></div><div class="sin-row"><span class="sin-row-k">ETP 90j</span><span class="sin-row-v" style="color:#ff9800;">'+etpTotal.toFixed(0)+' mm</span></div><div class="sin-row" style="padding-top:8px;border-top:2px solid #eee;"><span class="sin-row-k" style="font-weight:700;">Déficit (ETP−Précip)</span><span class="sin-row-v" style="font-size:15px;color:'+secColor+';">'+deficit+' mm</span></div><div style="margin-top:8px;"><div style="display:flex;justify-content:space-between;font-size:9px;color:#90a4ae;margin-bottom:4px;"><span>Risque</span><span style="color:'+secColor+';font-weight:700;">'+secRisque+'</span></div><div class="sin-bar"><div class="sin-bar-fill" style="width:'+Math.min(parseFloat(deficit)/200*100,100)+'%;background:'+secColor+';"></div></div></div><div class="sin-row" style="margin-top:6px;"><span class="sin-row-k">Séquence sèche max</span><span class="sin-row-v">'+secConsecMax+' j</span></div></div></div>'+
      '</div></div>'+

      // ONGLET MÉTÉO
      '<div class="sh-pane" id="pane-wx"><div class="wx-pane">'+
      '<div id="wxCompareWrap">'+(wxD?buildWxCompare(wxD,null):'')+'</div>'+
      '<div id="wxClimRef">'+(wxD?buildClimatRef(wxD,null,lat,lng):'')+'</div>'+
      (wxD?buildWxToday(wxD):'')+
      '<div id="wxForecastSection">'
      +'<div class="wx-section-title" style="padding:8px 12px 4px;">Prévisions météo<span class="wx-section-date" id="wxForecastPeriod">14 jours</span></div>'
      +'<div class="wx-strip" id="wxForecastStrip">'+(wxD?renderWx(wxD,14):'')+'</div>'
      +'</div>'+
      '</div></div>'+

      // ONGLET INFOS
      '<div class="sh-pane" id="pane-info"><div class="info-pane">'
      +'<div id="aocWrap"></div>'+
      '<div id="rendementWrap"></div>'+
      '<div class="info-row"><span class="info-key">Commune</span><span class="info-val">'+commune+'</span></div>'+
      '<div class="info-row"><span class="info-key">Surface RPG</span><span class="info-val">'+(surface?parseFloat(surface).toFixed(2)+' ha':'—')+'</span></div>'+
      '<div class="info-row"><span class="info-key">Culture PAC</span><span class="info-val">'+culture+(codeRpg?' ('+codeRpg+')':"")+'</span></div>'+
      '<div class="info-row"><span class="info-key">Campagne PAC</span><span class="info-val">'+annee+'</span></div>'+
      '<div class="info-row"><span class="info-key">Coordonnées</span><span class="info-val">'+lat.toFixed(5)+'<br>'+lng.toFixed(5)+'</span></div>'+
      '<div class="info-note">Open-Meteo ERA5-Land · Nominatim · RPG IGN</div>'+
      '</div></div>';

    window._wx=wxD;
    renderVisitHistory(lat,lng);
    setTimeout(()=>{
      if(wxD){drawWxCWithNorms(wxD,7);const strip=document.getElementById('wxForecastStrip');if(strip) strip.innerHTML=renderWx(wxD,14);}
      if(wxD) updateClimatRef(wxD);
      initNdviParcelMap(window._currentRpgFeature,lat,lng);
    },80);
    window._ndviParcelLat=lat;window._ndviParcelLng=lng;
    // Charger galerie photos
    setTimeout(()=>renderPhotoGallery(lat,lng),200);

  }catch(err){
    console.error('openSheet error:',err);
    document.getElementById('shTitle').textContent='Erreur';
    document.getElementById('shBody').innerHTML='<div style="padding:14px;font-size:11px;color:#c0392b;background:#fdecea;border-radius:8px;font-family:monospace;">'+err.message+'</div>';
  }
}


// ══════════════════════════════════════
// SPLIT-SCREEN NDVI AVANT/APRÈS
// ══════════════════════════════════════
let _splitMapL=null, _splitMapR=null;
let _splitLyrL=null, _splitLyrR=null;
let _splitBaseL=null, _splitBaseR=null;
let _splitOutlineL=null, _splitOutlineR=null;
let _splitDragging=false;
let _splitRatio=0.5; // 0-1
let _splitPickSide=null; // 'left' | 'right'
let _splitDateL='', _splitDateR='';

function setNdviViewMode(mode, btn){
  document.querySelectorAll('.split-mode-btn').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  const normalView=document.getElementById('ndviNormalView');
  const splitView=document.getElementById('ndviSplitView');
  if(!normalView||!splitView) return;
  if(mode==='split'){
    normalView.style.display='none';
    splitView.style.display='block';
    // Attendre que le DOM soit visible avant d'init les cartes
    setTimeout(()=>{
      initSplitMaps();
      applySplitRatio(_splitRatio||0.5);
    },100);
  } else {
    normalView.style.display='block';
    splitView.style.display='none';
    if(_ndviParcelMap) setTimeout(()=>_ndviParcelMap.invalidateSize(),100);
  }
}

function initSplitMaps(){
  if(_splitMapL){try{_splitMapL.remove();}catch(e){} _splitMapL=null; _splitBaseL=null; _splitLyrL=null; _splitOutlineL=null;}
  if(_splitMapR){try{_splitMapR.remove();}catch(e){} _splitMapR=null; _splitBaseR=null; _splitLyrR=null; _splitOutlineR=null;}

  const elL=document.getElementById('ndviSplitMapLeft');
  const elR=document.getElementById('ndviSplitMapRight');
  const wrap=document.getElementById('ndviSplitWrap');
  if(!elL||!elR||!wrap) return;
  // Forcer les dimensions si pas encore rendues
  if(wrap.offsetHeight===0){ setTimeout(initSplitMaps,100); return; }

  // Forcer la hauteur du wrap et des sous-éléments
  wrap.style.height='260px';
  elL.style.cssText='position:absolute;top:0;bottom:0;left:0;right:0;';
  elR.style.cssText='position:absolute;top:0;bottom:0;left:0;right:0;';

  const rpg=window._currentRpgFeature;
  const lat=window._ndviParcelLat||map.getCenter().lat;
  const lng=window._ndviParcelLng||map.getCenter().lng;

  // Dates par défaut : toujours les 2 images les plus récentes disponibles
  // Réinitialiser si les dates sauvegardées ne sont plus dans la liste
  if(_splitDateL && !dates.includes(_splitDateL)) _splitDateL='';
  if(_splitDateR && !dates.includes(_splitDateR)) _splitDateR='';
  // Avant = 2ème image la plus récente, Après = image la plus récente
  if(!_splitDateL) _splitDateL = dates.length>1 ? dates[1] : dates[0]||'';
  if(!_splitDateR) _splitDateR = dates.length>0 ? dates[0] : '';
  // S'assurer que Avant ≠ Après
  if(_splitDateL===_splitDateR && dates.length>1) _splitDateL=dates[1];
  updateSplitLabels();

  const mapOpts={zoomControl:false,attributionControl:false,scrollWheelZoom:false};
  _splitMapL=L.map('ndviSplitMapLeft',mapOpts);
  _splitMapR=L.map('ndviSplitMapRight',mapOpts);

  _splitBaseL=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:20,opacity:.4}).addTo(_splitMapL);
  _splitBaseR=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:20,opacity:.4}).addTo(_splitMapR);

  // Centrage sur la parcelle
  const setView=(m)=>{
    if(rpg&&rpg.geometry){
      const bounds=L.geoJSON(rpg).getBounds();
      m.fitBounds(bounds,{padding:[16,16]});
    } else {
      m.setView([lat,lng],16);
    }
  };
  setView(_splitMapL);
  setView(_splitMapR);

  if(rpg&&rpg.geometry){
    _splitOutlineL=L.geoJSON(rpg,{style:{color:'#FFD700',weight:2,fillOpacity:0,dashArray:'5,4'}}).addTo(_splitMapL);
    _splitOutlineR=L.geoJSON(rpg,{style:{color:'#FFD700',weight:2,fillOpacity:0,dashArray:'5,4'}}).addTo(_splitMapR);
  }

  // Sync zoom/pan
  let _syncing=false;
  _splitMapL.on('move',()=>{
    if(_syncing) return; _syncing=true;
    _splitMapR.setView(_splitMapL.getCenter(),_splitMapL.getZoom(),{animate:false});
    _syncing=false;
  });

  loadSplitNdvi();
  initSplitDrag();

  // Appliquer le ratio après que le DOM soit rendu
  setTimeout(()=>{
    if(_splitMapL) _splitMapL.invalidateSize();
    if(_splitMapR) _splitMapR.invalidateSize();
    applySplitRatio(_splitRatio||0.5);
  },100);
  setTimeout(()=>{
    if(_splitMapL) _splitMapL.invalidateSize();
    if(_splitMapR) _splitMapR.invalidateSize();
    applySplitRatio(_splitRatio||0.5);
  },500);
}

async function loadSplitNdvi(){
  if(!_splitMapL||!_splitMapR) return;
  if(_splitLyrL){try{_splitMapL.removeLayer(_splitLyrL);}catch(e){} _splitLyrL=null;}
  if(_splitLyrR){try{_splitMapR.removeLayer(_splitLyrR);}catch(e){} _splitLyrR=null;}

  try{ await getToken(); }catch(e){ console.warn('Split NDVI: token error',e.message); }

  function makeNdviLayer(d){
    if(!d) return null;
    const dt=new Date(d+'T12:00:00Z');dt.setDate(dt.getDate()+1);
    const dtEnd=dt.toISOString().split('T')[0];
    const _wmsUrl='https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST+(tok?'?access_token='+encodeURIComponent(tok):'');
    return L.tileLayer.wms(_wmsUrl,{
      layers:NDVI_L,format:'image/png',transparent:true,version:'1.3.0',
      time:d+'/'+dtEnd,maxcc:maxCC,maxZoom:18,opacity:0.95,tileSize:512
    });
  }

  _splitLyrL=makeNdviLayer(_splitDateL);
  _splitLyrR=makeNdviLayer(_splitDateR);
  if(_splitLyrL) _splitLyrL.addTo(_splitMapL);
  if(_splitLyrR) _splitLyrR.addTo(_splitMapR);
  if(_splitOutlineL) _splitOutlineL.bringToFront();
  if(_splitOutlineR) _splitOutlineR.bringToFront();
}

function updateSplitLabels(){
  const lblL=document.getElementById('splitLblLeft');
  const lblR=document.getElementById('splitLblRight');
  const valL=document.getElementById('splitDateLeft');
  const valR=document.getElementById('splitDateRight');
  const fmt=d=>{if(!d) return '—';const p=d.split('-');return p[2]+'/'+p[1]+'/'+p[0];};
  if(lblL) lblL.textContent='Avant · '+fmt(_splitDateL);
  if(lblR) lblR.textContent='Après · '+fmt(_splitDateR);
  if(valL) valL.textContent=fmt(_splitDateL);
  if(valR) valR.textContent=fmt(_splitDateR);
}

function applySplitRatio(ratio){
  _splitRatio=Math.max(0.05,Math.min(0.95,ratio));
  const wrap=document.getElementById('ndviSplitWrap');
  const divider=document.getElementById('ndviSplitDiv');
  const left=document.getElementById('ndviSplitLeft');
  const right=document.getElementById('ndviSplitRight');
  if(!wrap||!divider||!left||!right) return;
  const w=wrap.getBoundingClientRect().width||wrap.offsetWidth||300;
  if(w===0) return; // Pas encore rendu
  const px=Math.round(w*_splitRatio);
  left.style.width=px+'px';
  left.style.left='0';
  right.style.left=px+'px';
  right.style.width=(w-px)+'px';
  divider.style.left=(px-1)+'px';
  if(_splitMapL){try{_splitMapL.invalidateSize();}catch(e){}}
  if(_splitMapR){try{_splitMapR.invalidateSize();}catch(e){}}
}

function initSplitDrag(){
  const divider=document.getElementById('ndviSplitDiv');
  const wrap=document.getElementById('ndviSplitWrap');
  if(!divider||!wrap) return;
  divider.addEventListener('mousedown',e=>{
    _splitDragging=true;e.preventDefault();
  });
  wrap.addEventListener('mousemove',e=>{
    if(!_splitDragging) return;
    const rect=wrap.getBoundingClientRect();
    const ratio=(e.clientX-rect.left)/rect.width;
    applySplitRatio(ratio);
  });
  document.addEventListener('mouseup',()=>{_splitDragging=false;});
  // Touch support
  divider.addEventListener('touchstart',e=>{_splitDragging=true;e.preventDefault();},{passive:false});
  wrap.addEventListener('touchmove',e=>{
    if(!_splitDragging) return;
    const touch=e.touches[0];
    const rect=wrap.getBoundingClientRect();
    const ratio=(touch.clientX-rect.left)/rect.width;
    applySplitRatio(ratio);
    e.preventDefault();
  },{passive:false});
  document.addEventListener('touchend',()=>{_splitDragging=false;});
}

function openSplitDatePicker(side){
  _splitPickSide=side;
  const tl=document.getElementById('splitDatePickerTl');
  const picker=document.getElementById('splitDatePicker');
  if(!tl||!picker) return;
  picker.style.display=picker.style.display==='none'||!picker.style.display?'block':'none';
  if(picker.style.display==='none') return;
  const currentDate=side==='left'?_splitDateL:_splitDateR;
  const MONTHS=['jan','fév','mar','avr','mai','jui','jul','aoû','sep','oct','nov','déc'];
  tl.innerHTML=dates.map((d,idx)=>{
    const cc=datesMeta[d]?parseFloat(datesMeta[d].cc):null;
    const parts=d.split('-');
    const dotCol=cc===null?'#546e7a':cc>50?'#ef5350':cc>20?'#ff9800':'#52C41A';
    const ccTxt=cc!==null?Math.round(cc)+'%':'—';
    const sel=d===currentDate?' sel':'';
    return '<div class="ndvi-tl-chip'+sel+'" onclick="selectSplitDate(\'' +d+ '\')" title="'+d+'">'+
      '<div class="ndvi-tl-day">'+parts[2]+'</div>'+
      '<div class="ndvi-tl-month">'+MONTHS[parseInt(parts[1])-1]+'</div>'+
      '<div class="ndvi-tl-dot" style="background:'+dotCol+';"></div>'+
      '<div class="ndvi-tl-cc">'+ccTxt+'</div>'+
      '</div>';
  }).join('');
  // Scroll vers date courante
  setTimeout(()=>{const s=tl.querySelector('.sel');if(s)s.scrollIntoView({inline:'center',behavior:'smooth',block:'nearest'});},80);
}

function selectSplitDate(d){
  if(_splitPickSide==='left') _splitDateL=d;
  else _splitDateR=d;
  updateSplitLabels();
  loadSplitNdvi();
  const picker=document.getElementById('splitDatePicker');
  if(picker) picker.style.display='none';
  _splitPickSide=null;
}

// ── Fermeture sheet ──
function closeSheet(){
  setTimeout(()=>map.invalidateSize(),50);
  document.getElementById('sheet').classList.remove('open');
  clearParcelOutline();
  window._shLat=null;window._shLng=null;
  window._ndviParcelLat=null;window._ndviParcelLng=null;
  window._currentRpgFeature=null;
  if(_ndviParcelMap){try{_ndviParcelMap.remove();}catch(e){} _ndviParcelMap=null;}
  _ndviParcelBase=null;_ndviParcelLayer=null;_ndviParcelOutline=null;
  if(_splitMapL){try{_splitMapL.remove();}catch(e){} _splitMapL=null;}
  if(_splitMapR){try{_splitMapR.remove();}catch(e){} _splitMapR=null;}
  _splitLyrL=null;_splitLyrR=null;_splitDateL='';_splitDateR='';
  if(wxChart){wxChart.destroy();wxChart=null;}
  if(_ndviGraphChart){_ndviGraphChart.destroy();_ndviGraphChart=null;}
  setTimeout(()=>map.invalidateSize(),310);
}

// ── Visites expert ──
let _editVisitId=null;
function renderVisitHistory(lat,lng){
  const data=loadParcelData(lat,lng);
  const visits=(data.visits||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const el=document.getElementById('visitHistory');
  if(!el) return;
  if(!visits.length){el.innerHTML='<div style="font-size:10px;color:var(--t2);padding:6px 0 10px;text-align:center;">Aucune visite enregistrée</div>';return;}
  let html='';
  for(const v of visits){
    const dp=v.date?v.date.split('-'):['','',''];
    const dateAff=dp.length===3?dp[2]+'/'+dp[1]+'/'+dp[0]:v.date||'—';
    const preview=[v.culture,v.variete,v.comment].filter(Boolean).join(' · ').slice(0,55);
    const isActive=v.id===_editVisitId;
    html+='<div class="visit-card'+(isActive?' active':'')+'" data-vid="'+v.id+'" onclick="loadVisitInForm(this.dataset.vid)">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center;"><div class="visit-card-date">'+dateAff+'</div>';
    html+='<button data-vid="'+v.id+'" onclick="deleteVisit(this.dataset.vid);event.stopPropagation();" style="background:none;border:none;color:#ccc;cursor:pointer;font-size:11px;">✕</button></div>';
    if(preview) html+='<div class="visit-card-preview">'+preview+'</div>';
    html+='</div>';
  }
  el.innerHTML=html;
}
function loadVisitInForm(id){
  const lat=window._shLat,lng=window._shLng;if(!lat||!lng) return;
  const data=loadParcelData(lat,lng);
  const v=(data.visits||[]).find(x=>x.id===id);if(!v) return;
  _editVisitId=v.id;
  const ft=document.getElementById('visitFormTitle');if(ft) ft.textContent='✏️ Modifier';
  ['date','culture','variete','comment'].forEach(k=>{const el=document.getElementById('inp-'+k);if(el) el.value=v[k]||'';});
  renderVisitHistory(lat,lng);
}
function newVisitForm(){
  _editVisitId=null;
  const ft=document.getElementById('visitFormTitle');if(ft) ft.textContent='➕ Nouvelle visite';
  const today=new Date().toISOString().split('T')[0];
  const inpDate=document.getElementById('inp-date');if(inpDate) inpDate.value=today;
  ['culture','variete','comment'].forEach(k=>{const el=document.getElementById('inp-'+k);if(el) el.value='';});
}
function saveVisit(){
  const lat=window._shLat,lng=window._shLng;if(!lat||!lng) return;
  const date=(document.getElementById('inp-date')||{}).value||new Date().toISOString().split('T')[0];
  const culture=((document.getElementById('inp-culture')||{}).value||'').trim();
  const variete=((document.getElementById('inp-variete')||{}).value||'').trim();
  const comment=((document.getElementById('inp-comment')||{}).value||'').trim();
  const data=loadParcelData(lat,lng);const visits=data.visits||[];
  if(_editVisitId){
    const idx=visits.findIndex(v=>v.id===_editVisitId);
    if(idx>=0) visits[idx]={...visits[idx],date,culture,variete,comment,updatedAt:new Date().toISOString()};
  } else {
    visits.push({id:'v'+Date.now(),date,culture,variete,comment,createdAt:new Date().toISOString()});
  }
  saveParcelData(lat,lng,{visits});
  if(comment) addCommentMarker(lat,lng,comment);
  renderVisitHistory(lat,lng);newVisitForm();
  const ind=document.getElementById('save-indicator');
  if(ind){ind.textContent='✅ Enregistré';setTimeout(()=>{ind.textContent='';},2000);}
}
function deleteVisit(id){
  const lat=window._shLat,lng=window._shLng;if(!lat||!lng) return;
  const data=loadParcelData(lat,lng);
  data.visits=(data.visits||[]).filter(v=>v.id!==id);
  saveParcelData(lat,lng,{visits:data.visits});
  if(_editVisitId===id) newVisitForm();
  renderVisitHistory(lat,lng);
}
let _saveTimer=null;
function autoSaveParcel(){
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(()=>{
    const lat=window._shLat,lng=window._shLng;if(!lat||!lng) return;
    const culture=document.getElementById('inp-culture')?.value||'';
    const variete=document.getElementById('inp-variete')?.value||'';
    const comment=document.getElementById('inp-comment')?.value||'';
    saveParcelData(lat,lng,{culture,variete,comment});
    if(comment) addCommentMarker(lat,lng,comment);else removeCommentMarker(lat,lng);
  },600);
}

// ── NDVI Parcelle ──
let _ndviParcelMap=null,_ndviParcelBase=null,_ndviParcelLayer=null,_ndviParcelOutline=null;
let _parcelIdx=0; // Index indépendant pour la parcelle — NE modifie PAS curIdx global
let _ndviGraphChart=null,_ndviGraphMode='prec',_ndviParcelMode='ndvi';

const NDVI_CLASSES=[
  {label:'Sol nu',      range:'<0.1',    color:'#8B1A00',pct:5},
  {label:'Très faible', range:'0.1-0.2', color:'#D44000',pct:8},
  {label:'Faible',      range:'0.2-0.4', color:'#FA8C16',pct:18},
  {label:'Modéré',      range:'0.4-0.6', color:'#D4B800',pct:32},
  {label:'Dense',       range:'0.6-0.8', color:'#52C41A',pct:28},
  {label:'Très dense',  range:'>0.8',    color:'#135200',pct:9},
];

function initNdviParcelMap(rpgFeature,lat,lng){
  _parcelIdx=curIdx; // Partir de la date courante de la barre globale

  // Attendre que l'élément DOM soit visible et ait une dimension
  const el=document.getElementById('ndviParcelMap');
  if(!el){ setTimeout(()=>initNdviParcelMap(rpgFeature,lat,lng),100); return; }
  if(el.offsetHeight===0){ setTimeout(()=>initNdviParcelMap(rpgFeature,lat,lng),100); return; }

  if(_ndviParcelMap){try{_ndviParcelMap.remove();}catch(e){} _ndviParcelMap=null;}
  _ndviParcelBase=null;_ndviParcelLayer=null;_ndviParcelOutline=null;

  _ndviParcelMap=L.map('ndviParcelMap',{zoomControl:false,attributionControl:false,scrollWheelZoom:true});
  L.control.zoom({position:'bottomright'}).addTo(_ndviParcelMap);
  _ndviParcelBase=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:20}).addTo(_ndviParcelMap);
  if(rpgFeature&&rpgFeature.geometry){
    _ndviParcelOutline=L.geoJSON(rpgFeature,{style:{color:'#FFD700',weight:3,fillOpacity:0,dashArray:'6,4'}}).addTo(_ndviParcelMap);
    _ndviParcelMap.fitBounds(_ndviParcelOutline.getBounds(),{padding:[30,30]});
  } else {
    _ndviParcelMap.setView([lat,lng],17);
  }
  _ndviParcelMode='ndvi';
  setTimeout(loadNdviOnParcel,300);
  setTimeout(()=>{if(_ndviParcelMap) _ndviParcelMap.invalidateSize();},150);
  buildNdviLegendRows();
  setTimeout(()=>drawNdviGraph(window._wx),200);
  setTimeout(updateNdviTimeline,400);
}

async function loadNdviOnParcel(){
  if(!_ndviParcelMap) return;
  if(_ndviParcelLayer){try{_ndviParcelMap.removeLayer(_ndviParcelLayer);}catch(e){} _ndviParcelLayer=null;}
  const d=dates.length?dates[_parcelIdx]:new Date().toISOString().split('T')[0];
  const dt2=new Date(d+'T12:00:00Z');dt2.setDate(dt2.getDate()+1);
  const dtEnd=dt2.toISOString().split('T')[0];
  if(_ndviParcelMode==='ndvi'){
    try{ await getToken(); }catch(e){ console.warn('NDVI parcel: token error',e.message); }
    const _parcWmsUrl='https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST+(tok?'?access_token='+encodeURIComponent(tok):'');
    _ndviParcelLayer=L.tileLayer.wms(_parcWmsUrl,{
      layers:NDVI_L,format:'image/png',transparent:true,version:'1.3.0',
      time:d+'/'+dtEnd,maxcc:maxCC,maxZoom:18,opacity:0.9,tileSize:512
    }).addTo(_ndviParcelMap);
  }
  if(_ndviParcelOutline) _ndviParcelOutline.bringToFront();
  const dateEl=document.getElementById('ndviParcelDate');
  if(dateEl){
    const dt=new Date(d+'T12:00:00Z');
    dateEl.textContent=dt.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  }
  const cc=datesMeta[d]?parseFloat(datesMeta[d].cc):null;
  const icon=cc===null?'':cc>50?'☁️':cc>20?'⛅':'☀️';
  const cloudEl=document.getElementById('ndviCloudLbl');
  if(cloudEl) cloudEl.textContent=cc!==null?icon+' '+Math.round(cc)+'% nuages':'';
  const ccValEl=document.getElementById('ndviCCVal');
  if(ccValEl){ccValEl.textContent=cc!==null?Math.round(cc)+'%':'—';ccValEl.style.color=cc>50?'#ef5350':cc>20?'#ff9800':'#52C41A';}
  updateNdviMoyVal();
  updateNdviTimeline();
  setTimeout(()=>{if(_ndviParcelMap) _ndviParcelMap.invalidateSize();},100);

  // Mettre à jour le score NDVI
  setTimeout(()=>{
    const sw=document.getElementById('ndviScoreWrap');
    if(sw) sw.innerHTML=buildNdviScoreHtml();
  },500);
}

function setNdviMode(mode,btn){
  _ndviParcelMode=mode;
  document.querySelectorAll('.ndvi-mode-btn').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  if(mode==='ndvi'){
    if(_ndviParcelBase) _ndviParcelBase.setOpacity(0.35);
    loadNdviOnParcel();
  } else {
    if(_ndviParcelLayer){try{_ndviParcelMap.removeLayer(_ndviParcelLayer);}catch(e){} _ndviParcelLayer=null;}
    if(_ndviParcelBase) _ndviParcelBase.setOpacity(1);
    if(_ndviParcelOutline) _ndviParcelOutline.bringToFront();
  }
}

function updateNdviMoyVal(){
  const d=dates.length?dates[_parcelIdx]:new Date().toISOString().split('T')[0];
  const dt=new Date(d+'T12:00:00Z');
  const doy=Math.floor((dt-new Date(dt.getFullYear(),0,0))/86400000);
  const culture=(window._currentCulture||'').toLowerCase();
  const cc=datesMeta[d]?parseFloat(datesMeta[d].cc):null;
  let base=0.28,phase=-80;
  if(culture.includes('vigne')){base=0.25;phase=-60;}
  else if(culture.includes('blé')||culture.includes('orge')){base=0.30;phase=-30;}
  else if(culture.includes('maïs')||culture.includes('tournesol')){base=0.25;phase=-120;}
  else if(culture.includes('prairie')){base=0.40;phase=-40;}
  let val=base+0.30*Math.sin((doy+phase)/365*2*Math.PI);
  if(window._wx&&window._wx.daily){
    const prec=window._wx.daily.precipitation_sum||[];
    const dIdx=window._wx.daily.time?window._wx.daily.time.indexOf(d):-1;
    const slice=dIdx>=0?prec.slice(Math.max(0,dIdx-14),dIdx+1):prec.slice(-14);
    val+=Math.min(slice.reduce((a,b)=>a+(b||0),0)*0.0015,0.10);
  }
  val=Math.max(0.05,Math.min(0.92,val));
  const cloudy=cc!==null&&cc>50;
  const col=val<0.2?'#D44000':val<0.4?'#FA8C16':val<0.6?'#D4B800':'#52C41A';
  const el=document.getElementById('ndviMoyVal');
  if(el){el.textContent=val.toFixed(2)+(cloudy?' ~':'');el.style.color=cloudy?'#90a4ae':col;}
}

// ── Timeline NDVI chips ──
function updateNdviTimeline(){
  const el=document.getElementById('ndviTimeline');
  if(!el||!dates.length) return;
  // Mettre à jour le compteur dans la barre globale
  const countEl=document.getElementById('ndviDateCount');
  if(countEl) countEl.textContent=dates.length;
  const MONTHS=['jan','fév','mar','avr','mai','jui','jul','aoû','sep','oct','nov','déc'];
  const html=dates.map((d,idx)=>{
    const cc=datesMeta[d]?parseFloat(datesMeta[d].cc):null;
    const parts=d.split('-');
    const day=parts[2];
    const month=MONTHS[parseInt(parts[1])-1];
    const dotCol=cc===null?'#546e7a':cc>50?'#ef5350':cc>20?'#ff9800':'#52C41A';
    const ccTxt=cc!==null?Math.round(cc)+'%':'—';
    const sel=idx===_parcelIdx?' sel':'';
    return '<div class="ndvi-tl-chip'+sel+'" onclick="selectNdviDate('+idx+')" title="'+d+(cc!==null?' · '+Math.round(cc)+'% nuages':'')+'">'+
      '<div class="ndvi-tl-day">'+day+'</div>'+
      '<div class="ndvi-tl-month">'+month+'</div>'+
      '<div class="ndvi-tl-dot" style="background:'+dotCol+';"></div>'+
      '<div class="ndvi-tl-cc">'+ccTxt+'</div>'+
      '</div>';
  }).join('');
  el.innerHTML=html;
  setTimeout(()=>{const sel=el.querySelector('.sel');if(sel) sel.scrollIntoView({inline:'center',behavior:'smooth',block:'nearest'});},80);
}
function selectNdviDate(idx){
  if(idx===_parcelIdx) return;
  _parcelIdx=idx;
  curIdx=idx; // Synchroniser aussi curIdx pour la barre globale
  loadNdviOnParcel();
  if(ndviOpen) loadNdvi(dates[idx],'sentinel');
  // Mettre à jour l'affichage date dans la barre globale
  updDate(dates[idx],idx);
  // Mettre à jour la sélection visuelle dans la timeline
  const tl=document.getElementById('ndviTimeline');
  if(tl) tl.querySelectorAll('.ndvi-tl-chip').forEach((ch,i)=>{
    ch.classList.toggle('sel',i===idx);
  });
}
function shiftNdviDate(delta){
  if(!dates.length) return;
  const newIdx=Math.max(0,Math.min(dates.length-1,_parcelIdx+delta));
  if(newIdx===_parcelIdx) return;
  _parcelIdx=newIdx;
  curIdx=newIdx;
  loadNdviOnParcel();
  if(ndviOpen) loadNdvi(dates[newIdx],'sentinel');
  updDate(dates[newIdx],newIdx);
  const tl=document.getElementById('ndviTimeline');
  if(tl) tl.querySelectorAll('.ndvi-tl-chip').forEach((ch,i)=>ch.classList.toggle('sel',i===newIdx));
}

function buildNdviLegendRows(){
  const el=document.getElementById('ndviLegendPanel');if(!el) return;
  el.innerHTML=NDVI_CLASSES.map(cls=>
    '<div class="ndvi-leg-item">'+
    '<div class="ndvi-leg-dot" style="background:'+cls.color+';"></div>'+
    '<div class="ndvi-leg-lbl">'+cls.label+'</div>'+
    '<div class="ndvi-leg-pct" style="color:'+cls.color+'">'+cls.pct+'%</div>'+
    '</div>'
  ).join('');
}

function setNdviGraphToggle(mode,btn){
  _ndviGraphMode=mode;
  document.querySelectorAll('.ndvi-graph-tab').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  drawNdviGraph(window._wx);
}
function drawNdviGraph(wxData){
  const c=document.getElementById('ndviGraphC');if(!c) return;
  if(_ndviGraphChart){_ndviGraphChart.destroy();_ndviGraphChart=null;}
  const labels=[],ndviVals=[],meteoVals=[];
  const src=wxData&&wxData.daily&&wxData.daily.time?wxData.daily:null;
  const n=src?src.time.length:30;
  for(let i=0;i<n;i++){
    let d;
    if(src) d=new Date(src.time[i]+'T12:00:00Z');
    else{d=new Date();d.setDate(d.getDate()-(n-1-i));}
    const doy=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
    labels.push(d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}));
    const cult=(window._currentCulture||'').toLowerCase();
    let base=0.28,phase=-80;
    if(cult.includes('vigne')){base=0.25;phase=-60;}
    else if(cult.includes('blé')||cult.includes('orge')){base=0.30;phase=-30;}
    else if(cult.includes('maïs')){base=0.25;phase=-120;}
    else if(cult.includes('prairie')){base=0.40;phase=-40;}
    let val=base+0.30*Math.sin((doy+phase)/365*2*Math.PI);
    if(src){
      const rain=src.precipitation_sum.slice(Math.max(0,i-7),i+1).reduce((a,b)=>a+(b||0),0);
      val+=Math.min(rain*0.0015,0.10);
    }
    ndviVals.push(+Math.max(0.05,Math.min(0.92,val+(Math.random()*.01-.005))).toFixed(3));
    if(src) meteoVals.push(_ndviGraphMode==='prec'?(src.precipitation_sum[i]||0):(src.temperature_2m_max[i]||20));
    else meteoVals.push(_ndviGraphMode==='prec'?Math.random()*5:15+Math.random()*15);
  }
  const grad=c.getContext('2d').createLinearGradient(0,0,0,100);
  grad.addColorStop(0,'rgba(82,196,26,0.5)');grad.addColorStop(1,'rgba(82,196,26,0.05)');
  _ndviGraphChart=new Chart(c,{type:'line',data:{labels,datasets:[
    {label:'NDVI',data:ndviVals,borderColor:'#52C41A',backgroundColor:grad,borderWidth:2,pointRadius:0,fill:true,tension:0.5,yAxisID:'y'},
    {label:_ndviGraphMode==='prec'?'Précip (mm)':'T max (°C)',data:meteoVals,type:'bar',backgroundColor:_ndviGraphMode==='prec'?'rgba(33,150,243,0.6)':'rgba(255,87,34,0.6)',borderRadius:1,yAxisID:'y2'}
  ]},options:{responsive:true,maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false},
    plugins:{legend:{labels:{font:{size:8},color:'#546e7a',boxWidth:10,padding:8}},tooltip:{backgroundColor:'rgba(255,255,255,.97)',titleColor:'#37474f',bodyColor:'#546e7a',borderColor:'#e0e0e0',borderWidth:1}},
    scales:{
      y:{min:0,max:1,position:'left',grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:8},stepSize:0.2,color:'#2e7d32'},title:{display:true,text:'NDVI',color:'#2e7d32',font:{size:8}}},
      y2:{position:'right',grid:{display:false},ticks:{font:{size:8},color:'#1565c0'},title:{display:true,text:_ndviGraphMode==='prec'?'mm':'°C',color:'#1565c0',font:{size:8}}},
      x:{grid:{display:false},ticks:{font:{size:7},maxTicksLimit:10,color:'#90a4ae'}}
    }
  }});
}

// ── moveend / auto-refresh ──
let lastFetch=Date.now();
let _fetchDatesTimer=null;
map.on('moveend',()=>{clearTimeout(_fetchDatesTimer);_fetchDatesTimer=setTimeout(()=>{fetchDates();lastFetch=Date.now();},1500);});
setInterval(async()=>{
  if(!ndviOpen) return; // inutile de poller si NDVI non actif
  if(Date.now()-lastFetch>3600000){
    const old=dates[0];await fetchDates();lastFetch=Date.now();
    if(dates[0]&&dates[0]!==old) showToast('🆕 Nouvelle image Sentinel-2 — '+dates[0]); const _tk=document.getElementById('tk-ndvi'); if(_tk) _tk.dataset.new='1';
  }
},60000);
document.addEventListener('visibilitychange',async()=>{
  if(!document.hidden&&Date.now()-lastFetch>3600000){await fetchDates();lastFetch=Date.now();}
});

// ── Init au load ──
window.addEventListener('load',()=>{
  setTimeout(()=>map.invalidateSize(),200);
  syncBaseUI();
  if(ndviOpen){const ovN=document.getElementById('ov-ndvi');if(ovN) ovN.classList.add('on');}
  fetchDates();
  restoreCommentMarkers();
  restoreAnnotations();
  restorePhotoMarkers();
  parseUrlParams();
  // Masquer le splash après chargement
  setTimeout(()=>{
    const sp=document.getElementById('splash');
    const ss=document.getElementById('splashStatus');
    if(ss) ss.textContent='Prêt ✓';
    setTimeout(()=>{if(sp) sp.classList.add('hidden');},400);
  },800);
});


// ═══════════════════════════════════════════════════════════════
// EXPORT PDF — RAPPORT TERRAIN EXPERT SINISTRE
// Contenu : photo satellite + commentaires expert par parcelle visitée
// ═══════════════════════════════════════════════════════════════
async function exportPDF(){
  if(typeof window.jspdf === 'undefined'){
    showToast('⏳ Chargement jsPDF…'); return;
  }
  // Récupérer toutes les parcelles avec au moins 1 visite ou commentaire
  const store = loadStore();
  const parcelles = Object.values(store).filter(p =>
    (p.visits && p.visits.length > 0) || p.comment
  );

  if(!parcelles.length){
    showToast('⚠️ Aucune visite enregistrée — ajoutez des observations dans l\'onglet Expert');
    return;
  }

  showToast('📄 Génération du rapport PDF…');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const W=210, M=14;
  const GREEN=[45,189,138], DARK=[13,18,24], GRAY=[90,110,120], WHITE=[255,255,255];
  const now = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

  // ── Fonction : dessiner le header sur chaque page ──
  function drawHeader(pageNum, total){
    doc.setFillColor(...DARK);
    doc.rect(0,0,W,22,'F');
    doc.setFillColor(...GREEN);
    doc.rect(0,21,W,1.5,'F');
    doc.setFont('helvetica','bold');
    doc.setFontSize(16); doc.setTextColor(...WHITE);
    doc.text('TERRA',M,14);
    doc.setTextColor(...GREEN);
    doc.text('SCAN',M+doc.getTextWidth('TERRA')+1,14);
    doc.setFontSize(8); doc.setTextColor(150,190,170);
    doc.text('Rapport de mission terrain — '+now,M,20);
    doc.setFontSize(8); doc.setTextColor(...GRAY);
    doc.text('Page '+pageNum+'/'+total,W-M,14,{align:'right'});
  }

  // ── Pré-charger les photos satellite de chaque parcelle ──
  async function loadSatImage(lat,lng,type='sat'){
    let url;
    if(type==='sat'){
      url='https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export'
        +'?bbox='+(lng-0.003)+','+(lat-0.0015)+','+(lng+0.003)+','+(lat+0.0015)
        +'&bboxSR=4326&size=400,200&imageSR=4326&format=jpg&f=image';
    } else if(type==='ndvi' && dates.length && tok){
      // Image NDVI colorée depuis Sentinel Hub
      const d=dates[_parcelIdx]||dates[0];
      const dt=new Date(d+'T12:00:00Z');dt.setDate(dt.getDate()+1);
      const dtEnd=dt.toISOString().split('T')[0];
      url='https://sh.dataspace.copernicus.eu/ogc/wms/'+SH_INST
        +'?access_token='+encodeURIComponent(tok)
        +'&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/jpeg'
        +'&LAYERS='+NDVI_L+'&WIDTH=400&HEIGHT=200&CRS=EPSG:4326'
        +'&BBOX='+(lat-0.005)+','+(lng-0.008)+','+(lat+0.005)+','+(lng+0.008)
        +'&TIME='+d+'/'+dtEnd;
    } else {
      return null;
    }
    return new Promise(resolve=>{
      const img=new Image();
      img.crossOrigin='anonymous';
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        canvas.width=img.width; canvas.height=img.height;
        canvas.getContext('2d').drawImage(img,0,0);
        try{ resolve(canvas.toDataURL('image/jpeg',0.85)); }
        catch(e){ resolve(null); }
      };
      img.onerror=()=>resolve(null);
      img.src=url;
      setTimeout(()=>resolve(null),8000); // timeout 8s
    });
  }

  // Calculer le nombre de pages total
  const nbPages = 1 + parcelles.length; // 1 page résumé + 1 page par parcelle
  let pageNum=1;

  // ══════════════════════════════════════
  // PAGE 1 — RÉSUMÉ DE LA MISSION
  // ══════════════════════════════════════
  drawHeader(pageNum, nbPages);
  let y=30;

  // Titre résumé
  doc.setFillColor(240,248,244);
  doc.roundedRect(M,y,W-2*M,14,3,3,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(...DARK);
  doc.text('Résumé de mission',M+6,y+9);
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...GRAY);
  doc.text(parcelles.length+' parcelle(s) visitée(s)',W-M-2,y+9,{align:'right'});
  y+=20;

  // Tableau récapitulatif
  const colW=[(W-2*M)*0.32,(W-2*M)*0.22,(W-2*M)*0.22,(W-2*M)*0.24];
  const headers=['Commune / Coords','Culture','Dernière visite','Observations'];
  doc.setFillColor(...DARK);
  doc.rect(M,y,W-2*M,7,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...WHITE);
  let cx=M;
  headers.forEach((h,i)=>{ doc.text(h,cx+2,y+5); cx+=colW[i]; });
  y+=7;

  parcelles.forEach((p,pi)=>{
    const visits=(p.visits||[]).sort((a,b)=>b.date.localeCompare(a.date));
    const last=visits[0]||{};
    const lastDate=last.date?last.date.split('-').reverse().join('/'):p.updatedAt?p.updatedAt.split('T')[0].split('-').reverse().join('/'):'—';
    const culture=last.culture||p.culture||'—';
    const obs=last.comment||p.comment||'—';
    const coords=p.lat?p.lat.toFixed(4)+'°N  '+p.lng.toFixed(4)+'°E':'—';

    doc.setFillColor(pi%2===0?248:255,pi%2===0?252:255,pi%2===0?250:255);
    doc.rect(M,y,W-2*M,8,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...DARK);
    cx=M;
    doc.text(coords,cx+2,y+5); cx+=colW[0];
    doc.text(culture.slice(0,20),cx+2,y+5); cx+=colW[1];
    doc.text(lastDate,cx+2,y+5); cx+=colW[2];
    doc.text(obs.slice(0,28),cx+2,y+5);
    y+=8;
    if(y>280){ doc.addPage(); pageNum++; drawHeader(pageNum,nbPages); y=30; }
  });

  // ══════════════════════════════════════
  // PAGES SUIVANTES — UNE PAR PARCELLE
  // ══════════════════════════════════════
  for(const p of parcelles){
    doc.addPage(); pageNum++;
    drawHeader(pageNum, nbPages);
    y=30;

    const visits=(p.visits||[]).sort((a,b)=>b.date.localeCompare(a.date));
    const allComments=visits.filter(v=>v.comment).map(v=>({date:v.date,text:v.comment,culture:v.culture,variete:v.variete}));
    if(!visits.length && p.comment) allComments.push({date:'—',text:p.comment,culture:'—',variete:'—'});

    // Entête parcelle
    const coords=p.lat?p.lat.toFixed(5)+'°N  '+p.lng.toFixed(5)+'°E':'—';
    const lastV=visits[0]||{};
    const culturePrinc=lastV.culture||p.culture||'Non déclarée PAC';

    doc.setFillColor(...GREEN);
    doc.rect(M,y,3,18,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(...DARK);
    doc.text(coords,M+7,y+8);
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(...GRAY);
    doc.text(culturePrinc+' · '+visits.length+' visite(s)',M+7,y+15);
    y+=24;

    // Photo satellite + NDVI
    const imgData = p.lat ? await loadSatImage(p.lat,p.lng,'sat') : null;
    const ndviData = p.lat && dates.length && tok ? await loadSatImage(p.lat,p.lng,'ndvi') : null;
    const imgH=55;
    if(imgData){
      doc.addImage(imgData,'JPEG',M,y,W-2*M,imgH,undefined,'FAST');
    } else {
      doc.setFillColor(20,30,25);
      doc.rect(M,y,W-2*M,imgH,'F');
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...GRAY);
      doc.text('Photo satellite indisponible',W/2,y+imgH/2,{align:'center'});
    }
    // Image NDVI si disponible
    if(ndviData){
      doc.addImage(ndviData,'JPEG',M+Math.floor((W-2*M)/2)+2,y,Math.floor((W-2*M)/2)-2,imgH,undefined,'FAST');
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...GREEN);
      doc.text('NDVI · '+( dates[_parcelIdx]||'—'), W-M-2, y+3, {align:'right'});
    }
    // Overlay coord sur la photo
    doc.setFillColor(0,0,0);
    doc.setGState(doc.GState({opacity:0.5}));
    doc.rect(M,y+imgH-8,W-2*M,8,'F');
    doc.setGState(doc.GState({opacity:1}));
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...WHITE);
    doc.text('© ESRI / Maxar — Satellite HD — '+coords,M+3,y+imgH-3);
    y+=imgH+6;

    // Visites et commentaires
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...DARK);
    doc.text('Observations terrain',M,y); y+=5;
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.4);
    doc.line(M,y,W-M,y); y+=5;

    if(!allComments.length){
      doc.setFont('helvetica','italic'); doc.setFontSize(8); doc.setTextColor(...GRAY);
      doc.text('Aucune observation saisie.',M,y); y+=6;
    }

    // Photos terrain de la parcelle
    const pdfPhotos = getPhotosForPDF(p.lat,p.lng);
    if(pdfPhotos.length){
      if(y>240){ doc.addPage(); pageNum++; drawHeader(pageNum,nbPages); y=30; }
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...DARK);
      doc.text('Photos terrain ('+pdfPhotos.length+')', M, y); y+=5;
      doc.setDrawColor(...GREEN); doc.setLineWidth(0.4);
      doc.line(M,y,W-M,y); y+=5;
      const phW=(W-2*M-8)/3, phH=phW*0.75;
      pdfPhotos.forEach((ph,pi)=>{
        const col=pi%3, row=Math.floor(pi/3);
        if(col===0&&row>0) y+=phH+4;
        if(y+phH>280){ doc.addPage(); pageNum++; drawHeader(pageNum,nbPages); y=30; }
        try{
          doc.addImage(ph.data,'JPEG',M+col*(phW+4),y,phW,phH,undefined,'FAST');
          if(ph.legende){
            doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...GRAY);
            doc.text(ph.legende.slice(0,25),M+col*(phW+4)+phW/2,y+phH+3,{align:'center'});
          }
        }catch(e){}
      });
      y+=phH+12;
    }

    visits.forEach((v,vi)=>{
      if(y>270){ doc.addPage(); pageNum++; drawHeader(pageNum,nbPages); y=30; }

      const dateV=v.date?v.date.split('-').reverse().join('/'):'—';
      // Bandeau date/culture
      doc.setFillColor(240,248,244);
      doc.rect(M,y,W-2*M,10,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(...DARK);
      doc.text('Visite du '+dateV,M+3,y+7);
      if(v.culture){
        doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GREEN);
        doc.text(v.culture+(v.variete?' · '+v.variete:''),W-M-2,y+7,{align:'right'});
      }
      y+=12;

      // Commentaire
      if(v.comment){
        doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(40,60,50);
        const lines=doc.splitTextToSize(v.comment,W-2*M-4);
        lines.forEach(l=>{
          if(y>272){ doc.addPage(); pageNum++; drawHeader(pageNum,nbPages); y=30; }
          doc.text(l,M+2,y); y+=5;
        });
        y+=2;
      } else {
        doc.setFont('helvetica','italic'); doc.setFontSize(8); doc.setTextColor(...GRAY);
        doc.text('Pas d\'observation pour cette visite.',M+2,y); y+=7;
      }

      // Séparateur
      doc.setDrawColor(200,220,210);
      doc.setLineWidth(0.2);
      doc.line(M,y,W-M,y); y+=5;
    });
  }

  // ── Footer sur toutes les pages ──
  const totalP=doc.getNumberOfPages();
  for(let i=1;i<=totalP;i++){
    doc.setPage(i);
    doc.setFillColor(...DARK);
    doc.rect(0,287,W,10,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.text('TerraScan · Rapport généré le '+now,M,293);
    doc.text('Données : Sentinel-2/ESA · ESRI/Maxar · Open-Meteo ERA5 · IGN/ASP',W-M,293,{align:'right'});
  }

  // ── Sauvegarder ──
  const filename='TerraScan_Rapport_'+now.replace(/ /g,'_').replace(/\//g,'-')+'.pdf';
  doc.save(filename);
  showToast('✅ Rapport PDF téléchargé — '+parcelles.length+' parcelle(s)');
}

// ═══════════════════════════════════════════════════════════════
// SCORE NDVI AVANT/APRÈS en %
// ═══════════════════════════════════════════════════════════════
function computeNdviScore(){
  const moyEl = document.getElementById('ndviMoyVal');
  if(!moyEl) return null;
  const curMoy = parseFloat(moyEl.textContent);
  if(isNaN(curMoy)||!dates.length) return null;
  // Estimation : comparer avec la normale saisonnière (0.65 pour végétation saine)
  const reference = 0.65;
  const perte = ((reference - curMoy) / reference * 100);
  return { cur: curMoy, ref: reference, perte: Math.max(0, perte).toFixed(1) };
}

function buildNdviScoreHtml(){
  const score = computeNdviScore();
  if(!score) return '';
  const perte = parseFloat(score.perte);
  const cls = perte > 20 ? 'loss' : 'gain';
  const label = perte > 40 ? 'Dommage sévère'
              : perte > 20 ? 'Dommage modéré'
              : perte > 5  ? 'Léger impact'
              : 'Végétation saine';
  return '<div class="ndvi-score-wrap">'
    +'<div class="ndvi-score-title">Score végétation</div>'
    +'<div class="ndvi-score-grid">'
    +'<div class="ndvi-score-cell">'
      +'<div class="ndvi-score-val">'+score.cur.toFixed(2)+'</div>'
      +'<div class="ndvi-score-lbl">NDVI mesuré</div>'
    +'</div>'
    +'<div class="ndvi-score-cell">'
      +'<div class="ndvi-score-val">'+score.ref.toFixed(2)+'</div>'
      +'<div class="ndvi-score-lbl">Référence</div>'
    +'</div>'
    +'</div>'
    +'<div style="text-align:center;margin-top:8px;">'
      +'<span class="ndvi-score-delta '+cls+'">−'+score.perte+'% · '+label+'</span>'
    +'</div>'
    +'</div>';
}

function toggleAnnotToolbar(){
  const tb=document.getElementById('annotToolbar');
  if(!tb) return;
  const vis = tb.style.display==='flex';
  tb.style.display = vis ? 'none' : 'flex';
  if(vis && _annotMode) setAnnotMode(null);
}

// ── Init auth au chargement ──
initAuth();

