import { useEffect, useMemo, useRef, useState } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { deleteMood, getRecentMoods, MoodOut } from "../lib/api";

// simple moon-like circle marker
function moonIcon(tint: string) {
  return L.divIcon({
    className: "moon-pin",
    html: `<div class="moon" style="--tint:${tint}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// tint by energy (1..5)
const energyTint = (e: number) => ["#6b7280","#60a5fa","#34d399","#f59e0b","#ef4444"][Math.max(0,Math.min(4,e-1))];

type Props = { center: [number, number] };

export default function MapView({ center }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [points, setPoints] = useState<MoodOut[]>([]);
  const myTokens = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("mm_tokens") || "{}") as Record<number,string>; }
    catch { return {} as Record<number,string>; }
  }, []);

  useEffect(() => {
    if (mapRef.current) return;
    const m = L.map("map", { zoomControl: true }).setView(center, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(m);
    mapRef.current = m;
  }, [center]);

  // load points and draw
  useEffect(() => {
    (async () => {
      const data = await getRecentMoods(1440);
      setPoints(data);
    })().catch(console.error);
  }, []);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    // clear old layers (but keep base tile layer)
    m.eachLayer(l => {
      if ((l as any).getAttribution) return; // skip tile layer
      m.removeLayer(l);
    });

    // add markers
    const groupByEnergy: Record<number, L.LatLng[]> = {};
    points.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: moonIcon(energyTint(p.energy)) }).addTo(m);

      // popup with delete if token matches
      const canDelete = myTokens[p.id] != null;
      const time = new Date(p.createdAt).toLocaleString();
      const text = p.text ? `<div class="text">${escapeHtml(p.text)}</div>` : "";
      const delBtn = canDelete ? `<button id="del_${p.id}" class="del-btn">Delete</button>` : "";
      marker.bindPopup(`
        <div class="popup">
          <div class="em">${escapeHtml(p.mood)}</div>
          ${text}
          <div class="time">${time}</div>
          ${delBtn}
        </div>
      `);

      if (canDelete) {
        marker.on("popupopen", () => {
          const el = document.getElementById(`del_${p.id}`);
          if (!el) return;
          el.onclick = async () => {
            try {
              await deleteMood(p.id, myTokens[p.id]);
              marker.removeFrom(m);
              // remove local token record
              const next = { ...myTokens }; delete next[p.id];
              localStorage.setItem("mm_tokens", JSON.stringify(next));
            } catch (e) {
              alert("Failed to delete");
            }
          };
        });
      }

      // collect for lines
      groupByEnergy[p.energy] ||= [];
      groupByEnergy[p.energy].push(L.latLng(p.lat, p.lng));
    });

    // connect same-energy within ~75km chaining nearest neighbors
    Object.values(groupByEnergy).forEach(lls => {
      if (lls.length < 2) return;
      const lines = connectNearby(lls, 75_000);
      lines.forEach(seg => L.polyline(seg, { weight: 1.5, opacity: 0.35 }).addTo(m));
    });
  }, [points, myTokens]);

  return <div id="map" className="map" aria-label="mood map" />;
}

// utilities

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));
}

function haversine(a: L.LatLng, b: L.LatLng) {
  const R = 6371e3, toR = (d:number)=>d*Math.PI/180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const s1 = Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}

function connectNearby(points: L.LatLng[], maxDist: number): L.LatLng[][] {
  // greedy chain: repeatedly connect nearest neighbors under maxDist
  const remaining = points.slice();
  const segs: L.LatLng[][] = [];
  while (remaining.length > 1) {
    const start = remaining.shift()!;
    let nearestIdx = -1, nearest = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(start, remaining[i]);
      if (d < nearest) { nearest = d; nearestIdx = i; }
    }
    if (nearestIdx >= 0 && nearest <= maxDist) {
      segs.push([start, remaining[nearestIdx]]);
      remaining.splice(nearestIdx, 1);
    }
  }
  return segs;
}
