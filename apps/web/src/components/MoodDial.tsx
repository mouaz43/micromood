import React from "react";

// phase = 0 (new) → 1 (full) → 2 (new)
export default function MoodDial({
  size = 28,
  phase,
  active,
}: {
  size?: number;
  phase: number; // 0..2
  active?: boolean;
}) {
  const R = size / 2;
  const k = Math.cos(phase * Math.PI); // -1..1 (ellipse width)
  const limb = Math.abs(k) * R;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`moondial ${active ? "active" : ""}`}
      aria-hidden
    >
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#dfe7ff" />
        </radialGradient>
      </defs>

      <circle cx={R} cy={R} r={R - 1} fill="url(#g)" />
      {/* limb mask */}
      <mask id="m">
        <rect width={size} height={size} fill="white" />
        <ellipse cx={R} cy={R} rx={limb} ry={R - 1} fill="black" />
      </mask>

      <circle cx={R} cy={R} r={R - 1} fill="#0a0f1e" mask="url(#m)" />
      <circle cx={R} cy={R} r={R - 1} fill="none" stroke="#70e1ff22" strokeWidth="1.5" />
    </svg>
  );
}
