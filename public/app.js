/* Micromoon — front-end app
 * - Modern hero phrase rendering (balanced lines + brand accent)
 * - i18n for core UI (EN/DE/ES/FR/AR/RU/ZH)
 * - Animated star background
 * - Leaflet map with clustering, heatmap, and optional “connect similar moods” lines
 * - Post moods anonymously (no auth), 24h window filter
 * - Live updates via Socket.IO when available, graceful polling fallback
 * - Share link + small quality-of-life toasts
 */

// ------------------------------ utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const kmBetween = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 =
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
};
const isoNow = () => new Date().toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000);

// toast
function toast(msg, type = "info") {
  const host = $("#toastHost");
  if (!host) return;
  const div = document.createElement("div");
  div.className =
    "px-3 py-2 rounded-xl text-sm shadow-lg backdrop-blur ring-1 " +
    (type === "error"
      ? "bg-red-500/90 ring-red-400 text-white"
      : type === "ok"
      ? "bg-emerald-500/90 ring-emerald-400 text-black"
      : "bg-white/90 ring-white/60 text-black");
  div.textContent = msg;
  host.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ------------------------------ i18n (minimal but covers UI)
const I18N = {
  en: {
    tagline: "Micromoon — anonymous, 24-hour moods",
    pulseTitle: "Pulse your mood",
    howFeel: "How do you feel?",
    whats: "What’s happening?",
    optional: "(optional, 280 chars)",
    orClick: "or click on the map",
    crosshair: "Crosshair",
    noSpot: "No spot selected yet.",
    allowConnect: "Allow others to connect my dot",
    postsInfo: "Posts are anonymous and visible for 24 hours, then disappear.",
    mapView: "Map view",
    connectSimilar: "Connect similar moods",
    radius: "Radius",
    window: "Window",
    h24: "24h",
    h12: "12h",
    h6: "6h",
    tip: "Tip: lower the window to 6–12h to see fresher activity.",
    pulseBtn: "Pulse",
    shareBtn: "Share",
    useLocation: "Use my location",
  },
  de: {
    tagline: "Micromoon — anonym, 24-Stunden-Stimmungen",
    pulseTitle: "Teile deine Stimmung",
    howFeel: "Wie fühlst du dich?",
    whats: "Was passiert?",
    optional: "(optional, 280 Zeichen)",
    orClick: "oder klicke in die Karte",
    crosshair: "Fadenkreuz",
    noSpot: "Noch kein Ort ausgewählt.",
    allowConnect: "Ähnliche Punkte dürfen mich verbinden",
    postsInfo:
      "Beiträge sind anonym und 24 Stunden sichtbar, dann verschwinden sie.",
    mapView: "Kartenansicht",
    connectSimilar: "Ähnliche Stimmungen verbinden",
    radius: "Radius",
    window: "Fenster",
    h24: "24h",
    h12: "12h",
    h6: "6h",
    tip: "Tipp: Fenster auf 6–12h senken, um frischere Aktivität zu sehen.",
    pulseBtn: "Senden",
    shareBtn: "Teilen",
    useLocation: "Meinen Standort",
  },
  es: {
    tagline: "Micromoon — anónimo, estados de 24 horas",
    pulseTitle: "Comparte tu ánimo",
    howFeel: "¿Cómo te sientes?",
    whats: "¿Qué está pasando?",
    optional: "(opcional, 280 caracteres)",
    orClick: "o haz clic en el mapa",
    crosshair: "Mira",
    noSpot: "Aún no hay punto seleccionado.",
    allowConnect: "Permitir conectar puntos similares",
    postsInfo:
      "Las publicaciones son anónimas y visibles por 24 horas, luego desaparecen.",
    mapView: "Vista del mapa",
    connectSimilar: "Conectar ánimos similares",
    radius: "Radio",
    window: "Ventana",
    h24: "24h",
    h12: "12h",
    h6: "6h",
    tip: "Tip: baja la ventana a 6–12h para ver actividad más reciente.",
    pulseBtn: "Publicar",
    shareBtn: "Compartir",
    useLocation: "Usar mi ubicación",
  },
  fr: {
    tagline: "Micromoon — humeurs anonymes, 24 heures",
    pulseTitle: "Publie ton humeur",
    howFeel: "Comment te sens-tu ?",
    whats: "Que se passe-t-il ?",
    optional: "(optionnel, 280 caractères)",
    orClick: "ou clique sur la carte",
    crosshair: "Réticule",
    noSpot: "Aucun point sélectionné.",
    allowConnect: "Permettre de relier les points similaires",
    postsInfo:
      "Les publications sont anonymes et visibles 24 heures, puis disparaissent.",
    mapView: "Vue carte",
    connectSimilar: "Relier des humeurs similaires",
    radius: "Rayon",
    window: "Fenêtre",
    h24: "24h",
    h12: "12h",
    h6: "6h",
    tip: "Astuce : passe la fenêtre à 6–12h pour voir de l’activité plus fraîche.",
    pulseBtn: "Envoyer",
    shareBtn: "Partager",
    useLocation: "Utiliser ma position",
  },
  ar: {
    tagline: "ميكرومون — مشاعر مجهولة لمدة 24 ساعة",
    pulseTitle: "انشر شعورك",
    howFeel: "كيف تشعر؟",
    whats: "ماذا يحدث؟",
    optional: "(اختياري، 280 حرفًا)",
    orClick: "أو اضغط على الخريطة",
    crosshair: "علامة التصويب",
    noSpot: "لم يتم اختيار موقع بعد.",
    allowConnect: "اسمح بربط النقاط المتشابهة",
    postsInfo: "المنشورات مجهولة وتظهر لمدة 24 ساعة ثم تختفي.",
    mapView: "عرض الخريطة",
    connectSimilar: "ربط مشاعر متشابهة",
    radius: "نطاق",
    window: "نافذة",
    h24: "٢٤س",
    h12: "١٢س",
    h6: "٦س",
    tip: "نصيحة: خفّض النافذة إلى 6–12 ساعة لرؤية نشاط أحدث.",
    pulseBtn: "إرسال",
    shareBtn: "مشاركة",
    useLocation: "موقعي",
  },
  ru: {
    tagline: "Micromoon — анонимные настроения, 24 часа",
    pulseTitle: "Поделись настроением",
    howFeel: "Как ты себя чувствуешь?",
    whats: "Что происходит?",
    optional: "(необязательно, 280 символов)",
    orClick: "или нажми на карту",
    crosshair: "Прицел",
    noSpot: "Точка ещё не выбрана.",
    allowConnect: "Разрешить соединять похожие точки",
    postsInfo:
      "Публикации анонимны и видны 24 часа, затем исчезают.",
    mapView: "Вид карты",
    connectSimilar: "Соединять похожие настроения",
    radius: "Радиус",
    window: "Окно",
    h24: "24ч",
    h12: "12ч",
    h6: "6ч",
    tip: "Подсказка: уменьшите окно до 6–12ч, чтобы видеть более свежую активность.",
    pulseBtn: "Отправить",
    shareBtn: "Поделиться",
    useLocation: "Моё местоположение",
  },
  zh: {
    tagline: "Micromoon：匿名心情，保留 24 小时",
    pulseTitle: "发布你的心情",
    howFeel: "你现在感觉如何？",
    whats: "发生了什么？",
    optional: "（可选，280 字）",
    orClick: "或在地图上点选",
    crosshair: "十字准星",
    noSpot: "尚未选择位置。",
    allowConnect: "允许连接相似心情的点",
    postsInfo: "帖子匿名显示 24 小时后消失。",
    mapView: "地图视图",
    connectSimilar: "连接相似心情",
    radius: "半径",
    window: "时间窗",
    h24: "24h",
    h12: "12h",
    h6: "6h",
    tip: "提示：将时间窗降到 6–12h 可看到更即时的活动。",
    pulseBtn: "发布",
    shareBtn: "分享",
    useLocation: "使用我的位置",
  },
};

// ------------------------------ modern hero phrase (rendered here for app-wide control)
const HERO_PHRASE = {
  en: `The same moon looks down on all of us and knows our hidden feelings.
On Micromoon those feelings become lights on a shared map,
glowing for one day before they fade back into the night.`,
  de: `Der gleiche Mond schaut auf uns alle hinab und kennt unsere verborgenen Gefühle.
Auf Micromoon werden diese Gefühle zu Lichtern auf einer gemeinsamen Karte,
sie leuchten einen Tag, bevor sie wieder in die Nacht zurückkehren.`,
  es: `La misma luna nos mira a todos y conoce nuestros sentimientos ocultos.
En Micromoon esos sentimientos se vuelven luces en un mapa compartido,
brillan por un día antes de volver a la noche.`,
  fr: `La même lune nous regarde et connaît nos sentiments cachés.
Sur Micromoon ces sentiments deviennent des lumières sur une carte partagée,
elles brillent une journée avant de retourner à la nuit.`,
  ar: `القمر نفسه ينظر إلينا جميعًا ويعرف مشاعرنا الخفية.
على Micromoon تصبح هذه المشاعر أضواءً على خريطة مشتركة،
تتوهج ليوم واحد ثم تعود إلى الليل.`,
  ru: `Одна и та же луна смотрит на всех нас и знает наши скрытые чувства.
На Micromoon эти чувства становятся огнями на общей карте,
они сияют один день, а затем возвращаются в ночь.`,
  zh: `同一轮月亮注视着我们并了解我们隐藏的心情。
在 Micromoon 上，这些感受会化作共享地图上的光点，
只亮一天，随后回到夜色之中。`,
};

function renderHero(lang) {
  const el = $("#deepPhrase");
  if (!el) return;
  const raw = HERO_PHRASE[lang] || HERO_PHRASE.en;
  const esc = (s) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const highlighted = esc(raw).replaceAll(
    /Micromoon/g,
    '<span class="brand-gradient">Micromoon</span>'
  );
  const lines = highlighted
    .split("\n")
    .map((ln, i) => `<span class="line" style="--i:${i}">${ln.trim()}</span>`);
  el.innerHTML = lines.join("");
}

// ------------------------------ language switching
let currentLang = "en";
function applyLang(lang = "en") {
  currentLang = lang;
  const t = I18N[lang] || I18N.en;

  $("#tagline").textContent = t.tagline;
  $("#ui-pulseTitle").textContent = t.pulseTitle;
  $("#ui-howFeel").textContent = t.howFeel;
  $("#ui-whatsHappening").textContent = t.whats;
  $("#ui-optional").textContent = t.optional;
  $("#ui-orClickMap").textContent = t.orClick;
  $("#toggleCrosshair") && ($("#toggleCrosshair").textContent = `${t.crosshair} ⌖`);
  $("#chosenSpot").textContent = t.noSpot;
  $("#ui-allowConnect").textContent = t.allowConnect;
  $("#ui-postsInfo").textContent = t.postsInfo;

  // Map controls labels
  $$("section h3").find?.(() => {}) // no-op; keep layout
  // Inline labels:
  $$("label span#ui-connectSimilar").forEach((n) => (n.textContent = t.connectSimilar));
  $("#ui-radius").textContent = t.radius;
  $("#ui-window").textContent = t.window;
  $("#ui-24h").textContent = t.h24;
  $("#ui-12h").textContent = t.h12;
  $("#ui-6h").textContent = t.h6;
  const tip = document.querySelector(".mm-controls")?.parentElement?.querySelector("p.text-xs");
  if (tip) tip.textContent = t.tip;

  $("#submitMood").textContent = t.pulseBtn;
  $("#shareLink").textContent = t.shareBtn;
  $("#useMyLocation").textContent = t.useLocation;

  renderHero(lang);
  // RTL support for Arabic
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}
$$(".lang-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    $$(".lang-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyLang(btn.dataset.lang || "en");
  })
);

