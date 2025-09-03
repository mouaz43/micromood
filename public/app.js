/* global L, io */
const socket = io();

/* =========================
   Config & i18n
========================= */
const CONFIG = {
  authorName: "Mouaz Almjarkesh",
  phrase: {
    en: "We all live under one sky. Sometimes, we feel the same.",
    de: "Wir leben alle unter demselben Himmel. Manchmal fühlen wir dasselbe."
  },
  tagline: {
    en: "Micromood — anonymous, 24-hour moods",
    de: "Micromood — anonym, 24-Stunden-Stimmungen"
  },
  ui: {
    pulseYourMood: { en: "Pulse your mood", de: "Teile deine Stimmung" },
    howDoYouFeel: { en: "How do you feel?", de: "Wie fühlst du dich?" },
    whatsHappening: { en: "What’s happening?", de: "Was passiert gerade?" },
    optional: { en: "(optional, 280 chars)", de: "(optional, 280 Zeichen)" },
    useMyLocation: { en: "Use my location", de: "Meinen Standort verwenden" },
    orClickMap: { en: "or click on the map", de: "oder klicke auf die Karte" },
    allowConnect: { en: "Allow others to connect my dot", de: "Erlaube, meinen Punkt zu verbinden" },
    pulse: { en: "Pulse", de: "Senden" },
    postsInfo: { en: "Posts are anonymous and visible for 24 hours, then disappear.", de: "Beiträge sind anonym und verschwinden nach 24 Stunden." },
    connectSimilar: { en: "Connect similar moods", de: "Ähnliche Stimmungen verbinden" },
    radius: { en: "Radius", de: "Radius" },
    window: { en: "Window", de: "Zeitfenster" },
    hours24: { en: "24h", de: "24h" },
    hours12: { en: "12h", de: "12h" },
    hours6:  { en: "6h",  de: "6h"  },
    noNote: { en: "<em>No note</em>", de: "<em>Keine Notiz</em>" },
  },
  moodLabels: {
    '-2': { en: "Very low", de: "Sehr schlecht" },
    '-1': { en: "Low",      de: "Schlecht" },
    '0':  { en: "Neutral",  de: "Neutral" },
    '1':  { en: "Good",     de: "Gut" },
    '2':  { en: "Great",    de: "Sehr gut" }
  },
  // Simple moderation list (extend as you wish)
  badWords: ["fuck","shit","bitch","asshole"]
};

function getLang() {
  return localStorage.getItem('mm_lang') || (navigator.language?.startsWith('de') ? 'de' : 'en');
}
function setLang(lang) {
  localStorage.setItem('mm_lang', lang);
  applyLang();
}
function t(obj) { return obj[getLang()] || obj['en']; }

/* =========================
   Starfield background
========================= */
const starCanvas = document.getElementById('stars');
const ctx = starCanvas.getContext('2d');
let stars = [];
function resize() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = Array.from({ length: Math.min(500, Math.floor((starCanvas.width*starCanvas.height)/7000)) }, () => ({
    x: Math.random()*starCanvas.width,
    y: Math.random()*starCanvas.height,
    z: Math.random()*1 + 0.5,
    w: Math.random()*2
  }));
}
window.addEventListener('resize', resize);
resize();
function animateStars() {
  ctx.clearRect(0,0,starCanvas.width, starCanvas.height);
  const time = performance.now()/1000;
  for (const s of stars) {
    const alpha = 0.45 + Math.sin((s.x+s.y+time)*s.z)*0.3;
    const blueTint = Math.floor(180 + 50*Math.sin(time*0.1 + s.x*0.001));
    ctx.fillStyle = `rgba(${220},${230},${blueTint},${alpha})`;
    ctx.fillRect(s.x, s.y, s.w, s.w);
  }
  requestAnimationFrame(animateStars);
}
requestAnimationFrame(animateStars);

/* =========================
   Map
========================= */
const map = L.map('map', { zoomControl: false }).setView([20, 0], 2);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

/* =========================
   UI elements
========================= */
const moodPicker = document.getElementById('moodPicker');
const noteEl = document.getElementById('note');
const useMyLocation = document.getElementById('useMyLocation');
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

