import React from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getRecentMoods, deleteMood } from "../lib/api";
import { MOODS } from "./MoodDial";

type MoodPoint = {
  id: string;
  mood: string;
  energy: number;
  text?: string;
  lat: number; lng: number;
  createdAt: string;
};

const MOOD_COLOR: Record<string,string> = {
  happy:"#22d3ee", sad:"#93c5fd", stressed:"#fca5a5",
  calm:"#bfdbfe", energized:"#fde68a", tired:"#c4b5fd"
};

export default function MapView() {
  const mapRef = React.useRef<LeafletMap | null>(null);
  const layerRef = React.useRef<L.LayerGroup | null>(null);
  const linesRef = React.useRef<L.LayerGroup | null>(null);

  React.useEffect(() => {
    if (mapRef.current) return;
    const m = L.map("mm-map", { zoomControl:true }).setView([50.11, 8.68], 12);
    mapRef.current = m;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:'&copy; OpenStreetMap contributors'
    }).addTo(m);

    layerRef.current = L.layerGroup().addTo(m);
    linesRef.current = L.layerGroup().addTo(m);

    loadPoints();
    // refresh every 60s
    const t = setInterval(loadPoints, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPoints() {
    const data: MoodPoint[] = await getRecentMoods(720);
    draw(data);
  }

  function draw(points: MoodPoint[]) {
    const layer = layerRef.current!, lines = linesRef.current!;
    layer.clearLayers(); lines.clearLayers();

    // markers
    points.forEach((p) => {
      const color = MOOD_COLOR[p.mood] || "#a7f3d0";
      const icon = L.divIcon({
        className: "mm-pin",
        html: `
          <div style="
            width:14px;height:14px;border-radius:50%;
            background:${color}; box-shadow:0 0 0 3px rgba(0,0,0,.25);
            ">
          </div>`,
        iconSize: [14,14], iconAnchor:[7,7]
      });

      const marker = L.marker([p.lat, p.lng], { icon }).addTo(layer);
      const esc = (s:string) => s.replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
      marker.bindPopup(`
        <div class="font-medium">${esc(p.mood)}</div>
        ${p.text ? `<div class="opacity-60 text-xs mt-1">${esc(p.text)}</div>` : ""}
        <div class="mt-2">
          <button id="del-${p.id}" class="btn">Delete</button>
        </div>
      `);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`del-${p.id}`);
        if (!btn) return;
        btn.addEventListener("click", async () => {
          const owner = localStorage.getItem("mm_owner") === "1";
          if (!owner) { alert("Enable Owner mode (top-right) to delete."); return; }
          let token: string | undefined;
          // try local storage, otherwise ask
          const map = JSON.parse(localStorage.getItem("mm_tokens") || "{}");
          token = map[p.id];
          if (!token) token = prompt("Delete token for this pulse?") || undefined;
          try {
            await deleteMood(p.id, token);
            loadPoints();
          } catch (e:any) {
            alert("Failed to delete: " + (e?.message || e));
          }
        }, { once:true });
      });
    });

    // connect dots with same mood (within ~20km), grouped by mood
    const byMood: Record<string, MoodPoint[]> = {};
    points.forEach(p => { (byMood[p.mood] ??= []).push(p); });
    const R = 6371; // km
    const toRad = (d:number)=>d*Math.PI/180;
    const dist = (a: MoodPoint, b: MoodPoint) => {
      const dLat = toRad(b.lat-a.lat), dLng = toRad(b.lng-a.lng);
      const s1 = Math.sin(dLat/2), s2 = Math.sin(dLng/2);
      return 2*R*Math.asin(Math.sqrt(s1*s1 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*s2*s2));
    };

    Object.entries(byMood).forEach(([mood, arr]) => {
      const color = MOOD_COLOR[mood] || "#22d3ee";
      // naive nearest-neighbour chaining
      const used = new Set<number>();
      for (let i=0;i<arr.length;i++){
        if (used.has(i)) continue;
        let chain: L.LatLngExpression[] = [[arr[i].lat, arr[i].lng]];
        let last = i;
        used.add(i);
        while (true) {
          let best = -1, bestD = Infinity;
          for (let j=0;j<arr.length;j++){
            if (used.has(j) || j===last) continue;
            const d = dist(arr[last], arr[j]);
            if (d < 20 && d < bestD) { best=j; bestD=d; }
          }
          if (best<0) break;
          used.add(best);
          chain.push([arr[best].lat, arr[best].lng]);
          last = best;
        }
        if (chain.length>1) {
          L.polyline(chain, { color, weight:2, opacity:.5 }).addTo(lines);
        }
      }
    });
  }

  return <div id="mm-map" style={{minHeight: 360, width:"100%"}} />;
}
