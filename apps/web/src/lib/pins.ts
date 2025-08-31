// apps/web/src/lib/pins.ts
import * as L from "leaflet";
import type { MoodPoint } from "./api";
import { makeMoonSVG, energyTint, energyToPhase } from "./moon";

export function iconForPoint(p: MoodPoint) {
  const tint = energyTint(p.energy);
  const phase = energyToPhase(p.energy);
  const svg = makeMoonSVG({ phase, tint, seed: p.id, size: 52 });

  return L.divIcon({
    className: "moon-pin-wrap",
    html: svg,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -20],
  });
}
