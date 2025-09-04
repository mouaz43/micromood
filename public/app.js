/* Micromoon — front-end (markers fixed)
   - Always render dots: cluster mode uses L.markerClusterGroup; non-cluster uses pointsLayer (L.layerGroup)
   - Modern hero + i18n + starfield + Leaflet (heatmap + optional “connect similar” lines)
   - Plain fetch API (no websockets). Clear toasts on errors
*/

const API_BASE = (window.API_URL || "").replace(/\/$/, "");

// ---------- tiny utils
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const isoNow = () => new Date().toISOString();
const hoursAgo = (h)=> new Date(Date.now() - h*3600*1000);
function toast(msg, type="info"){
  const host = $("#toastHost"); if(!host) return;
  const el = document.createElement("div");
  el.className = "px-3 py-2 rounded-xl text-sm shadow-lg backdrop-blur ring-1 " +
    (type==="error" ? "bg-red-500/90 ring-red-400 text-white"
     : type==="ok" ? "bg-emerald-500/90 ring-emerald-400 text-black"
     : "bg-white/90 ring-white/60 text-black");
  el.textContent = msg; host.appendChild(el); setTimeout(()=>el.remove(), 3200);
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function timeAgo(iso){ const h=Math.floor((Date.now()-new Date(iso))/3600000); if(h<1)return"just now"; if(h<24)return `${h}h ago`; return `${Math.floor(h/24)}d ago`; }
const kmBetween=(a,b)=>{const R=6371,dLat=((b.lat-a.lat)*Math.PI)/180,dLng=((b.lng-a.lng)*Math.PI)/180,s1=Math.sin(dLat/2)**2,s2=Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(s1+s2));};

