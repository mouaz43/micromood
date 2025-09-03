export function moonSVG(phase: number, tint: string, size = 38) {
  const s = Math.max(0, Math.min(1, phase));
  const k = Math.abs(0.5 - s) * 2;
  const dir = s <= 0.5 ? 1 : -1;
  const r = size / 2;
  const cx = r, cy = r;
  const rx = r, ry = r * 0.98;
  const ex = cx + dir * (r * 0.62 * (1 - k));

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="lit" cx="32%" cy="26%">
      <stop offset="0%" stop-color="${tint}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity=".28"/>
    </radialGradient>
    <filter id="soft">
      <feGaussianBlur stdDeviation="${size*0.02}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <mask id="term">
      <rect x="0" y="0" width="${size}" height="${size}" fill="white"/>
      <ellipse cx="${ex}" cy="${cy}" rx="${rx*k}" ry="${ry}" fill="black"/>
    </mask>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r-1}" fill="url(#lit)" stroke="rgba(255,255,255,.35)" filter="url(#soft)"/>
  <circle cx="${cx}" cy="${cy}" r="${r-1}" fill="#000" mask="url(#term)"/>
</svg>`;
}

export function phaseFor(mood: string, energy: number) {
  const base = { HAPPY:.6, SAD:.08, STRESSED:.2, CALM:.4, ENERGIZED:.82, TIRED:.14 }[mood as any] ?? .3;
  return Math.max(0, Math.min(1, base + (energy-3)*0.06));
}

export function tintFor(energy: number) {
  const c = ['#446f86','#1aa3be','#22c6e2','#22d9f0','#29f0ff'];
  return c[Math.max(1, Math.min(5, energy))-1];
}