// ------------------------------ star background (subtle)
(function starfield() {
  const cvs = $("#stars");
  if (!cvs) return;
  const ctx = cvs.getContext("2d");
  let W, H, stars;
  function reset() {
    W = cvs.width = window.innerWidth;
    H = cvs.height = window.innerHeight;
    const density = clamp(Math.floor((W * H) / 14000), 60, 300);
    stars = Array.from({ length: density }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.4 + 0.1,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const st of stars) {
      st.a += st.s * 0.015;
      const tw = 0.75 + Math.sin(st.a) * 0.25;
      ctx.globalAlpha = clamp(tw, 0.2, 1);
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = "#e9efff";
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", reset);
  reset();
  draw();
})();

// ------------------------------ map + layers
let map, cluster, heat, linesLayer, crosshairOn = false;
const state = {
  selected: null, // {lat, lng}
  mood: 0,
  windowHours: 24,
  radiusKm: 120,
  connectSimilar: false,
  heatOn: false,
  clusterOn: false,
  consentConnect: false,
  data: [], // pulses
  markersById: new Map(),
};

// emoji icon as divIcon
function emojiIcon(emoji) {
  const el = document.createElement("div");
  el.style.width = "34px";
  el.style.height = "34px";
  el.style.display = "grid";
  el.style.placeItems = "center";
  el.style.borderRadius = "12px";
  el.style.background = "rgba(255,255,255,.15)";
  el.style.backdropFilter = "blur(6px)";
  el.style.border = "1px solid rgba(255,255,255,.35)";
  el.style.boxShadow = "0 8px 24px rgba(0,0,0,.35)";
  el.style.fontSize = "20px";
  el.textContent = emoji;
  return L.divIcon({ html: el, className: "", iconSize: [34, 34] });
}
const moodToEmoji = { "-2": "😢", "-1": "🙁", "0": "😐", "1": "🙂", "2": "🤩" };

// init leaflet
(function initMap() {
  map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    worldCopyJump: true,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  cluster = L.markerClusterGroup({ disableClusteringAtZoom: 9 });
  linesLayer = L.layerGroup();
  heat = L.heatLayer([], { radius: 18, blur: 15, maxZoom: 10, minOpacity: 0.25 });

  // crosshair overlay simple CSS helpers
  const ch = $("#crosshair");
  if (ch) {
    ch.innerHTML = `
      <style>
        #crosshair .crosshair-vert,#crosshair .crosshair-horiz{
          position:absolute;left:50%;top:50%;background:rgba(255,255,255,.5);z-index:20
        }
        #crosshair .crosshair-vert{ width:1px;height:100% ; transform:translateX(-.5px) }
        #crosshair .crosshair-horiz{ height:1px;width:100%; transform:translateY(-.5px) }
      </style>`;
  }

  map.on("click", (e) => {
    state.selected = { lat: e.latlng.lat, lng: e.latlng.lng };
    $("#chosenSpot").textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    $("#submitMood").disabled = false;
  });
})();

// ------------------------------ fetch + render data
async function fetchPulses() {
  const win = state.windowHours;
  const res = await fetch(`/api/pulses?windowHours=${encodeURIComponent(win)}`).catch(() => null);
  if (!res || !res.ok) return;
  const list = await res.json();
  // normalize
  state.data = (list || [])
    .map((p) => ({
      id: p.id,
      lat: Number(p.lat),
      lng: Number(p.lng),
      mood: Number(p.mood ?? p.score ?? 0),
      note: p.note || "",
      allow_connect: !!(p.allow_connect ?? p.consent ?? false),
      created_at: p.created_at || p.createdAt || isoNow(),
    }))
    .filter((p) => new Date(p.created_at) >= hoursAgo(state.windowHours));
  renderData();
}

function renderData() {
  // clear layers
  cluster.clearLayers();
  linesLayer.clearLayers();
  const pts = [];
  for (const p of state.data) {
    const mk = L.marker([p.lat, p.lng], { icon: emojiIcon(moodToEmoji[p.mood]) });
    mk.bindPopup(
      `<div style="min-width:180px">
        <div style="font-size:18px">${moodToEmoji[p.mood] || "•"}</div>
        ${p.note ? `<div style="margin-top:6px;opacity:.85">${escapeHtml(p.note)}</div>` : ""}
        <div style="margin-top:8px;opacity:.6;font-size:12px">${timeAgo(p.created_at)}</div>
      </div>`
    );
    cluster.addLayer(mk);
    pts.push([p.lat, p.lng, 0.7 + (p.mood + 2) * 0.08]); // heat weight
  }

  // re-add layers conditionally
  if (state.clusterOn) cluster.addTo(map);
  else cluster.remove();

  if (state.heatOn) {
    heat.setLatLngs(pts).addTo(map);
  } else heat.remove();

  if (state.connectSimilar) drawConnections();

  // ensure radius label in UI
  $("#radiusValue").textContent = `${state.radiusKm}km`;
}

function drawConnections() {
  linesLayer.clearLayers();
  const same = state.data.filter((p) => p.allow_connect);
  // group by mood for similarity
  const groups = new Map();
  for (const p of same) {
    const key = String(p.mood);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  for (const [_, arr] of groups) {
    // connect within radius
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i],
          b = arr[j];
        if (kmBetween(a, b) <= state.radiusKm) {
          L.polyline(
            [
              [a.lat, a.lng],
              [b.lat, b.lng],
            ],
            { color: "rgba(180,210,255,0.6)", weight: 2 }
          ).addTo(linesLayer);
        }
      }
    }
  }
  linesLayer.addTo(map);
}