// ---------- i18n
const I18N = {
  en:{tagline:"Micromoon — anonymous, 24-hour moods",pulseTitle:"Pulse your mood",howFeel:"How do you feel?",whats:"What’s happening?",optional:"(optional, 280 chars)",orClick:"or click on the map",crosshair:"Crosshair",noSpot:"No spot selected yet.",allowConnect:"Allow others to connect my dot",postsInfo:"Posts are anonymous and visible for 24 hours, then disappear.",connectSimilar:"Connect similar moods",radius:"Radius",window:"Window",h24:"24h",h12:"12h",h6:"6h",tip:"Tip: lower the window to 6–12h to see fresher activity.",pulseBtn:"Pulse",shareBtn:"Share",useLocation:"Use my location"},
  de:{tagline:"Micromoon — anonym, 24-Stunden-Stimmungen",pulseTitle:"Teile deine Stimmung",howFeel:"Wie fühlst du dich?",whats:"Was passiert?",optional:"(optional, 280 Zeichen)",orClick:"oder klicke in die Karte",crosshair:"Fadenkreuz",noSpot:"Noch kein Ort ausgewählt.",allowConnect:"Ähnliche Punkte dürfen mich verbinden",postsInfo:"Beiträge sind anonym und 24 Stunden sichtbar, dann verschwinden sie.",connectSimilar:"Ähnliche Stimmungen verbinden",radius:"Radius",window:"Fenster",h24:"24h",h12:"12h",h6:"6h",tip:"Tipp: Fenster auf 6–12h senken, um frischere Aktivität zu sehen.",pulseBtn:"Senden",shareBtn:"Teilen",useLocation:"Meinen Standort"},
  es:{tagline:"Micromoon — anónimo, estados de 24 horas",pulseTitle:"Comparte tu ánimo",howFeel:"¿Cómo te sientes?",whats:"¿Qué está pasando?",optional:"(opcional, 280 caracteres)",orClick:"o haz clic en el mapa",crosshair:"Mira",noSpot:"Aún no hay punto seleccionado.",allowConnect:"Permitir conectar puntos similares",postsInfo:"Las publicaciones son anónimas y visibles por 24 horas, luego desaparecen.",connectSimilar:"Conectar ánimos similares",radius:"Radio",window:"Ventana",h24:"24h",h12:"12h",h6:"6h",tip:"Tip: baja la ventana a 6–12h para ver actividad más reciente.",pulseBtn:"Publicar",shareBtn:"Compartir",useLocation:"Usar mi ubicación"},
  fr:{tagline:"Micromoon — humeurs anonymes, 24 heures",pulseTitle:"Publie ton humeur",howFeel:"Comment te sens-tu ?",whats:"Que se passe-t-il ?",optional:"(optionnel, 280 caractères)",orClick:"ou clique sur la carte",crosshair:"Réticule",noSpot:"Aucun point sélectionné.",allowConnect:"Permettre de relier les points similaires",postsInfo:"Les publications sont anonymes et visibles 24 heures, puis disparaissent.",connectSimilar:"Relier des humeurs similaires",radius:"Rayon",window:"Fenêtre",h24:"24h",h12:"12h",h6:"6h",tip:"Astuce : passe la fenêtre à 6–12h pour voir de l’activité plus fraîche.",pulseBtn:"Envoyer",shareBtn:"Partager",useLocation:"Utiliser ma position"},
  ar:{tagline:"ميكرومون — مشاعر مجهولة لمدة 24 ساعة",pulseTitle:"انشر شعورك",howFeel:"كيف تشعر؟",whats:"ماذا يحدث؟",optional:"(اختياري، 280 حرفًا)",orClick:"أو اضغط على الخريطة",crosshair:"علامة التصويب",noSpot:"لم يتم اختيار موقع بعد.",allowConnect:"اسمح بربط النقاط المتشابهة",postsInfo:"المنشورات مجهولة وتظهر لمدة 24 ساعة ثم تختفي.",connectSimilar:"ربط مشاعر متشابهة",radius:"نطاق",window:"نافذة",h24:"٢٤س",h12:"١٢س",h6:"٦س",tip:"نصيحة: خفّض النافذة إلى 6–12 ساعة لرؤية نشاط أحدث.",pulseBtn:"إرسال",shareBtn:"مشاركة",useLocation:"موقعي"},
  ru:{tagline:"Micromoon — анонимные настроения, 24 часа",pulseTitle:"Поделись настроением",howFeel:"Как ты себя чувствуешь?",whats:"Что происходит?",optional:"(необязательно, 280 символов)",orClick:"или нажми на карту",crosshair:"Прицел",noSpot:"Точка ещё не выбрана.",allowConnect:"Разрешить соединять похожие точки",postsInfo:"Публикации анонимны и видны 24 часа, затем исчезают.",connectSimilar:"Соединять похожие настроения",radius:"Радиус",window:"Окно",h24:"24ч",h12:"12ч",h6:"6ч",tip:"Подсказка: уменьшите окно до 6–12ч, чтобы видеть более свежую активность.",pulseBtn:"Отправить",shareBtn:"Поделиться",useLocation:"Моё местоположение"},
  zh:{tagline:"Micromoon：匿名心情，保留 24 小时",pulseTitle:"发布你的心情",howFeel:"你现在感觉如何？",whats:"发生了什么？",optional:"（可选，280 字）",orClick:"或在地图上点选",crosshair:"十字准星",noSpot:"尚未选择位置。",allowConnect:"允许连接相似心情的点",postsInfo:"帖子匿名显示 24 小时后消失。",connectSimilar:"连接相似心情",radius:"半径",window:"时间窗",h24:"24h",h12:"12h",h6:"6h",tip:"提示：将时间窗降到 6–12h 可看到更即时的活动。",pulseBtn:"发布",shareBtn:"分享",useLocation:"使用我的位置"},
};

