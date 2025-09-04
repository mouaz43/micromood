/* =========================================================================
   Micromoon — Front-end Map Logic (drop-in)
   - Mobile taps on markers (canvas renderer + big invisible hit stroke + touchend)
   - Owner-only delete (local ownerKey + owned IDs; X-Owner header fallback)
   - Same-mood connections with consent (Haversine + radius)
   - Heatmap + clusters; i18n; sparkline; crosshair; periodic refresh
   - Layout equalization for control cards
   - NO HTML changes
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
const toastHost = $('#toastHost');
const mapEl = $('#map');

/* ---------------- toast ---------------- */
function toast(txt, ms=2400){
  const el = document.createElement('div');
  el.style.cssText = `
    padding:10px 14px;border:1px solid rgba(255,255,255,.18);
    background:rgba(14,30,60,.92);backdrop-filter:blur(8px);
    border-radius:12px;color:#eaf1ff;font-weight:800;
    box-shadow:0 10px 28px rgba(0,0,0,.45); transform:translateY(6px);
    transition:.25s ease; max-width:92vw; text-align:center;
  `;
  el.textContent = txt;
  toastHost.appendChild(el);
  requestAnimationFrame(()=>{ el.style.transform='translateY(0)'; el.style.opacity='1'; });
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(-6px)'; setTimeout(()=>el.remove(),250); }, ms);
}

