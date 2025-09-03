import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { moonSVG, phaseFor, tintFor } from '../lib/moon';
import { escapeHtml } from '../lib/utils';
import type { Pulse } from '../lib/api';

export default function MapView(props: {
  center: [number,number];
  pulses: Pulse[];
  connect: boolean;
}) {
  const mapRef = useRef<L.Map|null>(null);
  const layerRef = useRef<L.LayerGroup|null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map('map', { zoomControl: true, attributionControl: true }).setView(props.center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
  }, [props.center]);

  useEffect(() => {
    const grp = layerRef.current; if (!grp) return;
    grp.clearLayers();

    // markers
    const byEnergy: Record<number,{lat:number;lng:number}[]> = {};
    for (const p of props.pulses) {
      const frac = phaseFor(p.mood, p.energy);
      const tint = tintFor(p.energy);
      const svg = moonSVG(frac, tint, 38);
      const icon = L.divIcon({ className:'mm-pin', html:`<div class="mm-bubble">${svg}</div>`, iconSize:[38,38], iconAnchor:[19,19] });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(grp);
      const txt = p.text ? `<div class="x">${escapeHtml(p.text)}</div>` : '';
      m.bindPopup(`<div class="popup"><div class="t">${p.mood.toLowerCase()}</div>${txt}</div>`);
      (byEnergy[p.energy] ||= []).push({ lat:p.lat, lng:p.lng });
    }

    if (props.connect) {
      Object.entries(byEnergy).forEach(([energy, arr]) => {
        if (arr.length < 2) return;
        const latlngs = arr.map(a => [a.lat, a.lng]) as [number,number][];
        L.polyline(latlngs, { color: tintFor(Number(energy)), weight: 2, opacity: .7 }).addTo(grp);
      });
    }
  }, [props.pulses, props.connect]);

  return <div id="map" className="map" />;
}
