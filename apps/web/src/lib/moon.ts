// apps/web/src/lib/moon.ts
//
// Tiny SVG factory for “real” moons (no emojis).
// - Multiple phases (new, crescents, quarters, gibbous, full)
// - Soft glow + tint per energy
// - Deterministic crater speckles from a seed (so each dot looks a bit unique)
//
// Usage: makeMoonSVG({ phase: 'waxing-crescent', tint: '#b3c7ff', seed: 'some-id' })

export type MoonPhase =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export function makeMoonSVG(opts: {
  phase: MoonPhase;
  tint: string;       // main color (we layer tints on top of pale moon)
  seed: string;       // deterministic sprinkling of tiny craters
  size?: number;      // px
}) {
  const size = opts.size ?? 48;  // overall icon size
  const r = 18;                  // moon radius inside viewBox
  const cx = 24, cy = 24;        // center
  const tint = opts.tint;

  // simple deterministic PRNG from string
  let h = 2166136261 >>> 0;
  for (let i = 0; i < opts.seed.length; i++) {
    h ^= opts.seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2**32;

  // generate 8–12 small crater dots with tiny variance
  const craterCount = 8 + Math.floor(rnd() * 5);
  const craters = Array.from({ length: craterCount }).map((_, i) => {
    // place craters more toward the center
    const angle = rnd() * Math.PI * 2;
    const dist = Math.pow(rnd(), 1.7) * (r - 5);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const rr = 0.7 + rnd() * 1.6;
    const op = 0.2 + rnd() * 0.25;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="#000" fill-opacity="${op.toFixed(2)}"/>`;
  }).join('');

  // Phase masks via two circles. For gibbous/crescent we offset the terminator circle.
  const offset = (d: number) => cx + d;
  // Offsets tuned for nicer shapes
  const OFF = {
    'new':             0,
    'waxing-crescent': -9,
    'first-quarter':   0,
    'waxing-gibbous':  7,
    'full':            0,
    'waning-gibbous':  -7,
    'last-quarter':    0,
    'waning-crescent': 9,
  }[opts.phase];

  // Two core masks:
  // - litMask: what part is “lit” (white)
  // - darkMask: overall disc shape
  // For simple, good-looking phases we combine circles with inverse fills.
  const phaseMask = (() => {
    switch (opts.phase) {
      case 'new':
        // fully dark
        return `
        <mask id="lit">
          <rect width="100%" height="100%" fill="black"/>
        </mask>`;
      case 'full':
        // fully lit
        return `
        <mask id="lit">
          <rect width="100%" height="100%" fill="black"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
        </mask>`;
      case 'first-quarter':
      case 'last-quarter':
        // exactly half lit: clip along center line
        // first-quarter = right side lit, last-quarter = left side lit
        const right = opts.phase === 'first-quarter';
        return `
        <mask id="lit">
          <rect width="100%" height="100%" fill="black"/>
          <rect x="${right ? cx : 0}" y="0" width="${right ? cx : cx}" height="100%" fill="white"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
        </mask>`;
      default:
        // crescents/gibbous via two circles
        return `
        <mask id="lit">
          <rect width="100%" height="100%" fill="black"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
          <circle cx="${offset(OFF)}" cy="${cy}" r="${r}" fill="black"/>
        </mask>`;
    }
  })();

  // Soft glow + subtle gradient on the lit side
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="moonShine" cx="50%" cy="45%" r="60%">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#d7e2ff" stop-opacity="0.9"/>
    </radialGradient>
    <radialGradient id="tint" cx="60%" cy="40%" r="70%">
      <stop offset="0%"  stop-color="${tint}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0.05"/>
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${phaseMask}
    <mask id="disc">
      <rect width="100%" height="100%" fill="black"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
    </mask>
  </defs>

  <!-- overall glow -->
  <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${tint}" fill-opacity="0.25" filter="url(#softGlow)"/>

  <!-- base moon (dark) -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b0f1a" mask="url(#disc)"/>

  <!-- lit portion -->
  <g mask="url(#lit)">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#moonShine)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tint)"/>
    <!-- craters show only inside lit area -->
    ${craters}
  </g>

  <!-- tiny rim highlight -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-opacity="0.15" stroke-width="0.5"/>
</svg>
`;
  return svg.trim();
}

// helper palettes you can reuse
export function energyTint(energy: number) {
  // 1..5 → cool to warm-ish
  const palette = ['#8fb7ff', '#7ed7f8', '#7ce7c4', '#c5b6ff', '#ff9ad2'];
  const idx = Math.min(5, Math.max(1, energy)) - 1;
  return palette[idx];
}

export function moodToPhase(mood: string): MoonPhase {
  const m = mood.toLowerCase();
  if (m.includes('happy') || m.includes('love') || m.includes('joy')) return 'full';
  if (m.includes('calm') || m.includes('peace')) return 'first-quarter';
  if (m.includes('energ')) return 'waxing-gibbous';
  if (m.includes('tired')) return 'last-quarter';
  if (m.includes('stress') || m.includes('anx')) return 'waning-crescent';
  if (m.includes('sad') || m.includes('down')) return 'waning-crescent';
  // default: waxing-crescent
  return 'waxing-crescent';
}