/* ---------------- i18n ---------------- */
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
  es:{ phrase:[
      'La misma luna nos mira a todos y conoce nuestros sentimientos ocultos.',
      'En Micromoon esos sentimientos se vuelven luces en un mapa compartido; brillan un día y vuelven a la noche.'
    ],
    pulseTitle:'Pulsa tu ánimo', howFeel:'¿Cómo te sientes?', happening:'¿Qué pasa?',
    optional:'(opcional, 280 caracteres)', orClick:'o toca el mapa',
    allowConnect:'Permitir conectar mi punto',
    postsInfo:'Las publicaciones son anónimas y visibles por 24 horas.',
    window:'Ventana', radius:'Radio',
    veryLow:'muy bajo', low:'bajo', neutral:'neutral', good:'bien', great:'genial',
    pulsed:'Enviado ✨', loadFail:'No se pudieron cargar los puntos', postFail:'No se pudo enviar',
    del:'Eliminar', hidden:'Oculto en este dispositivo', delOK:'Punto eliminado',
    tooMany:'Demasiados puntos para conectar con fluidez. Acerca el mapa o reduce la ventana.',
    pickSpot:'Elige estado y lugar', linkCopied:'Enlace copiado'
  },
  fr:{ phrase:[
      'La même lune nous regarde tous et connaît nos sentiments cachés.',
      'Sur Micromoon ces sentiments deviennent des lumières sur une carte commune, elles brillent un jour puis retournent à la nuit.'
    ],
    pulseTitle:'Pulse ton humeur', howFeel:'Comment te sens-tu ?', happening:'Que se passe-t-il ?',
    optional:'(optionnel, 280 caractères)', orClick:'ou clique sur la carte',
    allowConnect:'Autoriser à relier mon point',
    postsInfo:'Les posts sont anonymes et visibles 24 h.',
    window:'Fenêtre', radius:'Rayon',
    veryLow:'très bas', low:'bas', neutral:'neutre', good:'bien', great:'super',
    pulsed:'Envoyé ✨', loadFail:'Chargement impossible', postFail:'Envoi impossible',
    del:'Supprimer', hidden:'Masqué sur cet appareil', delOK:'Point supprimé',
    tooMany:'Trop de points pour relier correctement. Zoome ou réduis la fenêtre.',
    pickSpot:'Choisis un état et un lieu', linkCopied:'Lien copié'
  },
  ar:{ phrase:[
      'القمر نفسه يطل علينا جميعًا ويعرف مشاعرنا الخفية.',
      'على ميكرومون تتحول تلك المشاعر إلى أضواء على خريطة مشتركة، تتوهّج يومًا ثم تعود إلى الليل.'
    ],
    pulseTitle:'انشر مزاجك', howFeel:'كيف تشعر؟', happening:'ماذا يحدث؟',
    optional:'(اختياري، 280 حرفًا)', orClick:'أو اضغط على الخريطة',
    allowConnect:'السماح للآخرين بربط نقطتي',
    postsInfo:'المنشورات مجهولة وتبقى 24 ساعة ثم تختفي.',
    window:'المدة', radius:'نطاق',
    veryLow:'منخفض جدًا', low:'منخفض', neutral:'محايد', good:'جيد', great:'رائع',
    pulsed:'تم النشر ✨', loadFail:'تعذر تحميل النقاط', postFail:'تعذر النشر',
    del:'حذف', hidden:'مخفي على هذا الجهاز', delOK:'تم الحذف',
    tooMany:'نقاط كثيرة جدًا للربط بسلاسة. قرّب الخريطة أو قلّل المدة.',
    pickSpot:'اختر المزاج والمكان', linkCopied:'تم نسخ الرابط'
  },
  ru:{ phrase:[
      'Одна и та же луна смотрит на всех нас и знает наши скрытые чувства.',
      'На Micromoon эти чувства становятся огнями на общей карте: один день светят и тают в ночи.'
    ],
    pulseTitle:'Отправь настроение', howFeel:'Как ты себя чувствуешь?', happening:'Что происходит?',
    optional:'(необязательно, 280 символов)', orClick:'или нажми на карту',
    allowConnect:'Разрешить соединять мою точку',
    postsInfo:'Посты анонимны и видны 24 часа.',
    window:'Окно', radius:'Радиус',
    veryLow:'очень плохо', low:'плохо', neutral:'нейтр.', good:'хорошо', great:'отлично',
    pulsed:'Отправлено ✨', loadFail:'Не удалось загрузить точки', postFail:'Не удалось отправить',
    del:'Удалить', hidden:'Скрыто на этом устройстве', delOK:'Точка удалена',
    tooMany:'Слишком много точек для соединения. Уменьшите окно или приблизьте карту.',
    pickSpot:'Выбери настроение и место', linkCopied:'Ссылка скопирована'
  },
  zh:{ phrase:[
      '同一轮明月照着我们 也懂我们的隐秘心绪。',
      '在 Micromoon 这些心绪化作共享地图上的光点 只停留一天 随夜色淡去。'
    ],
    pulseTitle:'发布心情', howFeel:'你现在感觉如何？', happening:'发生了什么？',
    optional:'（可选，280 字）', orClick:'或在地图上点选',
    allowConnect:'允许他人与我的点连线',
    postsInfo:'匿名展示 24 小时后消失。',
    window:'时间窗', radius:'半径',
    veryLow:'很差', low:'较差', neutral:'一般', good:'不错', great:'很好',
    pulsed:'已发布 ✨', loadFail:'加载失败', postFail:'发布失败',
    del:'删除', hidden:'在此设备隐藏', delOK:'已删除',
    tooMany:'点位太多无法顺畅连线。请缩小时间窗或放大地图。',
    pickSpot:'请选择心情与地点', linkCopied:'已复制链接'
  }
};
let LANG = 'en';
function setLang(code){
  LANG = I18N[code] ? code : 'en';
  $$('.lang-btn').forEach(b=>b.classList.toggle('active', b.dataset.lang===LANG));
  document.documentElement.dir = (LANG==='ar' ? 'rtl' : 'ltr');
  const t = I18N[LANG];
  deepPhrase.innerHTML = t.phrase.map(s => `<span class="line"><span class="brand-gradient">${esc(s)}</span></span>`).join(' ');
  $('#ui-pulseTitle').textContent = t.pulseTitle;
  $('#ui-howFeel').textContent = t.howFeel;
  $('#ui-whatsHappening').textContent = t.happening;
  $('#ui-optional').textContent = t.optional;
  $('#ui-orClickMap').textContent = t.orClick;
  $('#ui-allowConnect').textContent = t.allowConnect;
  $('#ui-postsInfo').textContent = t.postsInfo;
  $('#ui-window').textContent = t.window;
  $('#ui-radius').textContent = t.radius;
}
langButtons.forEach(b=>b.addEventListener('click', ()=>setLang(b.dataset.lang)));
setLang('en');

