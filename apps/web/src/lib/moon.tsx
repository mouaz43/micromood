import React from "react";

/** phaseFrac: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter */
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
