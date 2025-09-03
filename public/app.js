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
  }
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
   Starfield background w/ subtle color shift
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

const deepPhrase = document.getElementById('deepPhrase');
const tagline = document.getElementById('tagline');
const langEn = document.getElementById('langEn');
const langDe = document.getElementById('langDe');

// i18n-controlled labels
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

// apply language to UI
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
   Composer interactions
========================= */
let selectedMood = null;
let selectedPos = null; // { lat, lng }

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
  if (!navigator.geolocation) return alert('Geolocation is not supported in your browser.');
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    selectedPos = { lat: latitude, lng: longitude };
    map.setView([latitude, longitude], 13);
    chosenSpot.textContent = `Selected: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    updateSubmitState();
  }, (err) => {
    alert('Could not get your location. You can also click anywhere on the map.');
    console.warn(err);
  });
});

map.on('click', (e) => {
  selectedPos = { lat: e.latlng.lat, lng: e.latlng.lng };
  chosenSpot.textContent = `Selected: ${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)}`;
  updateSubmitState();
});

function updateSubmitState() {
  submitMood.disabled = !(selectedMood !== null && selectedPos);
}

radiusKm.addEventListener('input', () => {
  radiusValue.textContent = `${radiusKm.value}km`;
  drawConnections();
});
windowHours.addEventListener('change', () => {
  fetchMoods();
});
toggleConnections.addEventListener('change', drawConnections);

submitMood.addEventListener('click', async () => {
  submitMood.disabled = true;
  const payload = {
    lat: selectedPos.lat,
    lng: selectedPos.lng,
    mood: selectedMood,
    text: noteEl.value.trim().slice(0, 280),
    connectConsent: connectConsent.checked
  };
  try {
    const res = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed');
    noteEl.value = '';
  } catch (e) {
    alert('Could not post your mood. Please try again later.');
    console.error(e);
  } finally {
    updateSubmitState();
  }
});

/* =========================
   Markers & connections
========================= */
const markersLayer = L.layerGroup().addTo(map);
const connectionsLayer = L.layerGroup().addTo(map);
let entries = []; // latest fetched within window

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

// opacity based on age within current window (fresh dots = bright, older = transparent)
function opacityByAge(createdAt) {
  const hoursWindow = parseInt(windowHours.value, 10);
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const windowMs = hoursWindow * 3600 * 1000;
  const ratio = Math.max(0, Math.min(1, ageMs / windowMs));
  // newer => 0 => 0.85 opacity; older => 1 => 0.15 opacity
  return 0.85 - 0.7 * ratio;
}

function addMarker(e) {
  const c = colorForMood(e.mood);
  const marker = L.circleMarker([e.lat, e.lng], {
    radius: 6,
    color: c,
    weight: 1.5,
    fillColor: c,
    fillOpacity: opacityByAge(e.created_at),
  }).addTo(markersLayer);

  const time = new Date(e.created_at);
  const agoMin = Math.max(1, Math.round((Date.now() - time.getTime())/60000));
  const noteSafe = (e.text || '').replace(/[<>]/g, '');
  marker.bindPopup(
    `<div style="min-width:180px">
      <div style="font-weight:600; margin-bottom:4px">${moodLabel(e.mood)} mood</div>
      <div style="opacity:.8;">${noteSafe || t(CONFIG.ui.noNote)}</div>
      <div style="opacity:.6; margin-top:6px; font-size:12px">${agoMin} min ago</div>
    </div>`
  );
  return marker;
}

function clearLayers() {
  markersLayer.clearLayers();
  connectionsLayer.clearLayers();
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
  // group by mood
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

/* =========================
   Data loading
========================= */
async function fetchMoods() {
  try {
    const hours = windowHours.value;
    const res = await fetch(`/api/moods?sinceHours=${hours}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed');
    entries = json.data;
    clearLayers();
    for (const e of entries) addMarker(e);
    drawConnections();
  } catch (e) {
    console.error(e);
  }
}

// initial load + refresh + live updates
fetchMoods();
setInterval(fetchMoods, 60 * 1000);
socket.on('new_mood', (e) => {
  const sinceMs = parseInt(windowHours.value, 10) * 3600 * 1000;
  if (Date.now() - new Date(e.created_at).getTime() > sinceMs) return;
  entries.unshift(e);
  addMarker(e);
  drawConnections();
});