/* ---------------- moon phase (approx) ---------------- */
(function(){
  const now = new Date(), syn = 29.530588853, ref = new Date(Date.UTC(2000,0,6,18,14));
  const age = ((now-ref)/86400000) % syn; const idx = Math.round(age/syn*8)%8;
  moonLabel.textContent = `Moon phase: ${['New','Waxing crescent','First quarter','Waxing gibbous','Full','Waning gibbous','Last quarter','Waning crescent'][idx]}`;
})();

/* ---------------- motion toggle ---------------- */
toggleMotion?.addEventListener('change', ()=>document.body.classList.toggle('reduce-motion', !!toggleMotion.checked));

/* ---------------- mobile detection & renderer ---------------- */
const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const HIT_STROKE = IS_TOUCH ? 36 : 18; // big invisible stroke for easy taps
const DOT_RADIUS = IS_TOUCH ? 11 : 8;
const touchRenderer = (typeof L !== 'undefined' && L.canvas) ? L.canvas({ tolerance: IS_TOUCH ? 12 : 6, padding: 0.25 }) : undefined;
const lineRenderer  = (typeof L !== 'undefined' && L.canvas) ? L.canvas({ padding: 0.25 }) : undefined;

/* ---------------- map setup ---------------- */
let map, clusterLayer, heatLayer, lineLayer;
let pulses = [];
const markers = new Map();
const hidden  = new Set(JSON.parse(localStorage.getItem('mmHidden')   || '[]'));
const owned   = new Set(JSON.parse(localStorage.getItem('mmOwnedIds') || '[]'));
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
    showCoverageOnHover:false, chunkedLoading:true,
    maxClusterRadius: IS_TOUCH ? 70 : 50, spiderfyOnMaxZoom:true, spiderfyOnEveryZoom:true, disableClusteringAtZoom:17
  });
  clusterLayer.on('clusterclick', a=>a.layer.spiderfy());
  map.addLayer(clusterLayer);

  lineLayer = L.layerGroup().addTo(map);

  map.on('click', e=>{
    selectedSpot = { lat: e.latlng.lat, lng: e.latlng.lng };
    chosenSpot.textContent = `${selectedSpot.lat.toFixed(4)}, ${selectedSpot.lng.toFixed(4)}`;
    submitMood.disabled = (selectedMood === null);
  });
})();

/* ---------------- selections & controls ---------------- */
let selectedMood = null;
let selectedSpot = null;

moodPicker.addEventListener('click', e=>{
  const b = e.target.closest('button[data-mood]'); if(!b) return;
  $$('#moodPicker button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); selectedMood = Number(b.dataset.mood);
  submitMood.disabled = !selectedSpot;
});

useMyLocationBtn.addEventListener('click', ()=>{
  if(!navigator.geolocation) return toast('Location not available');
  navigator.geolocation.getCurrentPosition(pos=>{
    selectedSpot = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.setView([selectedSpot.lat, selectedSpot.lng], 10);
    chosenSpot.textContent = `${selectedSpot.lat.toFixed(4)}, ${selectedSpot.lng.toFixed(4)}`;
    submitMood.disabled = (selectedMood === null);
  }, ()=>toast('Could not get location'));
});

toggleCrosshairBtn.addEventListener('click', ()=>$('#crosshair').classList.toggle('hidden'));

radiusInput.addEventListener('input', ()=>{
  radiusValue.textContent = `${radiusInput.value}km`;
  if (toggleConnections.checked) buildConnections();
});
windowHoursSel.addEventListener('change', ()=>refreshPulses());
toggleConnections.addEventListener('change', ()=>buildConnections());
toggleHeat.addEventListener('change', ()=>updateHeat());
toggleCluster.addEventListener('change', ()=>{
  if (toggleCluster.checked) { if (!map.hasLayer(clusterLayer)) map.addLayer(clusterLayer); }
  else { if (map.hasLayer(clusterLayer)) map.removeLayer(clusterLayer); }
});

/* ---------------- LAYOUT FIX: equalize cards + map offset ---------------- */
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
  if(mapEl){
    mapEl.style.marginTop = '16px';
    mapEl.style.display = 'block';
  }
}
note && (note.style.width = '100%');
const eqNow = ()=>requestAnimationFrame(equalizeCards);
window.addEventListener('resize', debounce(eqNow, 120));
document.addEventListener('DOMContentLoaded', eqNow);

