// apps/web/src/lib/moon.tsx
import React from "react";

/** Map moods to a representative moon phase (0=new, .5=full) */
export function phaseForMood(mood: string): number {
  switch (mood) {
    case "happy": return 0.50;      // full
    case "sad": return 0.00;        // new
    case "stressed": return 0.20;   // waxing crescent
    case "calm": return 0.75;       // waning gibbous/last quarter-ish
    case "energized": return 0.25;  // first quarter
    case "tired": return 0.85;      // waning crescent
    default: return 0.33;
  }
}

/** Subtle color hint by energy 1..5 */
export function energyTint(e: number): string {
  const clamp = (x: number) => Math.max(1, Math.min(5, x));
  const n = clamp(e);
  // cyan -> teal -> lime-ish
  const palette = ["#93c5fd", "#7dd3fc", "#5eead4", "#a7f3d0", "#d9f99d"];
  return palette[n - 1];
}

/** SVG moon with a dynamic phase cutout */
export function Moon({
  phaseFrac,
  tint = "#a7f3d0",
  shadow = "#0b1221",
  size = 36,
  seed,
}: {
  phaseFrac: number;
  tint?: string;
  shadow?: string;
  size?: number;
  seed?: number | string;
}) {
  const f = ((phaseFrac % 1) + 1) % 1;
  const r = 16, cx = 18, cy = 18;
  const k = Math.cos(f * Math.PI * 2);
  const offset = k * r;
  const id = "g" + (seed ?? "m");

  return (
    <svg className="moon" width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="70%" stopColor={tint} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c7ffe8" stopOpacity="0.25" />
        </radialGradient>
        <clipPath id="clip">
          <path
            d={`
              M ${cx - r} ${cy}
              A ${r} ${r} 0 1 0 ${cx + r} ${cy}
              A ${Math.abs(offset)} ${r} 0 1 ${offset < 0 ? 1 : 0} ${cx - r} ${cy}
              Z
            `}
          />
        </clipPath>
      </defs>

      <circle cx={cx} cy={cy} r={r} fill={shadow}/>
      <g clipPath="url(#clip)">
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`}/>
      </g>
      <circle cx={cx} cy={cy} r={r-0.6} fill="none" stroke={tint} strokeOpacity=".35" strokeWidth=".8"/>
    </svg>
  );
}
