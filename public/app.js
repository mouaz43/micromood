/* global L, io */
const socket = io();

/* =========================
   i18n dictionary (EN, DE, ES, FR, AR, RU, ZH)
========================= */
const I18N = {
  phrase: {
    en: "The same moon looks down on all of us and knows our hidden feelings. On Micromoon those feelings become lights on a shared map, glowing for one day before they fade back into the night.",
    de: "Der gleiche Mond blickt auf uns alle und kennt unsere verborgenen Gefühle. Auf Micromoon werden diese Gefühle zu Lichtern auf einer gemeinsamen Karte, die einen Tag lang leuchten, bevor sie wieder in der Nacht verblassen.",
    es: "La misma luna nos mira a todos y conoce nuestros sentimientos ocultos. En Micromoon esos sentimientos se convierten en luces sobre un mapa compartido, que brillan durante un día antes de desvanecerse de nuevo en la noche.",
    fr: "La même lune nous regarde tous et connaît nos sentiments cachés. Sur Micromoon, ces sentiments deviennent des lumières sur une carte partagée, qui brillent pendant une journée avant de se fondre à nouveau dans la nuit.",
    ar: "القمر نفسه يطل علينا جميعًا ويعرف مشاعرنا الخفية. في ميكرومون تتحول هذه المشاعر إلى أضواء على خريطة مشتركة، تلمع ليوم واحد قبل أن تتلاشى من جديد في الليل.",
    ru: "Одна и та же луна смотрит на всех нас и знает наши скрытые чувства. На Micromoon эти чувства становятся огоньками на общей карте, сияют один день и затем вновь растворяются в ночи.",
    zh: "同一轮月亮俯瞰着我们，懂得我们隐藏的情绪。在 Micromoon，这些情绪会化作共享地图上的点点灯光，只亮一天，然后再次隐入夜色。"
  },
  tagline: {
    en: "Micromoon — anonymous, 24-hour moods",
    de: "Micromoon — anonym, 24-Stunden-Stimmungen",
    es: "Micromoon — estados de ánimo anónimos de 24 horas",
    fr: "Micromoon — humeurs anonymes sur 24 heures",
    ar: "ميكرومون — مشاعر مجهولة لمدة 24 ساعة",
    ru: "Micromoon — анонимные настроения на 24 часа",
    zh: "Micromoon — 匿名心情，保留 24 小时"
  },
  ui: {
    pulseYourMood: { en:"Pulse your mood", de:"Teile deine Stimmung", es:"Comparte tu estado", fr:"Partage ton humeur", ar:"شارك شعورك", ru:"Поделитесь настроением", zh:"发送你的心情" },
    howDoYouFeel: { en:"How do you feel?", de:"Wie fühlst du dich?", es:"¿Cómo te sientes?", fr:"Comment te sens-tu ?", ar:"كيف تشعر؟", ru:"Как вы себя чувствуете?", zh:"你感觉如何？" },
    whatsHappening: { en:"What’s happening?", de:"Was passiert gerade?", es:"¿Qué está pasando?", fr:"Que se passe-t-il ?", ar:"ماذا يحدث الآن؟", ru:"Что происходит?", zh:"此刻发生了什么？" },
    optional: { en:"(optional, 280 chars)", de:"(optional, 280 Zeichen)", es:"(opcional, 280 caracteres)", fr:"(optionnel, 280 caractères)", ar:"(اختياري، 280 حرفًا)", ru:"(необязательно, 280 символов)", zh:"（可选，最多 280 字）" },
    useMyLocation: { en:"Use my location", de:"Meinen Standort verwenden", es:"Usar mi ubicación", fr:"Utiliser ma position", ar:"استخدم موقعي", ru:"Использовать мое местоположение", zh:"使用我的位置" },
    orClickMap: { en:"or click on the map", de:"oder klicke auf die Karte", es:"o haz clic en el mapa", fr:"ou clique sur la carte", ar:"أو اضغط على الخريطة", ru:"или нажмите на карту", zh:"或在地图上点击" },
    allowConnect: { en:"Allow others to connect my dot", de:"Erlaube, meinen Punkt zu verbinden", es:"Permitir que otros conecten mi punto", fr:"Permettre aux autres de relier mon point", ar:"اسمح للآخرين بربط نقطتي", ru:"Разрешить другим соединять мою точку", zh:"允许他人与我的点连接" },
    pulse: { en:"Pulse", de:"Senden", es:"Enviar", fr:"Envoyer", ar:"إرسال", ru:"Отправить", zh:"发送" },
    postsInfo: {
      en:"Posts are anonymous and visible for 24 hours, then disappear.",
      de:"Beiträge sind anonym und verschwinden nach 24 Stunden.",
      es:"Las publicaciones son anónimas y visibles durante 24 horas; luego desaparecen.",
      fr:"Les publications sont anonymes et visibles pendant 24 heures, puis disparaissent.",
      ar:"المنشورات مجهولة وتظهر لمدة 24 ساعة ثم تختفي.",
      ru:"Публикации анонимны и видны 24 часа, затем исчезают.",
      zh:"发布匿名显示 24 小时后消失。"
    },
    connectSimilar: { en:"Connect similar moods", de:"Ähnliche Stimmungen verbinden", es:"Conectar estados similares", fr:"Relier des humeurs similaires", ar:"ربط المشاعر المتشابهة", ru:"Соединять похожие настроения", zh:"连接相似心情" },
    radius: { en:"Radius", de:"Radius", es:"Radio", fr:"Rayon", ar:"نطاق", ru:"Радиус", zh:"半径" },
    window: { en:"Window", de:"Zeitfenster", es:"Ventana", fr:"Fenêtre", ar:"المدّة", ru:"Окно", zh:"时间窗" },
    hours24: { en:"24h", de:"24h", es:"24h", fr:"24h", ar:"24 ساعة", ru:"24ч", zh:"24 小时" },
    hours12: { en:"12h", de:"12h", es:"12h", fr:"12h", ar:"12 ساعة", ru:"12ч", zh:"12 小时" },
    hours6:  { en:"6h",  de:"6h",  es:"6h",  fr:"6h",  ar:"6 ساعات", ru:"6ч",  zh:"6 小时" },
    noNote: { en:"<em>No note</em>", de:"<em>Keine Notiz</em>", es:"<em>Sin nota</em>", fr:"<em>Pas de note</em>", ar:"<em>بدون ملاحظة</em>", ru:"<em>Без заметки</em>", zh:"<em>无备注</em>" },
    moodLabel: {
      '-2': { en:"Very low", de:"Sehr schlecht", es:"Muy bajo", fr:"Très bas", ar:"منخفض جدًا", ru:"Очень низкое", zh:"很差" },
      '-1': { en:"Low",      de:"Schlecht",      es:"Bajo",    fr:"Bas",     ar:"منخفض",     ru:"Низкое",     zh:"较差" },
      '0':  { en:"Neutral",  de:"Neutral",       es:"Neutro",  fr:"Neutre",  ar:"محايد",     ru:"Нейтральное", zh:"一般" },
      '1':  { en:"Good",     de:"Gut",           es:"Bien",    fr:"Bien",    ar:"جيد",       ru:"Хорошее",    zh:"不错" },
      '2':  { en:"Great",    de:"Sehr gut",      es:"Genial",  fr:"Très bien", ar:"رائع",     ru:"Отличное",   zh:"很好" }
    }
  }
};