// helpers for popup
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ------------------------------ post mood
$("#moodPicker")?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-mood]");
  if (!btn) return;
  $$("#moodPicker button").forEach((b) => b.classList.remove("ring", "ring-white", "bg-white/10"));
  btn.classList.add("ring", "ring-white", "bg-white/10");
  state.mood = Number(btn.dataset.mood);
});
$("#connectConsent")?.addEventListener("change", (e) => {
  state.consentConnect = !!e.target.checked;
});
$("#useMyLocation")?.addEventListener("click", () => {
  if (!navigator.geolocation) return toast("Geolocation unavailable", "error");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      state.selected = { lat, lng };
      map.setView([lat, lng], 10);
      $("#chosenSpot").textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      $("#submitMood").disabled = false;
    },
    () => toast("Could not access your location", "error"),
    { enableHighAccuracy: true, timeout: 8000 }
  );
});
$("#toggleCrosshair")?.addEventListener("click", () => {
  crosshairOn = !crosshairOn;
  $("#crosshair")?.classList.toggle("hidden", !crosshairOn);
});

$("#submitMood")?.addEventListener("click", async () => {
  if (!state.selected) return toast("Pick a spot first", "error");
  const note = ($("#note")?.value || "").trim();
  const body = {
    mood: state.mood,
    note,
    lat: state.selected.lat,
    lng: state.selected.lng,
    allow_connect: !!state.consentConnect,
  };
  const res = await fetch("/api/pulses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!res || !res.ok) return toast("Failed to post", "error");
  const created = await res.json().catch(() => null);
  if (created) {
    state.data.unshift({
      id: created.id || Math.random().toString(36).slice(2),
      ...body,
      created_at: created.created_at || isoNow(),
    });
    renderData();
    toast("Posted", "ok");
    $("#submitMood").disabled = true;
    $("#shareLink").disabled = false;
  }
});

// share
$("#shareLink")?.addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}?utm_source=share`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Micromoon", text: "Under the same sky", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast("Link copied", "ok");
    }
  } catch (_) {
    await navigator.clipboard.writeText(url);
    toast("Link copied", "ok");
  }
});

// ------------------------------ map controls
$("#toggleConnections")?.addEventListener("change", (e) => {
  state.connectSimilar = !!e.target.checked;
  renderData();
});
$("#radiusKm")?.addEventListener("input", (e) => {
  state.radiusKm = Number(e.target.value);
  $("#radiusValue").textContent = `${state.radiusKm}km`;
  if (state.connectSimilar) drawConnections();
});
$("#windowHours")?.addEventListener("change", async (e) => {
  state.windowHours = Number(e.target.value);
  await fetchPulses();
});
$("#toggleHeat")?.addEventListener("change", (e) => {
  state.heatOn = !!e.target.checked;
  renderData();
});
$("#toggleCluster")?.addEventListener("change", (e) => {
  state.clusterOn = !!e.target.checked;
  renderData();
});

// ------------------------------ live updates
(function live() {
  // Socket.IO if present
  let connected = false;
  try {
    if (window.io) {
      const socket = io();
      socket.on("connect", () => {
        connected = true;
      });
      socket.on("pulse:new", (p) => {
        // apply 24h window filter
        if (new Date(p.created_at || isoNow()) < hoursAgo(state.windowHours)) return;
        state.data.unshift({
          id: p.id,
          lat: Number(p.lat),
          lng: Number(p.lng),
          mood: Number(p.mood ?? 0),
          note: p.note || "",
          allow_connect: !!(p.allow_connect ?? false),
          created_at: p.created_at || isoNow(),
        });
        renderData();
      });
    }
  } catch {}
  // Poll fallback every 25s if not connected
  setInterval(() => {
    if (!connected) fetchPulses();
  }, 25000);
})();

// ------------------------------ init
(async function init() {
  // language default
  document.querySelector('.lang-btn[data-lang="en"]')?.classList.add("active");
  applyLang("en");

  // sensible defaults
  state.clusterOn = false;
  state.heatOn = false;
  $("#radiusValue").textContent = `${state.radiusKm}km`;

  await fetchPulses();
})();