/* ---------------- load & render ---------------- */
async function refreshPulses(){
  try{
    const hours = Number(windowHoursSel.value || 24);
    const res = await fetch(`/api/pulses?windowHours=${hours}`);
    if(!res.ok) throw new Error(`GET /api/pulses ${res.status}`);
    const arr = await res.json();
    pulses = (Array.isArray(arr) ? arr : []).filter(p => !hidden.has(p.id));
    renderPulses();
  }catch(e){ console.error(e); toast(I18N[LANG].loadFail); }
}

function renderPulses(){
  clusterLayer.clearLayers(); lineLayer.clearLayers();
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
  markers.clear();

  for(const p of pulses){
    // BIGGER TOUCH HITBOX: large invisible stroke; visual is controlled by fill
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: DOT_RADIUS,
      color: 'rgba(255,255,255,.22)',
      weight: HIT_STROKE,      // large stroke for hit testing
      opacity: 0,              // invisible stroke (keeps look clean)
      fillColor: moodColor(p.mood),
      fillOpacity: .95,
      renderer: touchRenderer,
      bubblingMouseEvents:false,
      keyboard:true
    });

    marker.bindPopup(popupHTML(p), { autoPan:true, closeButton:true, autoClose:false, keepInView:true });
    marker.on('click', () => marker.openPopup());
    marker.on('keypress', (e)=>{ if (e.originalEvent?.key === 'Enter') marker.openPopup(); });

    // Reliable mobile open: use touchend to avoid map click swallowing
    marker.on('touchend', ev=>{
      ev.originalEvent?.preventDefault?.();
      ev.originalEvent?.stopPropagation?.();
      marker.openPopup();
    });

    marker.on('popupopen', ()=>attachPopupHandlers(p.id));
    markers.set(p.id, marker);
    clusterLayer.addLayer(marker);
  }

  liveCount.textContent = `Now: ${pulses.length} pulses`;
  drawSparkline(); updateHeat();
  if (toggleConnections.checked) buildConnections();

  eqNow();
}

function moodColor(m){
  switch(Number(m)){
    case -2: return '#8ebeff';
    case -1: return '#b5ccff';
    case  0: return '#dee7ff';
    case  1: return '#9bffdb';
    case  2: return '#67ffb0';
    default: return '#cfe3ff';
  }
}

/* ---------------- connections ---------------- */
function buildConnections(){
  lineLayer.clearLayers();
  if(!toggleConnections.checked) return;

  const R = Number(radiusInput.value || 120);
  const MAX = 1400;
  const N = Math.min(pulses.length, MAX);
  const ok = p => !(p.connect === false || p.allow_connect === false || p.connect_consent === false);

  for(let i=0;i<N;i++){
    const A = pulses[i]; if(!ok(A)) continue;
    const latKm = 111.32, lonKmA = Math.max(0.1, 111.32*Math.abs(Math.cos(toRad(A.lat))));
    for(let j=i+1;j<N;j++){
      const B = pulses[j]; if(!ok(B) || A.mood!==B.mood) continue;

      // Quick bounds prune in km
      const dLatKm = Math.abs(A.lat-B.lat)*latKm; if(dLatKm>R) continue;
      const lonKmB = Math.max(0.1, 111.32*Math.abs(Math.cos(toRad(B.lat))));
      const dLonKm = Math.abs(A.lng-B.lng)*((lonKmA+lonKmB)/2); if(dLonKm>R) continue;

      if(kmBetween({lat:A.lat,lng:A.lng},{lat:B.lat,lng:B.lng})<=R){
        L.polyline([[A.lat,A.lng],[B.lat,B.lng]],{
          color:moodColor(A.mood), opacity:.38, weight:2, interactive:false, renderer: lineRenderer
        }).addTo(lineLayer);
      }
    }
  }
}

