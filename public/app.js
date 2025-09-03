/* global L, io */
const socket = io();

/* =========================
   Phrase in centered hero
========================= */
const deepPhraseEl = document.getElementById('deepPhrase');
const PHRASE_FALLBACK =
  "The same moon looks down on all of us and knows our hidden feelings. On Micromoon those feelings become lights on a shared map, glowing for one day before they fade back into the night.";
const initialPhrase = deepPhraseEl?.getAttribute('data-phrase') || PHRASE_FALLBACK;
if (deepPhraseEl) deepPhraseEl.textContent = initialPhrase;

/* =========================
   Starfield background
========================= */
const starCanvas = document.getElementById('stars');
const ctx = starCanvas.getContext('2d');
let stars = [];
function resize() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = Array.from({ length: Math.min(600, Math.floor((starCanvas.width*starCanvas.height)/6500)) }, () => ({
    x: Math.random()*starCanvas.width,
    y: Math.random()*starCanvas.height,
    z: Math.random()*1 + 0.5,
    w: Math.random()*2 + 0.5
  }));
}
window.addEventListener('resize', resize);
resize();
(function animateStars(){
  ctx.clearRect(0,0,starCanvas.width, starCanvas.height);
  const time = performance.now()/1000;
  for (const s of stars) {
    const alpha = 0.5 + Math.sin((s.x+s.y+time)*s.z)*0.3;
    const blueTint = Math.floor(180 + 55*Math.sin(time*0.12 + s.x*0.001));
    ctx.fillStyle = `rgba(${215},${230},${blueTint},${alpha})`;
    ctx.fillRect(s.x, s.y, s.w, s.w);
  }
  requestAnimationFrame(animateStars);
})();

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
   UI hooks
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

// Toasts
const toastHost = document.getElementById('toastHost');
function toast(msg, ms=2500) {
  const el = document.createElement('div'); el.className='toast'; el.innerHTML=msg;
  toastHost.appendChild(el);
  setTimeout(()=>{ el.style.transition='opacity .3s, transform .3s'; el.style.opacity='0'; el.style.transform='translateY(-6px)'; setTimeout(()=>el.remove(),320); }, ms);
}

