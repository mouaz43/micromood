// apps/web/src/lib/moon.ts
// High-fidelity procedural moon icons (no emojis).
// - Realistic texture using SVG feTurbulence
// - Limb darkening, soft terminator, rim highlight & glow
// - Seeded so each pin looks slightly different
// - Phase is continuous (0..1). We also expose a discrete energy→phase.

export type MoonPhaseName =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full";

type MakeMoonOpts = {
  // fraction 0..1 (0=new, 0.5=first-quarter, 1=full)
  phaseFrac: number;
  tint: string;         // overall hue accent
  seed: string;         // deterministic texture differences
  size?: number;        // px
};

export function makeMoonSVG(opts: MakeMoonOpts) {
  const size = opts.size ?? 56;
  const R = 22;                    // moon radius in viewBox
  const cx = 28, cy = 28;          // center
  const t = clamp(opts.phaseFrac, 0, 1);

  // --- seeded variations so dots aren’t identical ---
  const s = hash32(opts.seed);
  const rot = (s % 360);                             // random rotation
  const turbSeed = (s * 48271) % 9999;               // texture seed
  const baseFreq = 0.9 + ((s % 7) * 0.03);           // noise scale
  const craterContrast = 0.65 + ((s % 5) * 0.05);    // slightly different surfaces

  // --- build masks for lit side (continuous phase) ---
  // We approximate a realistic terminator by subtracting a shifted circle.
  // d in [-R, +R] shifts how much is lit.
  const d = -R + 2 * R * t; // t=0 -> -R (dark), t=1 -> +R (full)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 56 56">
  <defs>
    <!-- Procedural surface texture -->
    <filter id="surf" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="${baseFreq * 0.012}" numOctaves="4" seed="${turbSeed}" result="n1"/>
      <feTurbulence type="fractalNoise" baseFrequency="${baseFreq * 0.022}" numOctaves="3" seed="${(turbSeed+97)%9999}" result="n2"/>
      <feBlend in="n1" in2="n2" mode="multiply" result="nmix"/>
      <!-- map noise to grayscale craters -->
      <feColorMatrix in="nmix" type="matrix"
        values="
          ${craterContrast} 0 0 0 0
          0 ${craterContrast} 0 0 0
          0 0 ${craterContrast} 0 0
          0 0 0 1 0" result="ncol"/>
      <feGaussianBlur stdDeviation="0.3" result="soft"/>
    </filter>

    <!-- glow -->
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4" result="g"/>
      <feMerge>
        <feMergeNode in="g"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- rim highlight gradient (limb brightening) -->
    <radialGradient id="rim" cx="50%" cy="50%" r="55%">
      <stop offset="80%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.22"/>
    </radialGradient>

    <!-- overall moon tint -->
    <radialGradient id="tint" cx="45%" cy="40%" r="70%">
      <stop offset="0%"  stop-color="${opts.tint}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${opts.tint}" stop-opacity="0.05"/>
    </radialGradient>

    <!-- limb darkening -->
    <radialGradient id="limbDark" cx="50%" cy="50%" r="55%">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#d9e0ef" stop-opacity="0.8"/>
    </radialGradient>

    <!-- disc mask -->
    <mask id="disc">
      <rect width="100%" height="100%" fill="black"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>
    </mask>

    <!-- lit side mask: circle minus offset circle (soft terminator will be added later) -->
    <mask id="lit">
      <rect width="100%" height="100%" fill="black"/>
      <g transform="rotate(${rot} ${cx} ${cy})">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>
        <circle cx="${cx + d}" cy="${cy}" r="${R}" fill="black"/>
      </g>
    </mask>

    <!-- soft terminator overlay (a narrow gradient band along the terminator) -->
    <linearGradient id="term" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.55"/>
      <stop offset="50%"  stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0.10"/>
    </linearGradient>

    <!-- rotate the terminator gradient so it's aligned with the current phase -->
    <mask id="termBand">
      <rect width="100%" height="100%" fill="black"/>
      <rect x="${cx - R - 2}" y="${cy - R - 2}" width="${2*R + 4}" height="${2*R + 4}" fill="white"/>
    </mask>
  </defs>

  <!-- ambient glow -->
  <circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="${opts.tint}" fill-opacity="0.24" filter="url(#glow)"/>

  <!-- base dark disc -->
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="#0b0f1a" mask="url(#disc)"/>

  <!-- lit portion with realistic surface -->
  <g mask="url(#lit)" transform="rotate(${rot} ${cx} ${cy})">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#limbDark)"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#tint)"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" filter="url(#surf)"/>
  </g>

  <!-- soft terminator band -->
  <g transform="rotate(${rot} ${cx} ${cy})" mask="url(#disc)">
    <rect x="0" y="0" width="56" height="56"
          fill="url(#term)"
          transform="translate(${cx - R} ${cy - R})
                     rotate(0 ${R} ${R})
                     scale(${Math.sign(d) || 0.0001},1)"/>
  </g>

  <!-- rim highlight -->
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#rim)" mask="url(#disc)"/>

  <!-- hairline outline -->
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="0.6"/>
</svg>
`.trim();

  return svg;
}

// ===== Utilities =====

export function energyTint(energy: number) {
  // gentle palette, 1..5
  const palette = ["#9fb8ff", "#88e0ff", "#7ee8c9", "#c7b6ff", "#ff9cd6"];
  const idx = clamp(Math.round(energy), 1, 5) - 1;
  return palette[idx];
}

// Discrete energy → phase name (kept for use in other UI if you want)
export function energyToPhase(energy: number): MoonPhaseName {
  switch (clamp(Math.round(energy), 1, 5)) {
    case 1: return "new";
    case 2: return "waxing-crescent";
    case 3: return "first-quarter";
    case 4: return "waxing-gibbous";
    case 5:
    default: return "full";
  }
}

// Continuous energy (1..5) → fraction 0..1
export function energyToPhaseFraction(energy: number) {
  const e = clamp(energy, 1, 5);
  // map 1..5 → 0..1
  return (e - 1) / 4;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function hash32(str: string) {
  // simple 32-bit string hash
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