// ---------- modern hero phrase
const HERO = {
  en: `The same moon looks down on all of us and knows our hidden feelings.
On Micromoon those feelings become lights on a shared map,
glowing for one day before they fade back into the night.`,

  de: `Der gleiche Mond schaut auf uns alle hinab und kennt unsere verborgenen Gefühle.
Auf Micromoon werden diese Gefühle zu Lichtern auf einer gemeinsamen Karte,
sie leuchten einen Tag, bevor sie wieder in die Nacht zurückkehren.`,

  es: `La misma luna nos mira a todos y conoce nuestros sentimientos ocultos.
En Micromoon esos sentimientos se vuelven luces en un mapa compartido,
que brillan durante un día antes de desvanecerse de nuevo en la noche.`,

  fr: `La même lune nous regarde tous et connaît nos sentiments secrets.
Sur Micromoon, ces sentiments deviennent des lumières sur une carte partagée,
qui brillent un jour avant de se fondre à nouveau dans la nuit.`,

  ar: `ينظر إلينا القمر نفسه جميعًا ويعرف مشاعرنا الخفية.
في ميكرومون تتحول تلك المشاعر إلى أضواء على خريطة مشتركة،
تلمع ليوم واحد قبل أن تذوب من جديد في الليل.`,

  ru: `Одна и та же луна смотрит на всех нас и знает наши скрытые чувства.
На Micromoon эти чувства становятся огоньками на общей карте,
горящими один день, прежде чем снова раствориться в ночи.`,

  zh: `同一轮月亮俯瞰着我们，懂得我们隐藏的情绪。
在 Micromoon，这些情绪化作共享地图上的点点灯光，
闪耀一天后又回归夜色。`
};
function renderHero(lang="en"){
  const el=$("#deepPhrase"); if(!el) return;
  const raw = HERO[lang] || HERO.en;
  const esc = s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;","<": "&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const html = esc(raw).replaceAll(/Micromoon/g,'<span class="brand-gradient">Micromoon</span>')
                       .split("\n").map((ln,i)=>`<span class="line" style="--i:${i}">${ln.trim()}</span>`).join("");
  el.innerHTML = html;
}

// ---------- language switching
let currentLang="en";
function applyLang(lang="en"){
  currentLang=lang;
  const t = I18N[lang] || I18N.en;
  $("#tagline").textContent = t.tagline;
  $("#ui-pulseTitle").textContent = t.pulseTitle;
  $("#ui-howFeel").textContent = t.howFeel;
  $("#ui-whatsHappening").textContent = t.whats;
  $("#ui-optional").textContent = t.optional;
  $("#ui-orClickMap").textContent = t.orClick;
  $("#toggleCrosshair").textContent = `${t.crosshair} ⌖`;
  $("#chosenSpot").textContent = t.noSpot;
  $("#ui-allowConnect").textContent = t.allowConnect;
  $("#ui-postsInfo").textContent = t.postsInfo;
  $("#ui-radius").textContent = t.radius;
  $("#ui-window").textContent = t.window;
  $("#ui-24h").textContent = t.h24; $("#ui-12h").textContent = t.h12; $("#ui-6h").textContent = t.h6;
  const tip = document.querySelector(".mm-controls")?.parentElement?.querySelector("p.text-xs");
  if(tip) tip.textContent = t.tip;
  $("#submitMood").textContent = t.pulseBtn;
  $("#shareLink").textContent = t.shareBtn;
  $("#useMyLocation").textContent = t.useLocation;
  document.documentElement.dir = (lang==="ar"?"rtl":"ltr");
  renderHero(lang);
}
$$(".lang-btn").forEach(b=>{
  b.addEventListener("click",()=>{
    $$(".lang-btn").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); applyLang(b.dataset.lang || "en");
  });
});

// ---------- starfield (subtle)
(function starfield(){
  const cv=$("#stars"); if(!cv) return; const ctx=cv.getContext("2d");
  let W,H,stars=[];
  function reset(){ W=cv.width=innerWidth; H=cv.height=innerHeight;
    const n=clamp(Math.floor((W*H)/14000),60,300);
    stars=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.4,a:Math.random()*6,s:Math.random()*.4+.1}));
  }
  function draw(){ ctx.clearRect(0,0,W,H);
    for(const s of stars){ s.a+=s.s*.015; const tw=.75+Math.sin(s.a)*.25;
      ctx.globalAlpha=clamp(tw,.2,1); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle="#e9efff"; ctx.fill();
    } requestAnimationFrame(draw);
  }
  addEventListener("resize",reset); reset(); draw();
})();

// ---------- map & layers
let map, cluster, pointsLayer, heat, linesLayer;
const state = {
  selected:null, mood:0,
  windowHours:24, radiusKm:120,
  connectSimilar:false, heatOn:false, clusterOn:true, // default to true so dots show
  consentConnect:false, data:[]
};
const moodToEmoji = {"-2":"😢","-1":"🙁","0":"😐","1":"🙂","2":"🤩"};