/* Crosshair */
const crosshair = document.getElementById('crosshair');
const toggleCrosshairBtn = document.getElementById('toggleCrosshair');
let crosshairOn = false;
toggleCrosshairBtn.addEventListener('click', () => {
  crosshairOn = !crosshairOn;
  crosshair.classList.toggle('hidden', !crosshairOn);
  toast(crosshairOn ? 'Crosshair on: arrows to move, Enter to select' : 'Crosshair off');
});
window.addEventListener('keydown', (e) => {
  if (!crosshairOn) return;
  const step = deg => deg * (1/Math.pow(2, map.getZoom())) * 10;
  let c = map.getCenter();
  if (e.key === 'ArrowUp') c.lat += step(.2);
  if (e.key === 'ArrowDown') c.lat -= step(.2);
  if (e.key === 'ArrowLeft') c.lng -= step(.2);
  if (e.key === 'ArrowRight') c.lng += step(.2);
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault(); map.setView(c, map.getZoom(), { animate:false });
  }
  if (e.key === 'Enter') {
    selectedPos = { lat:c.lat, lng:c.lng };
    chosenSpot.textContent = `Selected: ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
    updateSubmitState(); toast('Spot selected at crosshair');
  }
});

/* =========================
   Composer
========================= */
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

useMyLocation.addEventListener('click', () => {
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

/* Moderation */
const urlRe = /(https?:\/\/|www\.)\S+/i;
const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const badWords = ["fuck","shit","bitch","asshole"];

/* Share link */
let lastPosted = null;
shareLinkBtn.addEventListener('click', async () => {
  if (!lastPosted) return;
  const url = new URL(location.href);
  url.searchParams.set('center', `${lastPosted.lat.toFixed(5)},${lastPosted.lng.toFixed(5)}`);
  url.searchParams.set('z', '13');
  try { await navigator.clipboard.writeText(url.toString()); toast('Share link copied!'); }
  catch { toast('Share link: ' + url.toString(), 4000); }
});

/* Submit */
submitMood.addEventListener('click', async () => {
  if (submitCooldown > 0) return;
  const note = noteEl.value.trim().slice(0, 280);
  if (urlRe.test(note) || emailRe.test(note)) return toast('Notes cannot include links or emails');
  if (badWords.some(w => note.toLowerCase().includes(w))) return toast('Please keep it kind ♥');

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
  } finally {
    updateSubmitState();
  }
});

/* =========================
   Layers: markers, clusters, heat
========================= */
let entries = [];
const markersLayer = L.layerGroup().addTo(map);
const connectionsLayer = L.layerGroup().addTo(map);
const clusterLayer = L.markerClusterGroup({ disableClusteringAtZoom: 9 });
let heatLayer = null;

document.getElementById('toggleHeat').addEventListener('change', refreshLayers);
document.getElementById('toggleCluster').addEventListener('change', refreshLayers);

function colorForMood(m){ return {'-2':'#ef4444','-1':'#f59e0b','0':'#a3a3a3','1':'#34d399','2':'#60a5fa'}[m.toString()]; }
function opacityByAge(createdAt) {
  const hours = parseInt(windowHours.value, 10);
  const age = Date.now() - new Date(createdAt).getTime();
  const win = hours * 3600 * 1000;
  const r = Math.max(0, Math.min(1, age / win));
  return 0.85 - 0.7 * r; // fresh 0.85 -> old 0.15
}
function dotIcon(color, op) {
  const el = document.createElement('div');
  el.className = 'mm-dot';
  el.style.background = color;
  el.style.color = color;
  el.style.opacity = op;
  return L.divIcon({ html: el, className: '', iconSize: [14,14] });
}
function addPointToLayers(e) {
  const c = colorForMood(e.mood);
  const op = opacityByAge(e.created_at);
  const marker = L.marker([e.lat, e.lng], { icon: dotIcon(c, op) })
    .bindPopup(() => {
      const t = new Date(e.created_at);
      const ago = Math.max(1, Math.round((Date.now()-t.getTime())/60000));
      const safe = (e.text || '').replace(/[<>]/g, '');
      const label = { '-2':'Very low', '-1':'Low', '0':'Neutral', '1':'Good', '2':'Great' }[e.mood.toString()];
      return `<div style="min-width:200px">
        <div style="font-weight:700; margin-bottom:4px">${label} mood</div>
        <div style="opacity:.85;">${safe || '<em>No note</em>'}</div>
        <div style="opacity:.6; margin-top:6px; font-size:12px">${ago} min ago</div>
      </div>`;
    });
  if (document.getElementById('toggleCluster').checked) clusterLayer.addLayer(marker);
  else markersLayer.addLayer(marker);
}
function clearVisualLayers() {
  markersLayer.clearLayers(); connectionsLayer.clearLayers(); clusterLayer.clearLayers();
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
}
function drawHeat() {
  if (!document.getElementById('toggleHeat').checked) return;
  const points = entries.map(e => [e.lat, e.lng, 0.5 + (e.mood+2)*0.125]);
  heatLayer = L.heatLayer(points, { radius: 18, blur: 30, maxZoom: 9, minOpacity: 0.2 }).addTo(map);
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
  if (document.getElementById('toggleCluster').checked && !map.hasLayer(clusterLayer)) map.addLayer(clusterLayer);
  if (!document.getElementById('toggleCluster').checked && map.hasLayer(clusterLayer)) map.removeLayer(clusterLayer);
  drawConnections(); drawHeat();
}

/* =========================
   Data loading + realtime
========================= */
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
  if (document.getElementById('toggleHeat').checked && heatLayer) { map.removeLayer(heatLayer); heatLayer=null; drawHeat(); }
});