// Helpers
function getLang() {
  const saved = localStorage.getItem('mm_lang');
  if (saved) return saved;
  const nav = navigator.language || '';
  if (nav.startsWith('de')) return 'de';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('ar')) return 'ar';
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}
function setLang(lang) {
  localStorage.setItem('mm_lang', lang);
  applyLang();
}
function t(map) {
  const lang = getLang();
  return (map && (map[lang] ?? map.en)) || '';
}
function setDirLangAttributes() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
}

/* =========================
   Apply i18n to UI
========================= */
const deepPhraseEl = document.getElementById('deepPhrase');
const taglineEl = document.getElementById('tagline');
const langButtons = Array.from(document.querySelectorAll('.lang-btn'));

const LBL = {
  pulseTitle: document.getElementById('ui-pulseTitle'),
  howFeel: document.getElementById('ui-howFeel'),
  whatsHappening: document.getElementById('ui-whatsHappening'),
  optional: document.getElementById('ui-optional'),
  orClickMap: document.getElementById('ui-orClickMap'),
  allowConnect: document.getElementById('ui-allowConnect'),
  postsInfo: document.getElementById('ui-postsInfo'),
  connectSimilar: document.getElementById('ui-connectSimilar'),
  radius: document.getElementById('ui-radius'),
  window: document.getElementById('ui-window'),
  h24: document.getElementById('ui-24h'),
  h12: document.getElementById('ui-12h'),
  h6:  document.getElementById('ui-6h'),
  submit: document.getElementById('submitMood'),
  useMyLocation: document.getElementById('useMyLocation')
};

