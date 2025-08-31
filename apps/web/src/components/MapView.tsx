// apps/web/src/components/MapView.tsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { iconForPoint } from "../lib/pins";
import type { MoodPoint } from "../lib/api";

type Props = {
  center: { lat: number; lng: number };
  points: MoodPoint[];
};

export default function MapView({ center, points }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);

  // init map once
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      center: [center.lat, center.lng],
      zoom: 12,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
  }, []);

  // update center if it changes (first geolocation)
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng]);
    }
  }, [center.lat, center.lng]);

  // render markers when points change
  useEffect(() => {
    const group = markersRef.current;
    if (!mapRef.current || !group) return;
    group.clearLayers();

    points.forEach((p) => {
      const icon = iconForPoint(p);
      const marker = L.marker([p.lat, p.lng], { icon });
      const text = p.text ? `<div class="text-sm">${escapeHtml(p.text)}</div>` : "";
      const when = new Date(p.createdAt).toLocaleString();
      marker.bindPopup(`<div class="font-medium">${p.mood}</div>${text}<div class="opacity-60 text-xs mt-1">${when}</div>`);
      marker.addTo(group);
    });
  }, [points]);

  return <div ref={divRef} className="w-full h-[360px] rounded-xl overflow-hidden border border-white/10" />;
}

// tiny helper
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