// i18n header/labels
const deepPhrase = document.getElementById('deepPhrase');
const tagline = document.getElementById('tagline');
const langEn = document.getElementById('langEn');
const langDe = document.getElementById('langDe');
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
};

function applyLang() {
  deepPhrase.textContent = t(CONFIG.phrase);
  tagline.textContent = t(CONFIG.tagline);
  LBL.pulseTitle.textContent = t(CONFIG.ui.pulseYourMood);
  LBL.howFeel.textContent = t(CONFIG.ui.howDoYouFeel);
  LBL.whatsHappening.textContent = t(CONFIG.ui.whatsHappening);
  LBL.optional.textContent = " " + t(CONFIG.ui.optional);
  useMyLocation.textContent = t(CONFIG.ui.useMyLocation);
  LBL.orClickMap.textContent = t(CONFIG.ui.orClickMap);
  LBL.allowConnect.textContent = t(CONFIG.ui.allowConnect);
  submitMood.textContent = t(CONFIG.ui.pulse);
  LBL.postsInfo.textContent = t(CONFIG.ui.postsInfo);
  LBL.connectSimilar.textContent = t(CONFIG.ui.connectSimilar);
  LBL.radius.textContent = t(CONFIG.ui.radius);
  LBL.window.textContent = t(CONFIG.ui.window);
  LBL.h24.textContent = t(CONFIG.ui.hours24);
  LBL.h12.textContent = t(CONFIG.ui.hours12);
  LBL.h6.textContent  = t(CONFIG.ui.hours6);
}
langEn.addEventListener('click', () => setLang('en'));
langDe.addEventListener('click', () => setLang('de'));
applyLang();

/* =========================
   Toast helper
========================= */
const toastHost = document.getElementById('toastHost');
function toast(msg, ms=2500) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = msg;
  toastHost.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 320);
  }, ms);
}

/* =========================
   Keyboard crosshair
========================= */
const crosshair = document.getElementById('crosshair');
const toggleCrosshairBtn = document.getElementById('toggleCrosshair');
let crosshairOn = false;
toggleCrosshairBtn.addEventListener('click', () => {
  crosshairOn = !crosshairOn;
  crosshair.classList.toggle('hidden', !crosshairOn);
  toast(crosshairOn ? 'Crosshair on: ↑ ↓ ← → to move, Enter to select' : 'Crosshair off');
});

window.addEventListener('keydown', (e) => {
  if (!crosshairOn) return;
  const step = (deg) => deg * (1 / Math.pow(2, map.getZoom())) * 10; // adaptive step
  let center = map.getCenter();
  if (e.key === 'ArrowUp')   { center.lat += step(0.2); }
  if (e.key === 'ArrowDown') { center.lat -= step(0.2); }
  if (e.key === 'ArrowLeft') { center.lng -= step(0.2); }
  if (e.key === 'ArrowRight'){ center.lng += step(0.2); }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
    map.setView(center, map.getZoom(), { animate: false });
  }
  if (e.key === 'Enter') {
    selectedPos = { lat: center.lat, lng: center.lng };
    chosenSpot.textContent = `Selected: ${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}`;
    updateSubmitState();
    toast('Spot selected at crosshair');
  }
});

/* =========================
   Composer interactions
========================= */
let selectedMood = null;
let selectedPos = null; // { lat, lng }
let submitCooldown = 0; // seconds

moodPicker.addEventListener('click', (e) => {
  if (e.target.closest('button')) {
    for (const btn of moodPicker.querySelectorAll('button')) btn.classList.remove('active');
    const btn = e.target.closest('button');
    btn.classList.add('active');
    selectedMood = parseInt(btn.dataset.mood, 10);
    updateSubmitState();
  }
});

