// apps/web/src/lib/moon.ts
// Moon SVG factory with energy-driven phases (no emojis).

export type MoonPhase =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full";

export function makeMoonSVG(opts: {
  phase: MoonPhase;
  tint: string;     // color wash
  seed: string;     // deterministic craters
  size?: number;    // px
}) {
  const size = opts.size ?? 48;
  const r = 18;
  const cx = 24;
  const cy = 24;
  const tint = opts.tint;

  // deterministic PRNG from seed
  let h = 2166136261 >>> 0;
  for (let i = 0; i < opts.seed.length; i++) {
    h ^= opts.seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () =>
    ((h =
      Math.imul(h ^ (h >>> 15), 2246822507) ^
      Math.imul(h ^ (h >>> 13), 3266489909)) >>>
      0) /
    2 ** 32;

  // crater dots
  const craterCount = 6 + Math.floor(rnd() * 5);
  const craters = Array.from({ length: craterCount })
    .map(() => {
      const angle = rnd() * Math.PI * 2;
      const dist = Math.pow(rnd(), 1.7) * (r - 5);
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const rr = 0.7 + rnd() * 1.6;
      const op = 0.2 + rnd() * 0.3;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(
        1
      )}" r="${rr.toFixed(1)}" fill="#000" fill-opacity="${op.toFixed(2)}"/>`;
    })
    .join("");

  // offset for the terminator circle (for crescent/gibbous)
  const OFF: Record<MoonPhase, number> = {
    new: 0,
    "waxing-crescent": -9,
    "first-quarter": 0,
    "waxing-gibbous": 7,
    full: 0,
  };

  const phaseMask = (() => {
    switch (opts.phase) {
      case "new":
        return `<mask id="lit"><rect width="100%" height="100%" fill="black"/></mask>`;
      case "full":
        return `<mask id="lit"><rect width="100%" height="100%" fill="black"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/></mask>`;
      case "first-quarter":
        // right side lit
        return `<mask id="lit"><rect width="100%" height="100%" fill="black"/><rect x="${cx}" y="0" width="${cx}" height="100%" fill="white"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/></mask>`;
      default:
        // crescents/gibbous via two circles
        return `<mask id="lit"><rect width="100%" height="100%" fill="black"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/><circle cx="${
          cx + OFF[opts.phase]
        }" cy="${cy}" r="${r}" fill="black"/></mask>`;
    }
  })();

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <defs>
    <radialGradient id="moonShine" cx="50%" cy="45%" r="60%">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#d7e2ff"/>
    </radialGradient>
    <radialGradient id="tint" cx="60%" cy="40%" r="70%">
      <stop offset="0%"  stop-color="${tint}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0.05"/>
    </radialGradient>
    ${phaseMask}
    <mask id="disc">
      <rect width="100%" height="100%" fill="black"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
    </mask>
  </defs>

  <!-- soft aura -->
  <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${tint}" fill-opacity="0.25"/>
  <!-- base disc -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b0f1a" mask="url(#disc)"/>

  <!-- lit portion -->
  <g mask="url(#lit)">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#moonShine)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tint)"/>
    ${craters}
  </g>

  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-opacity="0.15" stroke-width="0.5"/>
</svg>
`.trim();
}

// color palette by energy (1..5)
export function energyTint(energy: number) {
  const palette = ["#8fb7ff", "#7ed7f8", "#7ce7c4", "#c5b6ff", "#ff9ad2"];
  const idx = Math.min(5, Math.max(1, energy)) - 1;
  return palette[idx];
}

// map energy (1..5) → moon phase
export function energyToPhase(energy: number): MoonPhase {
  switch (Math.max(1, Math.min(5, Math.round(energy)))) {
    case 1:
      return "new";
    case 2:
      return "waxing-crescent";
    case 3:
      return "first-quarter";
    case 4:
      return "waxing-gibbous";
    case 5:
    default:
      return "full";
  }
}
