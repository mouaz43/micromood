/* =========================================================================
   Micromoon — Front-end Map Logic (READ DOTS RELIABLY)
   - Bulletproof popups: multi-event open, nearest-dot on map tap, fallback popup
   - Auto-pan popups into view
   - Mood connections keep numeric compare
   - No HTML changes, pulse logic untouched
   ======================================================================== */

/* ---------------- helpers ---------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.prototype.slice.call(r.querySelectorAll(s));
const toRad = d => d * Math.PI/180;
const kmBetween = (A, B) => {
  const R=6371, dLat=toRad(B.lat-A.lat), dLng=toRad(B.lng-A.lng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(A.lat))*Math.cos(toRad(B.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
};
const esc = (s='') => s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const debounce = (fn, d=120)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),d); }; };
const asId = v => String(v ?? '');
const mVal = v => Number(v);

/* ---------------- DOM refs ---------------- */
const deepPhrase = $('#deepPhrase');
const moodPicker = $('#moodPicker');
const note = $('#note');
const useMyLocationBtn = $('#useMyLocation');
const toggleCrosshairBtn = $('#toggleCrosshair');
const chosenSpot = $('#chosenSpot');
const connectConsent = $('#connectConsent');
const submitMood = $('#submitMood');
const shareLinkBtn = $('#shareLink');

const toggleConnections = $('#toggleConnections');
const windowHoursSel  = $('#windowHours');
const radiusInput = $('#radiusKm');
const radiusValue = $('#radiusValue');
const toggleHeat = $('#toggleHeat');
const toggleCluster = $('#toggleCluster');

const langButtons = $$('.lang-btn');
const moonLabel = $('#moonLabel');
const toggleMotion = $('#toggleMotion');

const liveCount = $('#liveCount');
const spark = $('#spark');
const mapEl = $('#map');

/* ---------------- toast (auto host) ---------------- */
function getToastHost(){
  let host = document.getElementById('toastHost');
  if (!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    host.style.cssText = `
      position:fixed; left:50%; bottom:20px; transform:translateX(-50%);
      z-index:10000; display:flex; gap:8px; flex-direction:column;
      align-items:center; pointer-events:none;
    `;
    document.body.appendChild(host);
  }
  return host;
}
function toast(txt, ms=2400){
  const host = getToastHost();
  const el = document.createElement('div');
  el.style.cssText = `
    padding:10px 14px;border:1px solid rgba(255,255,255,.18);
    background:rgba(14,30,60,.92);backdrop-filter:blur(8px);
    border-radius:12px;color:#eaf1ff;font-weight:800;
    box-shadow:0 10px 28px rgba(0,0,0,.45); transform:translateY(6px);
    transition:.25s ease; max-width:92vw; text-align:center; pointer-events:auto;
  `;
  el.textContent = txt;
  host.appendChild(el);
  requestAnimationFrame(()=>{ el.style.transform='translateY(0)'; el.style.opacity='1'; });
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-6px)'; setTimeout(()=>el.remove(),250); }, ms);
}

