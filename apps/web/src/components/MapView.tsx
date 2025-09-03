import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { moonSVG, phaseForMood, energyTint } from '../lib/moon';
import type { Pulse } from '../lib/api';

export default function MapView(props: {
  center: [number, number];
  points: Pulse[];
  connect?: boolean;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map('map', { zoomControl: true, attributionControl: true }).setView(props.center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(() => {
    const grp = layerRef.current;
    if (!grp) return;
    grp.clearLayers();

    // markers
    const markers: L.Marker[] = [];
    for (const p of props.points) {
      const frac = phaseForMood(p.mood, p.energy);
      const svg = moonSVG(frac, energyTint(p.energy));
      const icon = L.divIcon({
        className: 'mm-pin',
        html: `<div class="mm-bubble">${svg}</div>`
      });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(grp);
      m.bindPopup(`<div class="popup"><div class="t">${p.mood.toLowerCase()}</div>${p.text ? `<div class="x">${escapeHtml(p.text)}</div>` : ''}</div>`);
      markers.push(m);
    }

    // optional connections by same energy
    if (props.connect && props.points.length > 1) {
      const byEnergy = new Map<number, Pulse[]>();
      for (const p of props.points) {
        const arr = byEnergy.get(p.energy) ?? [];
        arr.push(p);
        byEnergy.set(p.energy, arr);
      }
      byEnergy.forEach((arr, energy) => {
        if (arr.length < 2) return;
        const latlngs = arr.map(a => [a.lat, a.lng] as [number, number]);
        L.polyline(latlngs, { color: energyTint(energy), weight: 2, opacity: 0.7 }).addTo(grp);
      });
    }
  }, [props.points, props.connect]);

  return <div id="map" className="map" />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]!));
}