(function initMap(){
  map = L.map("map",{center:[20,0],zoom:2,worldCopyJump:true,zoomControl:true});
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
  cluster = L.markerClusterGroup({ disableClusteringAtZoom: 9 });
  pointsLayer = L.layerGroup();     // <<< NEW: non-cluster markers live here
  linesLayer = L.layerGroup();
  heat = L.heatLayer([], { radius: 18, blur: 15, maxZoom: 10, minOpacity: 0.25 });
  // add default markers layer
  map.addLayer(cluster); // we start in cluster mode

  map.on("click",(e)=>{
    state.selected = { lat:e.latlng.lat, lng:e.latlng.lng };
    $("#chosenSpot").textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    $("#submitMood").disabled = false;
  });
  $("#toggleCrosshair")?.addEventListener("click",()=>$("#crosshair")?.classList.toggle("hidden"));
})();

function emojiIcon(emoji){
  const el=document.createElement("div");
  el.style.cssText="width:34px;height:34px;display:grid;place-items:center;border-radius:12px;background:rgba(255,255,255,.15);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.35);box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:20px";
  el.textContent=emoji; return L.divIcon({html:el,className:"",iconSize:[34,34]});
}

// ---------- API helpers
async function fetchJSON(url, opt){
  const r = await fetch(url, opt).catch(()=>null);
  if(!r) throw new Error("Network error");
  if(!r.ok){ const text=await r.text().catch(()=> ""); throw new Error(`${r.status} ${r.statusText} ${text}`); }
  return r.json();
}
async function fetchPulses(){
  try{
    const list = await fetchJSON(`${API_BASE}/api/pulses?windowHours=${encodeURIComponent(state.windowHours)}`);
    state.data = (list||[]).map(p=>({
      id:p.id, lat:+p.lat, lng:+p.lng, mood:+(p.mood??0),
      note:p.note||"", allow_connect:!!(p.allow_connect??false),
      created_at: p.created_at || p.createdAt || isoNow(),
    })).filter(p=> new Date(p.created_at) >= hoursAgo(state.windowHours));
    renderData(true);
    if(!state.data.length) toast("No posts yet in this window.", "info");
  }catch(e){ console.error(e); toast("Could not load posts (API)", "error"); }
}

// ---------- render
function renderData(resetLayers=false){
  // when switching mode, remove layers and rebuild
  if(resetLayers){
    cluster.clearLayers(); pointsLayer.clearLayers(); linesLayer.clearLayers();
    if(state.clusterOn){ map.addLayer(cluster); map.removeLayer(pointsLayer); }
    else { map.addLayer(pointsLayer); map.removeLayer(cluster); }
  }else{
    cluster.clearLayers(); pointsLayer.clearLayers(); linesLayer.clearLayers();
  }

  const pts=[];
  for(const p of state.data){
    const mk = L.marker([p.lat,p.lng],{icon:emojiIcon(moodToEmoji[p.mood])});
    mk.bindPopup(`<div style="min-width:180px">
      <div style="font-size:18px">${moodToEmoji[p.mood]||"•"}</div>
      ${p.note?`<div style="margin-top:6px;opacity:.85">${escapeHtml(p.note)}</div>`:""}
      <div style="margin-top:8px;opacity:.6;font-size:12px">${timeAgo(p.created_at)}</div>
    </div>`);
    if(state.clusterOn) cluster.addLayer(mk);
    else pointsLayer.addLayer(mk);

    pts.push([p.lat,p.lng, 0.7 + (p.mood + 2) * 0.08]);
  }

  state.heatOn ? heat.setLatLngs(pts).addTo(map) : heat.remove();
  if(state.connectSimilar) drawConnections();
  $("#radiusValue").textContent = `${state.radiusKm}km`;
}

function drawConnections(){
  linesLayer.clearLayers();
  const arr = state.data.filter(p=>p.allow_connect);
  const groups = new Map();
  for(const p of arr){ const k=String(p.mood); (groups.get(k)||groups.set(k,[]).get(k)).push(p); }
  for(const g of groups.values()){
    for(let i=0;i<g.length;i++) for(let j=i+1;j<g.length;j++){
      const a=g[i], b=g[j]; if(kmBetween(a,b)<=state.radiusKm){
        L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:"rgba(180,210,255,.6)",weight:2}).addTo(linesLayer);
      }
    }
  }
  linesLayer.addTo(map);
}

