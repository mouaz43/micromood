import React, { useEffect, useRef } from "react";

export type MoodKind = "happy" | "sad" | "stressed" | "calm" | "energized" | "tired";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  mood: MoodKind;
  energy: number;
  text?: string;
  createdAt?: string;
};

/** Accept both tuple and object centers to avoid TS mismatches. */
type Center = [number, number] | { lat: number; lng: number };

type Props = {
  center?: Center;          // defaults to [0,0]
  points?: MapPoint[];      // defaults to []
};

function normalizeCenter(c?: Center): [number, number] {
  if (!c) return [0, 0];
  return Array.isArray(c) ? c : [c.lat, c.lng];
}

/**
 * Lightweight Leaflet wrapper with graceful fallback if Leaflet isn't on the page.
 */
export default function MapView({ center, points = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const L = (window as any).L;
    const el = containerRef.current;
    if (!el) return;

    if (!L) {
      el.innerHTML =
        '<div style="padding:16px;border:1px dashed rgba(255,255,255,.15);border-radius:12px;color:#cfe0ff;">Map unavailable (Leaflet not loaded).</div>';
      return;
    }

    const [lat, lng] = normalizeCenter(center);

    if (!mapRef.current) {
      mapRef.current = L.map(el, { zoomControl: true }).setView([lat, lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng]);
    }

    // clear markers
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    points.forEach((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: 8 + (p.energy ?? 0),
        color: "rgba(102, 225, 255, 0.9)",
        weight: 2,
        fillColor: "rgba(102, 225, 255, 0.25)",
        fillOpacity: 0.6,
      })
        .bindPopup(
          `<div class="font-medium">${p.mood}</div>` +
            (p.text ? `<div class="opacity-60 text-xs mt-1">${p.text}</div>` : ``)
        )
        .addTo(mapRef.current);

      markersRef.current.push(m);
    });
  }, [center, points]);

  return <div ref={containerRef} style={{ height: 360, borderRadius: 12, overflow: "hidden" }} />;
}
