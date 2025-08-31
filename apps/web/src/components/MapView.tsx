import React, { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  mood: string;
  energy: number;
  text?: string | null;
  lat: number;
  lng: number;
  createdAt: string;
};

export type Bounds = { north: number; south: number; east: number; west: number };

type Props = {
  center: [number, number];
  points: MapPoint[];
  owner: boolean;
  onDeleteSelf: (id: string) => Promise<void>;
  onOwnerDelete: (b: Bounds) => Promise<void>;
};

const MOOD_COLORS: Record<string, string> = {
  happy: "#6cffc7",
  sad: "#89a2ff",
  stressed: "#ff9a8b",
  calm: "#9bffd0",
  energized: "#ffd66b",
  tired: "#c6c6ff",
};

export default function MapView({ center, points, owner, onDeleteSelf, onOwnerDelete }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const lineRef = useRef<L.LayerGroup | null>(null);

  // init map
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      center,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      crossOrigin: true,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    lineRef.current = L.layerGroup().addTo(map);
  }, []);

  // recenter when geolocated
  useEffect(() => {
    mapRef.current?.setView(center, 12);
  }, [center]);

  // draw points & connections
  useEffect(() => {
    const lg = layerRef.current;
    const lg2 = lineRef.current;
    if (!lg || !lg2) return;
    lg.clearLayers();
    lg2.clearLayers();

    // index by mood for constellations
    const byMood: Record<string, L.LatLng[]> = {};

    points.forEach((p) => {
      const color = MOOD_COLORS[p.mood] || "#b3c7ff";
      const r = 6 + p.energy * 2;

      const m = L.circleMarker([p.lat, p.lng], {
        radius: r,
        color: "transparent",
        fillColor: color,
        fillOpacity: 0.75,
        className: "lantern",
      }).addTo(lg);

      const html = `
        <div class="popup">
          <div class="font-medium">${p.mood}</div>
          ${p.text ? `<div class="text-sm mt-1">${escapeHtml(p.text)}</div>` : ""}
          <div class="text-xs opacity-70 mt-1">${new Date(p.createdAt).toLocaleString()}</div>
          <button class="pop-delete" data-id="${p.id}">Delete mine</button>
        </div>
      `;
      m.bindPopup(html, { closeButton: true });

      m.on("popupopen", (e) => {
        const el = (e as any).popup._container as HTMLElement;
        const btn = el.querySelector<HTMLButtonElement>(".pop-delete");
        if (btn) btn.onclick = () => onDeleteSelf(btn.dataset.id!);
      });

      (byMood[p.mood] ||= []).push(new L.LatLng(p.lat, p.lng));
    });

    // draw faint constellations between nearby same-mood points
    const dist = (a: L.LatLng, b: L.LatLng) => a.distanceTo(b); // meters
    const MAX = 18_000; // 18km

    Object.entries(byMood).forEach(([mood, arr]) => {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (dist(arr[i], arr[j]) < MAX) {
            L.polyline([arr[i], arr[j]], {
              color: MOOD_COLORS[mood] || "#b3c7ff",
              weight: 1.5,
              opacity: 0.25,
            }).addTo(lg2);
          }
        }
      }
    });
  }, [points, onDeleteSelf]);

  // OWNER moonbeam rectangle (Shift+Drag)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let start: L.LatLng | null = null;
    let rect: L.Rectangle | null = null;

    function down(ev: L.LeafletMouseEvent) {
      if (!owner || !ev.originalEvent.shiftKey) return;
      start = ev.latlng;
      rect = L.rectangle([start, start], {
        color: "#70e1ff",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.08,
      }).addTo(map);
    }
    function move(ev: L.LeafletMouseEvent) {
      if (!start || !rect) return;
      rect.setBounds(L.latLngBounds(start, ev.latlng));
    }
    async function up(ev: L.LeafletMouseEvent) {
      if (!start || !rect) return;
      const b = rect.getBounds();
      const bounds = {
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      };
      rect.remove();
      start = null;
      rect = null;
      await onOwnerDelete(bounds);
    }

    map.on("mousedown", down);
    map.on("mousemove", move);
    map.on("mouseup", up);
    return () => {
      map.off("mousedown", down);
      map.off("mousemove", move);
      map.off("mouseup", up);
    };
  }, [owner, onOwnerDelete]);

  return <div className="mapwrap"><div ref={ref} className="map" /></div>;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