// ---------- composer
$("#moodPicker")?.addEventListener("click",(e)=>{
  const btn=e.target.closest("button[data-mood]"); if(!btn) return;
  $$("#moodPicker button").forEach(b=>b.classList.remove("ring","ring-white","bg-white/10"));
  btn.classList.add("ring","ring-white","bg-white/10");
  state.mood = +btn.dataset.mood;
});
$("#connectConsent")?.addEventListener("change",(e)=>{ state.consentConnect = !!e.target.checked; });

$("#useMyLocation")?.addEventListener("click",()=>{
  if(!navigator.geolocation) return toast("Geolocation unavailable","error");
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const {latitude:lat, longitude:lng} = pos.coords;
      state.selected = {lat,lng};
      map.setView([lat,lng],10);
      $("#chosenSpot").textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      $("#submitMood").disabled = false;
    },
    ()=>toast("Could not access your location","error"),
    { enableHighAccuracy:true, timeout:8000 }
  );
});

$("#submitMood")?.addEventListener("click", async ()=>{
  if(!state.selected){ toast("Pick a spot first", "error"); return; }
  const note = ($("#note")?.value || "").trim();
  const payload = { mood: state.mood, note, lat: state.selected.lat, lng: state.selected.lng, allow_connect: !!state.consentConnect };
  const btn = $("#submitMood"); btn.disabled = true;
  try{
    const created = await fetchJSON(`${API_BASE}/api/pulses`, {
      method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload)
    });
    state.data.unshift({ id: created?.id || Math.random().toString(36).slice(2), ...payload, created_at: created?.created_at || isoNow() });
    renderData(); toast("Posted","ok"); $("#shareLink").disabled = false;
  }catch(e){ console.error(e); toast("Post failed (API/DB).", "error"); }
  finally{ btn.disabled=false; }
});

$("#shareLink")?.addEventListener("click", async ()=>{
  const url = `${location.origin}${location.pathname}?utm_source=share`;
  try{
    if(navigator.share) await navigator.share({ title:"Micromoon", text:"Under the same sky", url });
    else { await navigator.clipboard.writeText(url); toast("Link copied","ok"); }
  }catch{ await navigator.clipboard.writeText(url); toast("Link copied","ok"); }
});

// ---------- controls
$("#toggleConnections")?.addEventListener("change",(e)=>{ state.connectSimilar=!!e.target.checked; renderData(); });
$("#radiusKm")?.addEventListener("input",(e)=>{ state.radiusKm=+e.target.value; $("#radiusValue").textContent=`${state.radiusKm}km`; if(state.connectSimilar) drawConnections(); });
$("#windowHours")?.addEventListener("change", async (e)=>{ state.windowHours=+e.target.value; await fetchPulses(); });
$("#toggleHeat")?.addEventListener("change",(e)=>{ state.heatOn=!!e.target.checked; renderData(); });
$("#toggleCluster")?.addEventListener("change",(e)=>{
  state.clusterOn = !!e.target.checked;
  // swap active layer and re-render
  if(state.clusterOn){ map.addLayer(cluster); map.removeLayer(pointsLayer); }
  else { map.addLayer(pointsLayer); map.removeLayer(cluster); }
  renderData(true);
});

// ---------- init
(async function init(){
  document.querySelector('.lang-btn[data-lang="en"]')?.classList.add("active");
  applyLang("en");

  // set initial toggle states in UI
  const clusterToggle = $("#toggleCluster"); if(clusterToggle){ clusterToggle.checked = true; } // default ON
  const heatToggle = $("#toggleHeat"); if(heatToggle){ heatToggle.checked = false; }
  const connectToggle = $("#toggleConnections"); if(connectToggle){ connectToggle.checked = false; }

  $("#radiusValue").textContent=`${state.radiusKm}km`;

  await fetchPulses();
  // Poll every 25s to keep fresh (no websockets)
  setInterval(fetchPulses, 25000);
})();
