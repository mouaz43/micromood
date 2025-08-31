import React from "react";

/**
 * Map mood → lunar phase (0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter, 1=new).
 * Tweak these to taste.
 */
export function phaseForMood(mood: string): number {
  const m = mood.toLowerCase();
  if (m === "happy") return 0.18;      // waxing crescent
  if (m === "sad") return 0.02;        // very new (almost dark)
  if (m === "stressed") return 0.30;   // waxing quarter
  if (m === "calm") return 0.52;       // full-ish
  if (m === "energized") return 0.65;  // waning gibbous
  if (m === "tired") return 0.82;      // waning crescent
  return 0.5;
}

/** 1..5 → tint color */
export function energyTint(energy: number): string {
  const hues = [190, 210, 235, 270, 310]; // cyan → violet
  const idx = Math.max(0, Math.min(4, (energy | 0) - 1));
  return `hsl(${hues[idx]}, 90%, 65%)`;
}

/**
 * A high-quality moon icon with:
 *  - physically-inspired phase mask (soft terminator)
 *  - slight albedo gradient
 *  - subtle crater field
 *  - rim glow varying with energy tint
 */
export function MoonIcon({
  size = 28,
  phaseFrac,
  tint = "#9ad1ff",
  ring = false,
  crisp = false,
}: {
  size?: number;
  phaseFrac: number; // 0..1
  tint?: string;
  ring?: boolean;    // outer ring
  crisp?: boolean;   // crisper terminator edge
}) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Convert 0..1 phase into a signed terminator offset.
  // 0=new (dark), 0.5=full (bright).
  // Direction: waxing to the right until full, then waning to the left.
  const twoPi = Math.PI * 2;
  const cos = Math.cos(twoPi * phaseFrac); // -1..1
  // amount shifts the shadow disk horizontally across the lit disc
  const offset = (r - 2) * 0.72 * cos;

  // Terminator softness (blur) – slightly softer near full/ new
  const softness = crisp ? 0.35 : 0.6;

  // Crater seed (stable for a phase)
  const seed = Math.floor(phaseFrac * 1000);

  // Deterministic pseudo-random for crater placement
  const rand = (() => {
    let s = seed || 1;
    return () => (s = (s * 9301 + 49297) % 233280) / 233280;
  })();

  // Build a few subtle craters (positions & sizes)
  const craters = Array.from({ length: 7 }, (_, i) => {
    const a = rand() * twoPi;
    const d = (rand() ** 0.6) * (r - 5); // biased toward center
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * 0.98; // slight vertical squash
    const rr = 0.9 + rand() * 1.8;
    const shade = 0.12 + rand() * 0.08;
    return { x, y, rr, shade, key: i };
  });

  const view = `0 0 ${size} ${size}`;

  return (
    <svg width={size} height={size} viewBox={view} aria-hidden>
      <defs>
        {/* Moon surface albedo */}
        <radialGradient id="moonAlbedo" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#eff3ff" />
          <stop offset="100%" stopColor="#cfdbf8" />
        </radialGradient>

        {/* Outer glow colorized by energy tint */}
        <radialGradient id="rimGlow" cx="50%" cy="50%" r="60%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor={tint} />
        </radialGradient>

        {/* Soft terminator (blur over the mask) */}
        <filter id="softTerm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={softness * (size / 20)} />
        </filter>

        {/* Delicate grain so it feels less flat (very light) */}
        <filter id="grain" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0 0 0 0 0.04" />{/* very subtle */}
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="overlay" />
        </filter>

        {/* Phase mask: full disc minus a shifted dark disc (with blur) */}
        <mask id="phaseMask">
          <rect width={size} height={size} fill="black" />
          {/* lit disc */}
          <circle cx={cx} cy={cy} r={r - 2} fill="white" />
          {/* subtract the shadow disc by painting black over it */}
          <g filter="url(#softTerm)">
            <circle cx={cx + offset} cy={cy} r={r - 2} fill="black" />
          </g>
        </mask>
      </defs>

      {/* Outer aura ring (optional) */}
      {ring && (
        <circle
          cx={cx}
          cy={cy}
          r={r - 1}
          fill="none"
          stroke={tint}
          strokeOpacity="0.35"
          strokeWidth={Math.max(1, size * 0.06)}
        />
      )}

      {/* Glow softly outside the disc */}
      <circle cx={cx} cy={cy} r={r} fill="url(#rimGlow)" opacity="0.12" />

      {/* Moon disc with phase mask + slight grain */}
      <g mask="url(#phaseMask)" filter="url(#grain)">
        <circle cx={cx} cy={cy} r={r - 2} fill="url(#moonAlbedo)" />
        {/* crater field (very gentle) */}
        <g opacity="0.35">
          {craters.map((c) => (
            <g key={c.key}>
              <circle cx={c.x} cy={c.y} r={c.rr + 0.6} fill={`rgba(0,0,0,${c.shade * 0.9})`} />
              <circle cx={c.x - c.rr * 0.35} cy={c.y - c.rr * 0.35} r={c.rr * 0.7} fill="#ffffff" opacity="0.35" />
            </g>
          ))}
        </g>
      </g>

      {/* Rim highlight to sell the sphere */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 2}
        fill="none"
        stroke={tint}
        strokeOpacity="0.28"
        strokeWidth={Math.max(1, size * 0.05)}
      />
    </svg>
  );
}

export default MoonIcon;