function applyLang() {
  setDirLangAttributes();

  deepPhraseEl.textContent = t(I18N.phrase);
  taglineEl.textContent = t(I18N.tagline);

  LBL.pulseTitle.textContent = t(I18N.ui.pulseYourMood);
  LBL.howFeel.textContent = t(I18N.ui.howDoYouFeel);
  LBL.whatsHappening.textContent = t(I18N.ui.whatsHappening);
  LBL.optional.textContent = " " + t(I18N.ui.optional);
  LBL.orClickMap.textContent = t(I18N.ui.orClickMap);
  LBL.allowConnect.textContent = t(I18N.ui.allowConnect);
  LBL.postsInfo.textContent = t(I18N.ui.postsInfo);
  LBL.connectSimilar.textContent = t(I18N.ui.connectSimilar);
  LBL.radius.textContent = t(I18N.ui.radius);
  LBL.window.textContent = t(I18N.ui.window);
  LBL.h24.textContent = t(I18N.ui.hours24);
  LBL.h12.textContent = t(I18N.ui.hours12);
  LBL.h6.textContent  = t(I18N.ui.hours6);
  LBL.submit.textContent = t(I18N.ui.pulse);
  LBL.useMyLocation.textContent = t(I18N.ui.useMyLocation);

  // Highlight active language button
  const active = getLang();
  langButtons.forEach(btn => {
    const isActive = btn.dataset.lang === active;
    btn.style.background = isActive ? 'rgba(255,255,255,0.18)' : '';
  });
}

langButtons.forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// Initial
applyLang();

/* =========================
   Starfield background (unchanged look)
========================= */
const starCanvas = document.getElementById('stars');
const ctx = starCanvas.getContext('2d');
let stars = [];
function resizeStars() {
  starCanvas.width = innerWidth;
  starCanvas.height = innerHeight;
  stars = Array.from({ length: Math.min(600, Math.floor((starCanvas.width*starCanvas.height)/6500)) }, () => ({
    x: Math.random()*starCanvas.width,
    y: Math.random()*starCanvas.height,
    z: Math.random()*1 + 0.5,
    w: Math.random()*2 + 0.5
  }));
}
addEventListener('resize', resizeStars);
resizeStars();
(function loop(){
  ctx.clearRect(0,0,starCanvas.width, starCanvas.height);
  const t = performance.now()/1000;
  for (const s of stars) {
    const a = 0.5 + Math.sin((s.x+s.y+t)*s.z)*0.3;
    const b = Math.floor(180 + 55*Math.sin(t*0.12 + s.x*0.001));
    ctx.fillStyle = `rgba(${215},${230},${b},${a})`;
    ctx.fillRect(s.x, s.y, s.w, s.w);
  }
  requestAnimationFrame(loop);
})();

/* =========================
   Map + existing UI logic (as before)
========================= */
const map = L.map('map', { zoomControl: false }).setView([20, 0], 2);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const noteEl = document.getElementById('note');
const chosenSpot = document.getElementById('chosenSpot');
const submitMood = document.getElementById('submitMood');
const connectConsent = document.getElementById('connectConsent');
const toggleConnections = document.getElementById('toggleConnections');
const radiusKm = document.getElementById('radiusKm');
const radiusValue = document.getElementById('radiusValue');
const windowHours = document.getElementById('windowHours');
const toggleHeat = document.getElementById('toggleHeat');
const toggleCluster = document.getElementById('toggleCluster');
const shareLinkBtn = document.getElementById('shareLink');
const moodPicker = document.getElementById('moodPicker');

const toastHost = document.getElementById('toastHost');
function toast(msg, ms=2500) {
  const el = document.createElement('div'); el.className='toast'; el.innerHTML=msg;
  toastHost.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .3s, transform .3s'; el.style.opacity='0'; el.style.transform='translateY(-6px)'; setTimeout(()=>el.remove(),320); }, ms);
}