useMyLocation.addEventListener('click', () => {
  if (!navigator.geolocation) return toast('Geolocation not supported');
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    selectedPos = { lat: latitude, lng: longitude };
    map.setView([latitude, longitude], 13);
    chosenSpot.textContent = `Selected: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    updateSubmitState();
  }, () => {
    toast('Could not get your location, click the map instead');
  });
});

map.on('click', (e) => {
  selectedPos = { lat: e.latlng.lat, lng: e.latlng.lng };
  chosenSpot.textContent = `Selected: ${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}`;
  updateSubmitState();
});

function updateSubmitState() {
  submitMood.disabled = !(selectedMood !== null && selectedPos) || submitCooldown > 0;
}

radiusKm.addEventListener('input', () => {
  radiusValue.textContent = `${radiusKm.value}km`;
  drawConnections();
});
windowHours.addEventListener('change', () => {
  fetchMoods();
});
toggleConnections.addEventListener('change', drawConnections);

/* =========================
   Moderation helpers
========================= */
const urlRe = /(https?:\/\/|www\.)\S+/i;
const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
function containsBadWords(text) {
  const lower = text.toLowerCase();
  return CONFIG.badWords.some(w => lower.includes(w));
}

/* =========================
   Share link
========================= */
let lastPosted = null;
shareLinkBtn.addEventListener('click', async () => {
  if (!lastPosted) return;
  const z = 13;
  const url = new URL(window.location.href);
  url.searchParams.set('center', `${lastPosted.lat.toFixed(5)},${lastPosted.lng.toFixed(5)}`);
  url.searchParams.set('z', z.toString());
  try {
    await navigator.clipboard.writeText(url.toString());
    toast('Share link copied!');
  } catch {
    toast('Share link: ' + url.toString(), 4000);
  }
});

/* =========================
   Submit
========================= */
submitMood.addEventListener('click', async () => {
  if (submitCooldown > 0) return;
  const note = noteEl.value.trim().slice(0, 280);

  if (urlRe.test(note) || emailRe.test(note)) {
    return toast('Notes cannot include links or emails');
  }
  if (containsBadWords(note)) {
    return toast('Please keep it kind ♥');
  }

  submitMood.disabled = true;
  const payload = {
    lat: selectedPos.lat,
    lng: selectedPos.lng,
    mood: selectedMood,
    text: note,
    connectConsent: connectConsent.checked
  };
  try {
    const res = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 429) {
      toast('You’re posting too fast. Try again later.');
      return;
    }
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed');
    lastPosted = json.data;
    shareLinkBtn.disabled = false;

    // Cooldown (10s) to prevent double spam
    submitCooldown = 10;
    const int = setInterval(() => {
      submitCooldown--;
      updateSubmitState();
      if (submitCooldown <= 0) clearInterval(int);
    }, 1000);

    noteEl.value = '';
    toast('Mood sent ✨');
  } catch (e) {
    toast('Could not post your mood. Please try later.');
    console.error(e);
  } finally {
    updateSubmitState();
  }
});

/* =========================
   Layers: markers, clusters, heat
========================= */
let entries = []; // latest fetched within window
const markersLayer = L.layerGroup().addTo(map);
const connectionsLayer = L.layerGroup().addTo(map);
const clusterLayer = L.markerClusterGroup({ disableClusteringAtZoom: 9 });
let heatLayer = null;

toggleHeat.addEventListener('change', () => {
  refreshLayers();
});
toggleCluster.addEventListener('change', () => {
  refreshLayers();
});

function colorForMood(m) {
  return {
    '-2': '#ef4444',
    '-1': '#f59e0b',
    '0':  '#a3a3a3',
    '1':  '#34d399',
    '2':  '#60a5fa',
  }[m.toString()];
}
function moodLabel(m) {
  return t(CONFIG.moodLabels[m.toString()]);
}
function opacityByAge(createdAt) {
  const hoursWindow = parseInt(windowHours.value, 10);
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const windowMs = hoursWindow * 3600 * 1000;
  const ratio = Math.max(0, Math.min(1, ageMs / windowMs));
  return 0.85 - 0.7 * ratio; // fresh -> 0.85, old -> 0.15
}

function dotIcon(color, opacity) {
  // Use currentColor for pulse halo
  const el = document.createElement('div');
  el.className = 'mm-dot';
  el.style.background = color;
  el.style.color = color;
  el.style.opacity = opacity.toString();
  return L.divIcon({ html: el, className: '', iconSize: [12,12] });
}

function addPointToLayers(e) {
  const c = colorForMood(e.mood);
  const op = opacityByAge(e.created_at);

  const marker = L.marker([e.lat, e.lng], { icon: dotIcon(c, op) })
    .bindPopup(() => {
      const time = new Date(e.created_at);
      const agoMin = Math.max(1, Math.round((Date.now() - time.getTime())/60000));
      const safe = (e.text || '').replace(/[<>]/g, '');
      return `<div style="min-width:180px">
        <div style="font-weight:600; margin-bottom:4px">${moodLabel(e.mood)} mood</div>
        <div style="opacity:.8;">${safe || t(CONFIG.ui.noNote)}</div>
        <div style="opacity:.6; margin-top:6px; font-size:12px">${agoMin} min ago</div>
      </div>`;
    });

  if (toggleCluster.checked) {
    clusterLayer.addLayer(marker);
  } else {
    markersLayer.addLayer(marker);
  }
}

function clearVisualLayers() {
  markersLayer.clearLayers();
  connectionsLayer.clearLayers();
  clusterLayer.clearLayers();
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
}

function drawHeat() {
  if (!toggleHeat.checked) return;
  const points = entries.map(e => [e.lat, e.lng, 0.5 + (e.mood+2)*0.125]); // weight by mood
  heatLayer = L.heatLayer(points, { radius: 18, blur: 30, maxZoom: 9, minOpacity: 0.2 }).addTo(map);
}

function haversineKm(a, b) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function drawConnections() {
  connectionsLayer.clearLayers();
  if (!toggleConnections.checked) return;
  const R = parseInt(radiusKm.value, 10);
  const allowed = entries.filter(e => e.connect_consent);
  const byMood = allowed.reduce((acc, e) => { (acc[e.mood] ||= []).push(e); return acc; }, {});
  for (const m in byMood) {
    const group = byMood[m];
    for (let i=0; i<group.length; i++) {
      for (let j=i+1; j<group.length; j++) {
        const a = group[i], b = group[j];
        const d = haversineKm(a, b);
        if (d <= R) {
          L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
            color: colorForMood(a.mood),
            weight: 1,
            opacity: 0.45 * Math.min(opacityByAge(a.created_at), opacityByAge(b.created_at))
          }).addTo(connectionsLayer);
        }
      }
    }
  }
}

function refreshLayers() {
  clearVisualLayers();
  for (const e of entries) addPointToLayers(e);
  if (toggleCluster.checked && !map.hasLayer(clusterLayer)) map.addLayer(clusterLayer);
  if (!toggleCluster.checked && map.hasLayer(clusterLayer)) map.removeLayer(clusterLayer);
  drawConnections();
  drawHeat();
}

/* =========================
   Data loading + URL centering
========================= */
async function fetchMoods() {
  try {
    const hours = windowHours.value;
    const res = await fetch(`/api/moods?sinceHours=${hours}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed');
    entries = json.data;
    refreshLayers();
  } catch (e) {
    console.error(e);
  }
}

function centerFromUrl() {
  const url = new URL(window.location.href);
  const c = url.searchParams.get('center');
  const z = parseInt(url.searchParams.get('z') || '0', 10);
  if (c) {
    const [lat, lng] = c.split(',').map(Number);
    if (isFinite(lat) && isFinite(lng)) {
      map.setView([lat, lng], isFinite(z) && z>0 ? z : 13);
    }
  }
}

// initial load + refresh + live updates
centerFromUrl();
fetchMoods();
setInterval(fetchMoods, 60 * 1000);

socket.on('new_mood', (e) => {
  const sinceMs = parseInt(windowHours.value, 10) * 3600 * 1000;
  if (Date.now() - new Date(e.created_at).getTime() > sinceMs) return;
  entries.unshift(e);
  addPointToLayers(e);
  drawConnections();
  if (toggleHeat.checked && heatLayer) {
    map.removeLayer(heatLayer); heatLayer = null; drawHeat();
  }
});
