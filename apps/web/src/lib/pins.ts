// apps/web/src/lib/pins.ts
import * as L from 'leaflet'
import type { MoodPoint } from './api'
import { makeMoonSVG, energyTint, moodToPhase } from './moon'

// optional short label under the pin (first words of message)
const snippet = (msg?: string|null, max=22) =>
  (msg ? (msg.trim().length>max ? msg.trim().slice(0,max-1)+'…' : msg.trim()) : '');

export function iconForPoint(p: MoodPoint) {
  const tint = energyTint(p.energy);
  const phase = moodToPhase(p.mood);
  const svg = makeMoonSVG({ phase, tint, seed: p.id, size: 52 });

  const label = snippet(p.message);
  const html = `
    <div class="moon-pin">
      ${svg}
      ${label ? `<div class="moon-pin__tag">${escapeHtml(label)}</div>` : ''}
    </div>
  `.trim();

  return L.divIcon({
    className: 'moon-pin-wrap',
    html,
    iconSize: [52, 64],
    iconAnchor: [26, 48],
    popupAnchor: [0, -28],
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string)
  );
}
