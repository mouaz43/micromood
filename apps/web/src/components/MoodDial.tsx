// src/components/MoodDial.tsx
import React from "react";

/**
 * Map an energy value (0–100) to a moon phase index (0–7).
 * 0=new, 4=full. Bins are ~12.5 wide.
 */
function energyToPhase(energy: number): Phase {
  const e = Math.max(0, Math.min(100, Math.round(energy)));
  return Math.min(7, Math.floor(e / 12.5)) as Phase;
}

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const PHASE_LABELS: Record<Phase, string> = {
  0: "New",
  1: "Waxing Crescent",
  2: "First Quarter",
  3: "Waxing Gibbous",
  4: "Full",
  5: "Waning Gibbous",
  6: "Last Quarter",
  7: "Waning Crescent",
};

type MoodDialProps = {
  /** 0–100 */
  energy: number;
  /** px size of the icon */
  size?: number;
  /** show label under the moon */
  showLabel?: boolean;
  /** optional className pass-through */
  className?: string;
};

/**
 * SVG Moon icon for 8 phases, self-contained (no assets, no libs).
 * Drawn as a circle with a dynamic clipping crescent using two arcs.
 */
function MoonIcon({ phase, size = 88 }: { phase: Phase; size?: number }) {
  // colors are neutral; the parent can tint via CSS filters if needed
  const bg = "#0B0B0D";
  const moon = "#F4F6FA";

  // We render a base circle (moon) and overlay a shadow circle shifted left/right.
  // The amount of shift controls crescent thickness. Full = no shadow; New = fully covered.
  // For quarter phases we fully clip half.
  // shift is in [-1, 1]; negative = waxing (shadow on left), positive = waning (shadow on right).
  const cfg: Record<Phase, { shift: number; half?: "left" | "right" | null }> = {
    0: { shift: 0, half: "left" }, // New (fully dark via left half)
    1: { shift: -0.6, half: null }, // Waxing Crescent
    2: { shift: -1, half: "right" }, // First Quarter (right half lit)
    3: { shift: -0.6, half: null }, // Waxing Gibbous
    4: { shift: 0, half: null }, // Full (no shadow)
    5: { shift: 0.6, half: null }, // Waning Gibbous
    6: { shift: 1, half: "left" }, // Last Quarter (left half lit)
    7: { shift: 0.6, half: null }, // Waning Crescent
  };

  const s = size;
  const r = s / 2;
  const { shift, half } = cfg[phase];

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      role="img"
      aria-label={`Moon phase: ${PHASE_LABELS[phase]}`}
    >
      {/* Background */}
      <rect x="0" y="0" width={s} height={s} rx={r * 0.2} fill={bg} />

      {/* Full moon circle */}
      <circle cx={r} cy={r} r={r * 0.72} fill={moon} />

      {/* Shadow logic */}
      {half ? (
        // Hard half mask (quarters & new)
        <rect
          x={half === "left" ? 0 : r}
          y={r - r * 0.72}
          width={r}
          height={r * 1.44}
          fill={bg}
        />
      ) : phase === 4 ? null : (
        // Soft crescent mask: a same-size circle shifted horizontally
        <circle
          cx={r + shift * r * 0.72}
          cy={r}
          r={r * 0.72}
          fill={bg}
        />
      )}

      {/* subtle outline */}
      <circle
        cx={r}
        cy={r}
        r={r * 0.72}
        fill="none"
        stroke="#22242A"
        strokeWidth={Math.max(1, s * 0.012)}
      />
    </svg>
  );
}

export default function MoodDial({
  energy,
  size = 88,
  showLabel = true,
  className,
}: MoodDialProps) {
  const phase = energyToPhase(energy);
  const label = PHASE_LABELS[phase];

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        userSelect: "none",
      }}
    >
      <MoonIcon phase={phase} size={size} />
      {showLabel && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: Math.max(12, Math.round(size * 0.18)),
              lineHeight: 1.1,
              fontWeight: 600,
              color: "#EAECEF",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: Math.max(10, Math.round(size * 0.14)),
              lineHeight: 1.1,
              opacity: 0.8,
              color: "#9AA3AE",
            }}
          >
            Energy: {Math.max(0, Math.min(100, Math.round(energy)))}%
          </div>
        </div>
      )}
    </div>
  );
}