const crosshair = document.getElementById('crosshair');
const toggleCrosshairBtn = document.getElementById('toggleCrosshair');
let crosshairOn = false;
toggleCrosshairBtn.addEventListener('click', () => {
  crosshairOn = !crosshairOn;
  crosshair.classList.toggle('hidden', !crosshairOn);
  toast(crosshairOn ? 'Crosshair on: arrows to move, Enter to select' : 'Crosshair off');
});
addEventListener('keydown', (e) => {
  if (!crosshairOn) return;
  const step = deg => deg * (1/Math.pow(2, map.getZoom())) * 10;
  let c = map.getCenter();
  if (e.key === 'ArrowUp') c.lat += step(.2);
  if (e.key === 'ArrowDown') c.lat -= step(.2);
  if (e.key === 'ArrowLeft') c.lng -= step(.2);
  if (e.key === 'ArrowRight') c.lng += step(.2);
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); map.setView(c, map.getZoom(), { animate:false }); }
  if (e.key === 'Enter') { selectedPos = { lat:c.lat, lng:c.lng }; chosenSpot.textContent = `Selected: ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`; updateSubmitState(); toast('Spot selected at crosshair'); }
});

let selectedMood = null;
let selectedPos = null;
let submitCooldown = 0;

moodPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  for (const b of moodPicker.querySelectorAll('button')) b.classList.remove('active');
  btn.classList.add('active');
  selectedMood = parseInt(btn.dataset.mood, 10);
  updateSubmitState();
});