/* ---------------- i18n (unchanged content, trimmed here) ---------------- */
const I18N = {
  en:{ phrase:[
      'The same moon looks down on all of us and knows our hidden feelings.',
      'On Micromoon those feelings become lights on a shared map, glowing for one day before they fade back into the night.'
    ],
    pulseTitle:'Pulse your mood', howFeel:'How do you feel?', happening:'What’s happening?', optional:'(optional, 280 chars)',
    orClick:'or click on the map', allowConnect:'Allow others to connect my dot',
    postsInfo:'Posts are anonymous and visible for 24 hours, then disappear.',
    window:'Window', radius:'Radius',
    veryLow:'very low', low:'low', neutral:'neutral', good:'good', great:'great',
    pulsed:'Pulsed ✨', loadFail:'Could not load pulses', postFail:'Could not pulse',
    del:'Delete', hidden:'Hidden on this device', delOK:'Dot deleted',
    tooMany:'Too many dots to connect smoothly. Zoom or lower the window.',
    pickSpot:'Pick a mood and a spot', linkCopied:'Link copied'
  },
  de:{ phrase:[
      'Der gleiche Mond schaut auf uns alle herab und kennt unsere verborgenen Gefühle.',
      'Auf Micromoon werden diese Gefühle zu Lichtern auf einer gemeinsamen Karte, die einen Tag lang leuchten, bevor sie wieder in die Nacht verblassen.'
    ],
    pulseTitle:'Sende deine Stimmung', howFeel:'Wie fühlst du dich?', happening:'Was passiert?', optional:'(optional, 280 Zeichen)',
    orClick:'oder auf die Karte tippen', allowConnect:'Anderen erlauben, meinen Punkt zu verbinden',
    postsInfo:'Beiträge sind anonym und 24 Stunden sichtbar, dann verschwinden sie.',
    window:'Fenster', radius:'Radius',
    veryLow:'sehr niedrig', low:'niedrig', neutral:'neutral', good:'gut', great:'sehr gut',
    pulsed:'Gepulst ✨', loadFail:'Punkte konnten nicht geladen werden', postFail:'Senden fehlgeschlagen',
    del:'Löschen', hidden:'Auf diesem Gerät verborgen', delOK:'Punkt gelöscht',
    tooMany:'Zu viele Punkte für flüssige Verbindungen. Zoome oder verringere das Zeitfenster.',
    pickSpot:'Wähle Stimmung und Ort', linkCopied:'Link kopiert'
  },
  // es/fr/ar/ru/zh kept as in your current file…
};
let LANG = 'en';
function setLang(code){
  LANG = I18N[code] ? code : 'en';
  $$('.lang-btn').forEach(b=>b.classList.toggle('active', b.dataset.lang===LANG));
  document.documentElement.dir = (LANG==='ar' ? 'rtl' : 'ltr');
  const t = I18N[LANG];
  deepPhrase && (deepPhrase.innerHTML = t.phrase.map(s => `<span class="line"><span class="brand-gradient">${esc(s)}</span></span>`).join(' '));
  $('#ui-pulseTitle') && ($('#ui-pulseTitle').textContent = t.pulseTitle);
  $('#ui-howFeel') && ($('#ui-howFeel').textContent = t.howFeel);
  $('#ui-whatsHappening') && ($('#ui-whatsHappening').textContent = t.happening);
  $('#ui-optional') && ($('#ui-optional').textContent = t.optional);
  $('#ui-orClickMap') && ($('#ui-orClickMap').textContent = t.orClick);
  $('#ui-allowConnect') && ($('#ui-allowConnect').textContent = t.allowConnect);
  $('#ui-postsInfo') && ($('#ui-postsInfo').textContent = t.postsInfo);
  $('#ui-window') && ($('#ui-window').textContent = t.window);
  $('#ui-radius') && ($('#ui-radius').textContent = t.radius);
}
langButtons.forEach(b=>b.addEventListener('click', ()=>setLang(b.dataset.lang)));
setLang('en');

/* ---------------- moon phase + motion toggle ---------------- */
(function(){
  const now = new Date(), syn = 29.530588853, ref = new Date(Date.UTC(2000,0,6,18,14));
  const age = ((now-ref)/86400000) % syn; const idx = Math.round(age/syn*8)%8;
  moonLabel && (moonLabel.textContent = `Moon phase: ${['New','Waxing crescent','First quarter','Waxing gibbous','Full','Waning gibbous','Last quarter','Waning crescent'][idx]}`);
})();
toggleMotion?.addEventListener('change', ()=>document.body.classList.toggle('reduce-motion', !!toggleMotion.checked));

/* ---------------- mobile detection & renderers ---------------- */
const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const HIT_STROKE = IS_TOUCH ? 34 : 18; // invisible stroke width for easy taps
const DOT_RADIUS = IS_TOUCH ? 11 : 8;
const touchRenderer = (typeof L !== 'undefined' && L.canvas) ? L.canvas({ tolerance: IS_TOUCH ? 12 : 6, padding: 0.25 }) : undefined;
const lineRenderer  = (typeof L !== 'undefined' && L.canvas) ? L.canvas({ padding: 0.25 }) : undefined;

