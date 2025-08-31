import { useEffect, useMemo, useRef, useState } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { deleteMood, getRecentMoods, MoodOut } from "../lib/api";

// energy tint (1..5)
const tint = (e: number) => ["#6b7280","#60a5fa","#34d399","#f59e0b","#ef4444"][Math.max(0,Math.min(4,e-1))];

function moonIcon(color: string) {
  return L.divIcon({
    className: "moon-pin",
    html: `<div class="moon" style="--tint:${color}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

type Props = { center: [number, number]; ownerCode?: string };

export default function MapView({ center, ownerCode }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [pts, setPts] = useState<MoodOut[]>([]);

  const tokens = useMemo<Record<number,string>>(() => {
    try { return JSON.parse(localStorage.getItem("mm_tokens") || "{}"); }
    catch { return {}; }
  }, []);

  useEffect(() => {
    if (mapRef.current) return;
    const m = L.map("map", { zoomControl: true }).setView(center, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(m);
    mapRef.current = m;
  }, [center]);

  useEffect(() => {
    (async () => setPts(await getRecentMoods(1440)))().catch(console.error);
  }, []);

  useEffect(() => {
    const m = mapRef.current; if (!m) return;

    // clear (keep tiles)
    m.eachLayer(l => { if (!(l as any).getAttribution) m.removeLayer(l); });

    // markers
    const groups: Record<number, L.LatLng[]> = {};
    pts.forEach(p => {
      const mk = L.marker([p.lat, p.lng], { icon: moonIcon(tint(p.energy)) }).addTo(m);
      const mine = tokens[p.id] != null;
      const time = new Date(p.createdAt).toLocaleString();
      const txt = p.text ? `<div class="txt">${esc(p.text)}</div>` : "";
      const delBtn = mine || ownerCode ? `<button class="act" id="del_${p.id}">Delete</button>` : "";

      mk.bindPopup(`
        <div class="popup">
          <div class="row"><div class="em">${esc(p.mood)}</div><div class="small">• energy ${p.energy}</div></div>
          ${txt}
          <div class="time">${time}</div>
          ${delBtn}
        </div>
      `);

      if (mine || ownerCode) {
        mk.on("popupopen", () => {
          const btn = document.getElementById(`del_${p.id}`);
          if (!btn) return;
          btn.onclick = async () => {
            try {
              await deleteMood(p.id, tokens[p.id], ownerCode);
              mk.removeFrom(m);
              if (tokens[p.id]) {
                const next = { ...tokens }; delete next[p.id];
                localStorage.setItem("mm_tokens", JSON.stringify(next));
              }
            } catch { alert("Delete failed"); }
          };
        });
      }

      (groups[p.energy] ||= []).push(L.latLng(p.lat, p.lng));
    });

    // connect lines (≤75km)
    Object.values(groups).forEach(lls => {
      if (lls.length < 2) return;
      chains(lls, 75_000).forEach(seg => L.polyline(seg, { weight: 1.4, opacity: .35 }).addTo(m));
    });
  }, [pts, tokens, ownerCode]);

  return <div id="map" className="map" />;
}

// utils
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));

const hav = (a: L.LatLng, b: L.LatLng) => {
  const R=6371e3, toR=(d:number)=>d*Math.PI/180;
  const dLat=toR(b.lat-a.lat), dLng=toR(b.lng-a.lng);
  const s1=Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s1));
};

function chains(points: L.LatLng[], max: number): L.LatLng[][] {
  const left = points.slice(); const segs: L.LatLng[][] = [];
  while (left.length>1) {
    const a = left.shift()!;
    let j=-1, best=Infinity;
    for (let i=0;i<left.length;i++){ const d=hav(a,left[i]); if(d<best){best=d;j=i;} }
    if (j>=0 && best<=max) { segs.push([a, left[j]]); left.splice(j,1); }
  }
  return segs;
}