document.getElementById('useMyLocation').addEventListener('click', () => {
  if (!navigator.geolocation) return toast('Geolocation not supported');
  navigator.geolocation.getCurrentPosition((p) => {
    const { latitude, longitude } = p.coords;
    selectedPos = { lat: latitude, lng: longitude };
    map.setView([latitude, longitude], 13);
    chosenSpot.textContent = `Selected: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    updateSubmitState();
  }, () => toast('Could not get your location, click the map instead'));
});

map.on('click', (e) => {
  selectedPos = { lat: e.latlng.lat, lng: e.latlng.lng };
  chosenSpot.textContent = `Selected: ${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}`;
  updateSubmitState();
});

function updateSubmitState() {
  submitMood.disabled = !(selectedMood !== null && selectedPos) || submitCooldown > 0;
}

radiusKm.addEventListener('input', () => { radiusValue.textContent = `${radiusKm.value}km`; drawConnections(); });
windowHours.addEventListener('change', () => { fetchMoods(); });
toggleConnections.addEventListener('change', drawConnections);

const urlRe = /(https?:\/\/|www\.)\S+/i;
const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const badWords = ["fuck","shit","bitch","asshole"];

let lastPosted = null;
shareLinkBtn.addEventListener('click', async () => {
  if (!lastPosted) return;
  const url = new URL(location.href);
  url.searchParams.set('center', `${lastPosted.lat.toFixed(5)},${lastPosted.lng.toFixed(5)}`);
  url.searchParams.set('z', '13');
  try { await navigator.clipboard.writeText(url.toString()); toast('Share link copied!'); }
  catch { toast('Share link: ' + url.toString(), 4000); }
});

submitMood.addEventListener('click', async () => {
  if (submitCooldown > 0) return;
  const note = noteEl.value.trim().slice(0, 280);
  if (urlRe.test(note) || emailRe.test(note)) return toast('Notes cannot include links or emails');
  if (badWords.some(w => note.toLowerCase().includes(w))) return toast('Please keep it kind ♥');

  submitMood.disabled = true;
  const payload = { lat: selectedPos.lat, lng: selectedPos.lng, mood: selectedMood, text: note, connectConsent: connectConsent.checked };
  try {
    const res = await fetch('/api/moods', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    if (res.status === 429) return toast('You’re posting too fast. Try again later.');
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed');
    lastPosted = json.data; shareLinkBtn.disabled = false; noteEl.value = '';
    toast('Mood sent ✨');
    submitCooldown = 10;
    const int = setInterval(() => { submitCooldown--; updateSubmitState(); if (submitCooldown <= 0) clearInterval(int); }, 1000);
  } catch (e) {
    toast('Could not post your mood. Please try later.');
    console.error(e);
  } finally { updateSubmitState(); }
});

/* Layers */
let entries = [];
const markersLayer = L.layerGroup().addTo(map);
const connectionsLayer = L.layerGroup().addTo(map);
const clusterLayer = L.markerClusterGroup({ disableClusteringAtZoom: 9 });
let heatLayer = null;
toggleHeat.addEventListener('change', refreshLayers);
toggleCluster.addEventListener('change', refreshLayers);

function colorForMood(m){ return {'-2':'#ef4444','-1':'#f59e0b','0':'#a3a3a3','1':'#34d399','2':'#60a5fa'}[m.toString()]; }
function opacityByAge(createdAt) {
  const hours = parseInt(windowHours.value, 10);
  const age = Date.now() - new Date(createdAt).getTime();
  const win = hours * 3600 * 1000;
  const r = Math.max(0, Math.min(1, age / win));
  return 0.85 - 0.7 * r;
}
function dotIcon(color, op) {
  const el = document.createElement('div'); el.className = 'mm-dot'; el.style.background = color; el.style.color = color; el.style.opacity = op;
  return L.divIcon({ html: el, className: '', iconSize: [14,14] });
}
function addPointToLayers(e) {
  const c = colorForMood(e.mood);
  const op = opacityByAge(e.created_at);
  const marker = L.marker([e.lat, e.lng], { icon: dotIcon(c, op) }).bindPopup(() => {
    const t0 = new Date(e.created_at);
    const ago = Math.max(1, Math.round((Date.now()-t0.getTime())/60000));
    const safe = (e.text || '').replace(/[<>]/g, '');
    const label = I18N.ui.moodLabel[e.mood.toString()];
    return `<div style="min-width:200px">
      <div style="font-weight:700; margin-bottom:4px">${t(label)}</div>
      <div style="opacity:.85;">${safe || t(I18N.ui.noNote)}</div>
      <div style="opacity:.6; margin-top:6px; font-size:12px">${ago} min</div>
    </div>`;
  });
  if (toggleCluster.checked) clusterLayer.addLayer(marker); else markersLayer.addLayer(marker);
}
function clearVisualLayers() {
  markersLayer.clearLayers(); connectionsLayer.clearLayers(); clusterLayer.clearLayers();
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
}
function drawHeat() {
  if (!toggleHeat.checked) return;
  const pts = entries.map(e => [e.lat, e.lng, 0.5 + (e.mood+2)*0.125]);
  heatLayer = L.heatLayer(pts, { radius: 18, blur: 30, maxZoom: 9, minOpacity: 0.2 }).addTo(map);
}
function haversineKm(a,b){const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lng-a.lng);const lat1=toRad(a.lat),lat2=toRad(b.lat);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function drawConnections(){
  connectionsLayer.clearLayers();
  if (!toggleConnections.checked) return;
  const R = parseInt(radiusKm.value, 10);
  const allowed = entries.filter(e => e.connect_consent);
  const byMood = allowed.reduce((acc, e) => ((acc[e.mood]??=[]).push(e), acc), {});
  for (const m in byMood) {
    const g = byMood[m];
    for (let i=0;i<g.length;i++){
      for (let j=i+1;j<g.length;j++){
        const a=g[i], b=g[j];
        if (haversineKm(a,b) <= R) {
          L.polyline([[a.lat,a.lng],[b.lat,b.lng]], {
            color: colorForMood(a.mood),
            weight: 1,
            opacity: 0.45 * Math.min(opacityByAge(a.created_at), opacityByAge(b.created_at))
          }).addTo(connectionsLayer);
        }
      }
    }
  }
}
function refreshLayers(){
  clearVisualLayers();
  for (const e of entries) addPointToLayers(e);
  if (toggleCluster.checked && !map.hasLayer(clusterLayer)) map.addLayer(clusterLayer);
  if (!toggleCluster.checked && map.hasLayer(clusterLayer)) map.removeLayer(clusterLayer);
  drawConnections(); drawHeat();
}

/* Data & realtime */
function centerFromUrl(){
  const u = new URL(location.href);
  const c = u.searchParams.get('center'); const z = parseInt(u.searchParams.get('z')||'0',10);
  if (c) { const [lat,lng] = c.split(',').map(Number); if (isFinite(lat)&&isFinite(lng)) map.setView([lat,lng], isFinite(z)&&z>0?z:13); }
}
async function fetchMoods() {
  try {
    const hours = windowHours.value;
    const res = await fetch(`/api/moods?sinceHours=${hours}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed');
    entries = json.data;
    refreshLayers();
  } catch (e) { console.error(e); }
}
centerFromUrl();
fetchMoods();
setInterval(fetchMoods, 60 * 1000);

socket.on('new_mood', (e) => {
  const sinceMs = parseInt(windowHours.value, 10) * 3600 * 1000;
  if (Date.now() - new Date(e.created_at).getTime() > sinceMs) return;
  entries.unshift(e);
  addPointToLayers(e);
  drawConnections();
  if (toggleHeat.checked && heatLayer) { map.removeLayer(heatLayer); heatLayer=null; drawHeat(); }
});
