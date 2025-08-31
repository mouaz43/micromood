import L from "leaflet";
import type { MoodPoint } from "./api";
import { phaseForMood, energyTint } from "./moon";

export function iconForPoint(p: MoodPoint): L.DivIcon {
  const tint = energyTint(p.energy);
  const phase = phaseForMood(p.mood);
  // Very small moon divicon (SVG inline)
  const svg = `
  <svg width="24" height="24" viewBox="0 0 24 24" style="display:block">
    <defs>
      <radialGradient id="g" cx="50%" cy="35%">
        <stop offset="0%" stop-color="white"/>
        <stop offset="100%" stop-color="#d7e3ff"/>
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#g)"/>
    <circle cx="${12 + 6*Math.cos(phase*2*Math.PI)}" cy="12" r="10" fill="${phase<0.5 ? "#0b1020" : "url(#g)"}" />
    <circle cx="12" cy="12" r="10" fill="none" stroke="${tint}" stroke-opacity=".45"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24,24],
    iconAnchor: [12,12]
  });
}

export const energyColor = (e: number) => energyTint(e);
