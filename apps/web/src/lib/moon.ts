// Moon drawing + mapping. phaseFrac 0=new, 0.5=full, 1=new.
import React from "react";

export function phaseForMood(mood: string): number {
  const order = ["happy","sad","stressed","calm","energized","tired"];
  const idx = Math.max(0, order.indexOf(mood.toLowerCase()));
  return [0.1,0.28,0.42,0.58,0.72,0.9][idx] ?? 0.5;
}

export function energyTint(energy: number): string {
  // 1..5 → hues (cyan→violet)
  const hues = [185, 200, 220, 265, 300];
  return `hsl(${hues[Math.max(0,Math.min(4,energy-1))]}, 90%, 65%)`;
}

export function MoonIcon({
  size = 28,
  phaseFrac,
  tint = "#8bd3ff",
  ring = false
}: { size?: number; phaseFrac: number; tint?: string; ring?: boolean }) {
  const r = size/2;
  // simple “shadow disc” algorithm
  const k = Math.cos(phaseFrac * Math.PI * 2); // -1..1
  const cx = r + (r*0.6)*k;                    // offset for terminator
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id="mcore" cx="50%" cy="35%">
          <stop offset="0%" stopColor="white"/>
          <stop offset="100%" stopColor="#d7e3ff"/>
        </radialGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.6"/>
        </filter>
      </defs>
      {ring && (
        <circle cx={r} cy={r} r={r-1} fill="none" stroke={tint} strokeOpacity="0.35" strokeWidth="2"/>
      )}
      {/* lit disc */}
      <circle cx={r} cy={r} r={r-2} fill="url(#mcore)" />
      {/* shadow disc */}
      <circle cx={cx} cy={r} r={r-2} fill={phaseFrac<0.5 ? "#0a0f1e" : "url(#mcore)"} filter="url(#soft)"/>
      {/* glow */}
      <circle cx={r} cy={r} r={r-2} fill="none" stroke={tint} strokeOpacity=".25" />
    </svg>
  );
}
