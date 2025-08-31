// apps/web/src/lib/pins.ts
import * as L from "leaflet";
import type { MoodPoint } from "./api";
import { makeMoonSVG, energyTint, energyToPhaseFraction } from "./moon";

// Renders a realistic moon marker (continuous phase, seeded texture)
export function iconForPoint(p: MoodPoint) {
  const phaseFrac = energyToPhaseFraction(p.energy); // 0..1
  const tint = energyTint(p.energy);
  const svg = makeMoonSVG({ phaseFrac, tint, seed: p.id, size: 56 });

  return L.divIcon({
    className: "moon-pin",
    html: svg,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -24],
  });
}