/* ---------------- heat ---------------- */
function updateHeat(){
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
  if (!toggleHeat.checked) return;
  const pts = pulses.map(p => [p.lat, p.lng, 0.30 + 0.70*(Math.abs(Number(p.mood))+1)/3]);
  if (pts.length){
    heatLayer = L.heatLayer(pts, { radius:22, blur:18, maxZoom:11, minOpacity:.2 });
    heatLayer.addTo(map);
  }
}

/* ---------------- create & owner-only delete ---------------- */
submitMood.addEventListener('click', postPulse);

async function postPulse(){
  if (selectedMood===null || !selectedSpot) return toast(I18N[LANG].pickSpot);
  submitMood.disabled = true;
  try{
    const body = {
      mood:selectedMood,
      note:(note.value||'').slice(0,280),
      lat:selectedSpot.lat, lng:selectedSpot.lng,
      connect:!!connectConsent.checked,
      ownerKey
    };
    const res = await fetch('/api/pulses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!res.ok) throw new Error(`POST /api/pulses ${res.status}`);
    const created = await res.json();
    if (created?.id != null) {
      owned.add(created.id);
      localStorage.setItem('mmOwnedIds', JSON.stringify([...owned]));
      pulses.unshift(created);
      renderPulses();
      shareLinkBtn && (shareLinkBtn.disabled=false);
      toast(I18N[LANG].pulsed);
    } else {
      throw new Error('No id in response');
    }
  }catch(e){ console.error(e); toast(I18N[LANG].postFail); }
  finally{ submitMood.disabled=false; }
}

function popupHTML(p){
  const T = I18N[LANG];
  const name = ({'-2':T.veryLow,'-1':T.low,'0':T.neutral,'1':T.good,'2':T.great})[String(p.mood)] || 'mood';
  const noteHtml = p.note ? `<div style="margin-top:6px;color:#cfe3ff">${esc(p.note)}</div>` : '';
  const delBtn = owned.has(p.id)
    ? `<button class="mm-del" data-id="${esc(String(p.id))}"
         style="padding:6px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);
                background:#2a3f66;color:#fff;cursor:pointer;">${esc(T.del)}</button>`
    : '';
  return `<div style="min-width:180px"><div style="font-weight:800">${esc(name)}</div>${noteHtml}<div style="display:flex;gap:8px;margin-top:10px;">${delBtn}</div></div>`;
}

function attachPopupHandlers(id){
  const btn = document.body.querySelector(`.mm-del[data-id="${CSS.escape(String(id))}"]`);
  if (btn) btn.onclick = ()=>deletePulse(id);
}

async function deletePulse(id){
  if (!owned.has(id)) return;
  try{
    const res = await fetch(`/api/pulses/${encodeURIComponent(id)}`, { method:'DELETE', headers:{ 'X-Owner': ownerKey } });
    if (res.ok){ removePulse(id); return toast(I18N[LANG].delOK); }
    throw new Error(`DELETE ${res.status}`);
  }catch(e){
    // If backend doesn't support delete, hide locally so the user experience is consistent
    hidden.add(id); localStorage.setItem('mmHidden', JSON.stringify([...hidden]));
    removePulse(id); toast(I18N[LANG].hidden);
  }
}

function removePulse(id){
  const m = markers.get(id); if (m){ clusterLayer.removeLayer(m); markers.delete(id); }
  pulses = pulses.filter(p=>p.id!==id);
  buildConnections(); updateHeat();
  liveCount.textContent = `Now: ${pulses.length} pulses`;
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

/* ---------------- sparkline ---------------- */
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

/* ---------------- subtle starfield ---------------- */
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
radiusValue.textContent = `${radiusInput.value}km`;
refreshPulses();
loopRefresh().catch(()=>{});