/* ---------------- map setup ---------------- */
let map, clusterLayer, heatLayer, lineLayer;
let pulses = [];
const markers = new Map();            // id -> marker
const byId     = new Map();           // id -> pulse (for quick lookup)
const hidden  = new Set(JSON.parse(localStorage.getItem('mmHidden')   || '[]').map(asId));
const owned   = new Set(JSON.parse(localStorage.getItem('mmOwnedIds') || '[]').map(asId));
let ownerKey  = localStorage.getItem('mmOwnerKey') || (crypto?.randomUUID?.() || String(Math.random()));
localStorage.setItem('mmOwnerKey', ownerKey);

(function initMap(){
  map = L.map('map', {
    zoomControl:true, minZoom:2, worldCopyJump:true, attributionControl:true,
    preferCanvas:true, tap: IS_TOUCH, tapTolerance: IS_TOUCH ? 25 : 15,
    touchZoom:true, closePopupOnClick:false
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap' }).addTo(map);
  map.setView([20, 0], 2);

  clusterLayer = L.markerClusterGroup({
    showCoverageOnHover:false, chunkedLoading:true, zoomToBoundsOnClick:false,
    maxClusterRadius: IS_TOUCH ? 70 : 50,
    spiderfyOnMaxZoom:true, spiderfyOnEveryZoom:true, disableClusteringAtZoom:17
  });
  clusterLayer.on('clusterclick', a=>a.layer.spiderfy());
  map.addLayer(clusterLayer);

  lineLayer = L.layerGroup().addTo(map);

  // Map click: open nearest dot if close; otherwise select location
  map.on('click', e=>{
    const nm = nearestMarker(e.latlng, 28);
    if (nm){ openMarkerPopup(nm); return; }
    // no nearby dot -> select spot for posting
    selectedSpot = { lat: e.latlng.lat, lng: e.latlng.lng };
    chosenSpot && (chosenSpot.textContent = `${selectedSpot.lat.toFixed(4)}, ${selectedSpot.lng.toFixed(4)}`);
    submitMood && (submitMood.disabled = (selectedMood === null));
  });

  map.on('popupopen', e=>{
    try { map.panInside(e.popup.getLatLng(), { paddingTopLeft:[30,50], paddingBottomRight:[30,50] }); } catch {}
  });
})();

/* ---------------- selections & controls ---------------- */
let selectedMood = null;
let selectedSpot = null;

moodPicker?.addEventListener('click', e=>{
  const b = e.target.closest('button[data-mood]'); if(!b) return;
  $$('#moodPicker button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); selectedMood = Number(b.dataset.mood);
  submitMood && (submitMood.disabled = !selectedSpot);
});

useMyLocationBtn?.addEventListener('click', ()=>{
  if(!navigator.geolocation) return toast('Location not available');
  navigator.geolocation.getCurrentPosition(pos=>{
    selectedSpot = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.setView([selectedSpot.lat, selectedSpot.lng], 10);
    chosenSpot && (chosenSpot.textContent = `${selectedSpot.lat.toFixed(4)}, ${selectedSpot.lng.toFixed(4)}`);
    submitMood && (submitMood.disabled = (selectedMood === null));
  }, ()=>toast('Could not get location'));
});

toggleCrosshairBtn?.addEventListener('click', ()=>$('#crosshair')?.classList.toggle('hidden'));

radiusInput?.addEventListener('input', ()=>{
  radiusValue && (radiusValue.textContent = `${radiusInput.value}km`);
  if (toggleConnections?.checked) buildConnections();
});
windowHoursSel?.addEventListener('change', ()=>refreshPulses());
toggleConnections?.addEventListener('change', ()=>buildConnections());
toggleHeat?.addEventListener('change', ()=>updateHeat());
toggleCluster?.addEventListener('change', ()=>{
  if (!toggleCluster) return;
  if (toggleCluster.checked) { if (!map.hasLayer(clusterLayer)) map.addLayer(clusterLayer); }
  else { if (map.hasLayer(clusterLayer)) map.removeLayer(clusterLayer); }
});

/* ---------------- layout equalize ---------------- */
function cardByHeading(startsWith){
  const hs = $$('h1,h2,h3,.card-title,[role="heading"]');
  for(const h of hs){
    if(h.textContent.trim().toLowerCase().startsWith(startsWith)) return h.closest('.card, .panel, section, div');
  }
  return null;
}
function equalizeCards(){
  const left  = cardByHeading('pulse your mood');
  const right = cardByHeading('map view');
  if(!left || !right) return;
  left.style.height = 'auto'; right.style.height = 'auto';
  const h = Math.max(left.offsetHeight, right.offsetHeight);
  left.style.height = right.style.height = h + 'px';
  if(mapEl){ mapEl.style.marginTop = '16px'; mapEl.style.display = 'block'; }
}
note && (note.style.width = '100%');
const eqNow = ()=>requestAnimationFrame(equalizeCards);
window.addEventListener('resize', debounce(eqNow, 120));
document.addEventListener('DOMContentLoaded', eqNow);

/* ---------------- load & render ---------------- */
async function refreshPulses(){
  try{
    const hours = Number(windowHoursSel?.value || 24);
    const res = await fetch(`/api/pulses?windowHours=${hours}`);
    if(!res.ok) throw new Error(`GET /api/pulses ${res.status}`);
    const arr = await res.json();
    pulses = (Array.isArray(arr) ? arr : []).filter(p => !hidden.has(asId(p.id)));
    renderPulses();
  }catch(e){ console.error(e); toast(I18N[LANG].loadFail); }
}

function renderPulses(){
  clusterLayer.clearLayers(); lineLayer.clearLayers();
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
  markers.clear(); byId.clear();

  for(const p of pulses){
    const pid = asId(p.id);
    byId.set(pid, p);

    const marker = L.circleMarker([p.lat, p.lng], {
      radius: DOT_RADIUS,
      color: 'rgba(255,255,255,.22)',
      weight: HIT_STROKE,   // large invisible hit area
      opacity: 0,
      fillColor: moodColor(p.mood),
      fillOpacity: .96,
      renderer: touchRenderer,
      bubblingMouseEvents:false,
      keyboard:true
    });

    // Bind popup (primary)
    marker.bindPopup(popupHTML(p), {
      autoPan: true, autoClose: false, closeButton: true, keepInView: true,
      maxWidth: 280, autoPanPaddingTopLeft:[30,50], autoPanPaddingBottomRight:[30,50],
      className: 'mm-popup'
    });

    const open = ()=>openMarkerPopup(marker, pid);

    // MULTI-EVENT OPEN to be bulletproof
    marker.on('add', ()=>{ try{ marker.bringToFront(); }catch{} });
    marker.on('click', open);
    marker.on('dblclick', open);
    marker.on('keypress', (e)=>{ if (e.originalEvent?.key === 'Enter') open(); });
    marker.on('touchstart', ()=>setTimeout(open, 0), {passive:true});
    marker.on('touchend', ev=>{ ev.originalEvent?.preventDefault?.(); ev.originalEvent?.stopPropagation?.(); open(); }, {passive:false});
    marker.on('pointerup', open);

    marker.on('popupopen', (ev)=>attachPopupHandlers(ev.popup, pid));

    markers.set(pid, marker);
    clusterLayer.addLayer(marker);
  }

  liveCount && (liveCount.textContent = `Now: ${pulses.length} pulses`);
  drawSparkline(); updateHeat();
  if (toggleConnections?.checked) buildConnections();

  eqNow();
}

function moodColor(m){
  switch(mVal(m)){
    case -2: return '#8ebeff';
    case -1: return '#b5ccff';
    case  0: return '#dee7ff';
    case  1: return '#9bffdb';
    case  2: return '#67ffb0';
    default: return '#cfe3ff';
  }
}

/* ----- OPEN POPUP helpers (with fallback & auto-pan) ----- */
function openMarkerPopup(markerOrId, maybeId){
  let marker = markerOrId, idStr = maybeId;
  if (typeof markerOrId === 'string'){
    idStr = markerOrId;
    marker = markers.get(idStr);
  }
  if (!marker) return;

  // Primary: open bound popup
  try {
    marker.openPopup();
    const ll = marker.getLatLng();
    try { map.panInside(ll, { paddingTopLeft:[30,50], paddingBottomRight:[30,50] }); } catch {}
    return;
  } catch {}

  // Fallback: create a popup at the point if something blocks the bound one
  const p = byId.get(idStr);
  if (p){
    L.popup({
      autoPan:true, autoClose:false, closeButton:true, keepInView:true,
      maxWidth:280, autoPanPaddingTopLeft:[30,50], autoPanPaddingBottomRight:[30,50],
      className:'mm-popup'
    }).setLatLng([p.lat, p.lng]).setContent(popupHTML(p)).openOn(map);
  }
}

function nearestMarker(latlng, pxTol=26){
  let best=null, bestD=Infinity;
  const p0 = map.latLngToLayerPoint(latlng);
  markers.forEach(m=>{
    const d = p0.distanceTo(map.latLngToLayerPoint(m.getLatLng()));
    if(d<bestD){ bestD=d; best=m; }
  });
  return bestD<=pxTol ? best : null;
}

/* ---------------- connections (numeric mood) ---------------- */
function buildConnections(){
  lineLayer.clearLayers();
  if(!toggleConnections?.checked) return;

  const R = Number(radiusInput?.value || 120);
  const MAX = 1500;
  const N = Math.min(pulses.length, MAX);
  const ok = p => !(p.connect === false || p.allow_connect === false || p.connect_consent === false);

  for(let i=0;i<N;i++){
    const A = pulses[i]; if(!ok(A)) continue;
    const aMood = mVal(A.mood);
    const latKm = 111.32, lonKmA = Math.max(0.1, 111.32*Math.abs(Math.cos(toRad(A.lat))));
    for(let j=i+1;j<N;j++){
      const B = pulses[j]; if(!ok(B)) continue;
      if (aMood !== mVal(B.mood)) continue;

      const dLatKm = Math.abs(A.lat-B.lat)*latKm; if(dLatKm>R) continue;
      const lonKmB = Math.max(0.1, 111.32*Math.abs(Math.cos(toRad(B.lat))));
      const dLonKm = Math.abs(A.lng-B.lng)*((lonKmA+lonKmB)/2); if(dLonKm>R) continue;

      if(kmBetween({lat:A.lat,lng:A.lng},{lat:B.lat,lng:B.lng})<=R){
        L.polyline([[A.lat,A.lng],[B.lat,B.lng]],{
          color:moodColor(aMood), opacity:.42, weight:2, interactive:false, renderer: lineRenderer
        }).addTo(lineLayer);
      }
    }
  }
}

/* ---------------- heat ---------------- */
function updateHeat(){
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
  if (!toggleHeat?.checked) return;
  const pts = pulses.map(p => [p.lat, p.lng, 0.30 + 0.70*(Math.abs(mVal(p.mood))+1)/3]);
  if (pts.length){
    heatLayer = L.heatLayer(pts, { radius:22, blur:18, maxZoom:11, minOpacity:.2 });
    heatLayer.addTo(map);
  }
}

/* ---------------- create & owner-only delete (unchanged) ---------------- */
submitMood?.addEventListener('click', postPulse);

async function postPulse(){
  if (selectedMood===null || !selectedSpot) return toast(I18N[LANG].pickSpot);
  submitMood.disabled = true;
  try{
    const body = {
      mood:selectedMood, note:(note?.value||'').slice(0,280),
      lat:selectedSpot.lat, lng:selectedSpot.lng,
      connect:!!connectConsent?.checked, ownerKey
    };
    const res = await fetch('/api/pulses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!res.ok) throw new Error(`POST /api/pulses ${res.status}`);
    const created = await res.json();
    const cid = asId(created?.id);
    owned.add(cid); localStorage.setItem('mmOwnedIds', JSON.stringify([...owned]));
    pulses.unshift(created); renderPulses(); shareLinkBtn && (shareLinkBtn.disabled=false);
    toast(I18N[LANG].pulsed);
  }catch(e){ console.error(e); toast(I18N[LANG].postFail); }
  finally{ submitMood.disabled=false; }
}

function popupHTML(p){
  const T = I18N[LANG];
  const moodName = ({'-2':T.veryLow,'-1':T.low,'0':T.neutral,'1':T.good,'2':T.great})[String(mVal(p.mood))] || 'mood';
  const raw = p.note ?? p.text ?? p.message ?? p.content ?? p.body ?? p.desc ?? '';
  const noteHtml = raw ? `<div style="margin-top:6px;color:#cfe3ff">${esc(String(raw))}</div>` : '';
  const delBtn = (owned.has(asId(p.id)))
    ? `<button class="mm-del" data-id="${esc(asId(p.id))}"
         style="padding:6px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);
                background:#2a3f66;color:#fff;cursor:pointer;">${esc(T.del)}</button>`
    : '';
  return `<div style="min-width:210px">
            <div style="font-weight:800">${esc(moodName)}</div>
            ${noteHtml}
            <div style="display:flex;gap:8px;margin-top:10px;">${delBtn}</div>
          </div>`;
}
function attachPopupHandlers(popup, idStr){
  const root = popup?.getElement ? popup.getElement() : popup?._container;
  if (!root) return;
  const btn = root.querySelector(`.mm-del[data-id="${CSS.escape(idStr)}"]`);
  if (btn) btn.onclick = ()=>deletePulse(idStr);
}
async function deletePulse(idStr){
  if (!owned.has(idStr)) return;
  try{
    const res = await fetch(`/api/pulses/${encodeURIComponent(idStr)}`, { method:'DELETE', headers:{ 'X-Owner': ownerKey } });
    if (res.ok){ removePulse(idStr); return toast(I18N[LANG].delOK); }
    throw new Error(`DELETE ${res.status}`);
  }catch(e){
    hidden.add(idStr); localStorage.setItem('mmHidden', JSON.stringify([...hidden]));
    removePulse(idStr); toast(I18N[LANG].hidden);
  }
}
function removePulse(idStr){
  const m = markers.get(idStr); if (m){ clusterLayer.removeLayer(m); markers.delete(idStr); }
  pulses = pulses.filter(p=>asId(p.id)!==idStr);
  buildConnections(); updateHeat();
  liveCount && (liveCount.textContent = `Now: ${pulses.length} pulses`);
  map.closePopup();
}

/* ---------------- share ---------------- */
shareLinkBtn?.addEventListener('click', async ()=>{
  const url = location.origin;
  try{
    if (navigator.share) await navigator.share({ title:'Micromoon', text:'Under the same sky.', url });
    else { await navigator.clipboard.writeText(url); toast(I18N[LANG].linkCopied); }
  }catch{
    try{ await navigator.clipboard.writeText(url);}catch{}
    toast(I18N[LANG].linkCopied);
  }
});

/* ---------------- sparkline + starfield ---------------- */
function drawSparkline(){
  if (!spark?.getContext) return;
  const ctx = spark.getContext('2d'), W = spark.width, H = spark.height;
  ctx.clearRect(0,0,W,H);
  const now = Date.now(), bins = new Array(24).fill(0);
  for(const p of pulses){
    const t = Date.parse(p.created_at || p.createdAt || p.created || ''); if (!isFinite(t)) continue;
    const diffH = Math.max(0, Math.min(23, Math.floor((now - t)/3600000)));
    bins[23-diffH]++;
  }
  const max = Math.max(1, ...bins), pad = 2, step = (W - pad*2) / (bins.length - 1);
  ctx.lineWidth = 2; ctx.strokeStyle = '#b6d3ff'; ctx.beginPath();
  bins.forEach((v,i)=>{ const x = pad + i*step, y = H - (H-2) * (v/max); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.stroke();
}
(function starfield(){
  const c = $('#stars'); if(!c) return;
  const ctx = c.getContext('2d'); let W,H,stars=[];
  function resize(){ W=c.width=innerWidth*devicePixelRatio; H=c.height=innerHeight*devicePixelRatio; make(); }
  function make(){ const n = Math.floor((innerWidth*innerHeight)/12000);
    stars = Array.from({length:n},()=>({ x:Math.random()*W, y:Math.random()*H, r:(Math.random()*1.2+0.2)*devicePixelRatio, s:Math.random()*0.6+0.2 })); }
  function step(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='white';
    for(const s of stars){ ctx.globalAlpha=s.s; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); s.y += 0.02*devicePixelRatio; if(s.y>H) s.y=-5; }
    requestAnimationFrame(step); }
  resize(); addEventListener('resize',resize); step();
})();

/* ---------------- refresh loop ---------------- */
async function loopRefresh(){ while(true){ await sleep(60000); await refreshPulses(); } }

/* ---------------- init ---------------- */
radiusValue && (radiusValue.textContent = `${radiusInput?.value ?? 120}km`);
refreshPulses();
loopRefresh().catch(()=>{});
