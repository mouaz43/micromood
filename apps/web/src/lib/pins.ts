import * as L from "leaflet";
import type { MoodPoint } from "./api";
import { makeMoonSVG, energyTint, energyToPhaseFraction } from "./moon";

// Marker icon: moon with continuous phase based on energy
export function iconForPoint(p: MoodPoint) {
  const phaseFrac = energyToPhaseFraction(p.energy); // 0..1
  const tint = energyTint(p.energy);
  const svg = makeMoonSVG({ phaseFrac, tint, size: 56 }); // ← no 'seed'

  return L.divIcon({
    className: "moon-pin",
    html: svg,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -24],
  });
}
