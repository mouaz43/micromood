import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MoodPoint } from "../lib/api";
import { iconForPoint, energyColor } from "../lib/pins";

type Props = {
  center: { lat: number; lng: number };
  points: MoodPoint[] | any;
};

export default function MapView({ center, points }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.LayerGroup | null>(null);
  const [showLinks, setShowLinks] = useState(true);

  // normalize array
  const arr: MoodPoint[] = useMemo(() => {
    if (Array.isArray(points)) return points;
    if (Array.isArray(points?.items)) return points.items;
    if (Array.isArray(points?.data)) return points.data;
    return [];
  }, [points]);

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = L.map(host.current, { center: [center.lat, center.lng], zoom: 12, zoomControl: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    groupRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(()=>{ if (mapRef.current) mapRef.current.setView([center.lat, center.lng]); }, [center.lat, center.lng]);

  // render markers + energy polylines
  useEffect(() => {
    const g = groupRef.current; if (!g) return;
    g.clearLayers();

    // markers
    arr.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: iconForPoint(p) });
      const text = p.text ? `<div class="text-sm">${escapeHtml(p.text)}</div>` : "";
      const when = new Date(p.createdAt).toLocaleString();
      const del = p.deleteToken
        ? `<button data-id="${p.id}" data-token="${p.deleteToken}" class="del-btn">Delete</button>`
        : "";
      marker.bindPopup(
        `<div class="font-medium">${escapeHtml(p.mood)} (energy ${p.energy})</div>${text}
         <div class="opacity-60 text-xs mt-1">${when}</div>
         ${del}`
      );
      marker.addTo(g);
    });

    // energy links
    if (showLinks && arr.length > 1) {
      const byEnergy = new Map<number, MoodPoint[]>();
      for (const p of arr) {
        const list = byEnergy.get(p.energy) ?? [];
        list.push(p);
        byEnergy.set(p.energy, list);
      }
      byEnergy.forEach((list, energy) => {
        // sort oldest→newest for nice ribbons
        list.sort((a,b)=> new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const latlngs = list.map(p => [p.lat, p.lng]) as L.LatLngExpression[];
        L.polyline(latlngs, { color: energyColor(energy), weight: 2, opacity: 0.7 }).addTo(g);
      });
    }

    // bind deletion (event delegation on popupopen)
    const onOpen = (e: any) => {
      const node: HTMLElement | null = (e as any).popup?.getElement?.();
      if (!node) return;
      const btn = node.querySelector<HTMLButtonElement>(".del-btn");
      if (!btn) return;
      btn.onclick = async () => {
        const id = btn.dataset.id!, token = btn.dataset.token!;
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/moods/${id}?token=${encodeURIComponent(token)}`, { method: "DELETE" });
          // simple refresh: remove from map by refiltering parent state — just reload points via location reload event
          window.dispatchEvent(new CustomEvent("micromood:deleted", { detail: { id } }));
        } catch (err) {
          alert("Delete failed.");
        }
      };
    };
    mapRef.current?.on("popupopen", onOpen);
    return () => { mapRef.current?.off("popupopen", onOpen); };
  }, [arr, showLinks]);

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
        <div style={{fontWeight:700}}>Map</div>
        <label className="small" style={{display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
          <input type="checkbox" checked={showLinks} onChange={(e)=> setShowLinks(e.target.checked)} />
          Connect same-energy pulses
        </label>
      </div>
      <div ref={host} className="leaf-wrap" />
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));
}
