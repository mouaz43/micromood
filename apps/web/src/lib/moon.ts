// fraction: 0=new, 0.5=full, 1=back to new
export function moonSVG(phaseFrac: number, tint: string) {
  const f = Math.max(0, Math.min(1, phaseFrac));
  // Crescent math: scale the “terminator” ellipse by phase
  const k = Math.abs(0.5 - f) * 2; // 1-> new, 0-> full
  const dir = f <= 0.5 ? 1 : -1;   // waxing vs waning

  return `
<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="g" cx="30%" cy="30%">
      <stop offset="0%" stop-color="${tint}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0.25"/>
    </radialGradient>
    <mask id="m">
      <rect x="0" y="0" width="36" height="36" fill="white"/>
      <ellipse cx="${18 + dir * (10 * (1-k))}" cy="18" rx="${18 * k}" ry="18" fill="black"/>
    </mask>
  </defs>
  <circle cx="18" cy="18" r="16" fill="url(#g)" stroke="rgba(255,255,255,0.35)" />
  <circle cx="18" cy="18" r="16" fill="black" mask="url(#m)"/>
</svg>`;
}

// map moods to tint + phase
export function phaseForMood(mood: string, energy: number) {
  // 0 new (low), 0.5 full (high)
  const base = { HAPPY: .6, SAD: .1, STRESSED: .2, CALM: .4, ENERGIZED: .8, TIRED: .15 }[mood as any] ?? .3;
  // nudge by energy
  return Math.max(0, Math.min(1, base + (energy-3) * 0.06));
}

export function energyTint(energy: number) {
  // soft teal to bright cyan
  const c = [
    '#4a6b6b', '#3fa2a2', '#34c3c3', '#2fd9e5', '#29f0ff'
  ];
  return c[Math.max(1, Math.min(5, energy)) - 1];
}
