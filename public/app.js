/* global L, io */
const socket = io();

// ——— Starfield background
const starCanvas = document.getElementById('stars');
const ctx = starCanvas.getContext('2d');
let stars = [];
function resize() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = Array.from({ length: Math.min(400, Math.floor((starCanvas.width*starCanvas.height)/8000)) }, () => ({
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
  for (const s of stars) {
    ctx.globalAlpha = 0.5 + Math.sin((s.x+s.y+performance.now()/1000)*s.z)*0.3;
    ctx.fillStyle = '#fff';
    ctx.fillRect(s.x, s.y, s.w, s.w);
  }
  requestAnimationFrame(animateStars);
}
requestAnimationFrame(animateStars);

// ——— Map
const map = L.map('map', { zoomControl: false }).setView([20, 0], 2);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ——— UI elements
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

useMyLocation.addEventListener('click', async () => {
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

document.getElementById('toggleConnections').addEventListener('change', drawConnections);

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
    // keep selected mood & pos for convenience
  } catch (e) {
    alert('Could not post your mood. Please try again later.');
    console.error(e);
  } finally {
    updateSubmitState();
  }
});

// ——— Markers & layers
const markersLayer = L.layerGroup().addTo(map);
const connectionsLayer = L.layerGroup().addTo(map);
let entries = []; // latest fetched (within window)

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
  return {
    '-2': 'Very low',
    '-1': 'Low',
    '0': 'Neutral',
    '1': 'Good',
    '2': 'Great',
  }[m.toString()];
}

function addMarker(e) {
  const c = colorForMood(e.mood);
  const marker = L.circleMarker([e.lat, e.lng], {
    radius: 6,
    color: c,
    weight: 1.5,
    fillColor: c,
    fillOpacity: 0.65,
  }).addTo(markersLayer);
  const time = new Date(e.created_at);
  const agoMinutes = Math.max(1, Math.round((Date.now() - time.getTime())/60000));
  const noteSafe = (e.text || '').replace(/[<>]/g, '');
  marker.bindPopup(
    `<div style="min-width:180px">
      <div style="font-weight:600; margin-bottom:4px">${moodLabel(e.mood)} mood</div>
      <div style="opacity:.8;">${noteSafe || '<em>No note</em>'}</div>
      <div style="opacity:.6; margin-top:6px; font-size:12px">${agoMinutes} min ago</div>
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
  const byMood = allowed.reduce((acc, e) => {
    (acc[e.mood] ||= []).push(e); return acc;
  }, {});
  for (const m in byMood) {
    const group = byMood[m];
    // naive nearest-neighbor linking within radius
    for (let i=0; i<group.length; i++) {
      for (let j=i+1; j<group.length; j++) {
        const a = group[i], b = group[j];
        const d = haversineKm(a, b);
        if (d <= R) {
          L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
            color: colorForMood(a.mood),
            weight: 1,
            opacity: 0.5
          }).addTo(connectionsLayer);
        }
      }
    }
  }
}

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

// initial load
fetchMoods();
// refresh every 60s
setInterval(fetchMoods, 60 * 1000);

// live updates
socket.on('new_mood', (e) => {
  // Only show if within current window
  const sinceMs = parseInt(windowHours.value, 10) * 3600 * 1000;
  if (Date.now() - new Date(e.created_at).getTime() > sinceMs) return;
  entries.unshift(e);
  addMarker(e);
  drawConnections();
});
