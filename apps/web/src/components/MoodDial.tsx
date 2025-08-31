import React, { useState } from "react";
import { Moon } from "../lib/moon";

export type MoodKey = "happy" | "sad" | "stressed" | "calm" | "energized" | "tired";

export const MOODS: { key: MoodKey; label: string; phase: number; tint: string }[] = [
  { key: "happy",     label: "Happy",     phase: 0.50, tint: "#a7f3d0" },
  { key: "sad",       label: "Sad",       phase: 0.00, tint: "#93c5fd" },
  { key: "stressed",  label: "Stressed",  phase: 0.20, tint: "#fca5a5" },
  { key: "calm",      label: "Calm",      phase: 0.75, tint: "#bfdbfe" },
  { key: "energized", label: "Energized", phase: 0.25, tint: "#fde68a" },
  { key: "tired",     label: "Tired",     phase: 0.85, tint: "#c4b5fd" },
];

export default function MoodDial({
  onChange,
}: {
  onChange?: (m: MoodKey) => void;
}) {
  const [selected, setSelected] = useState<MoodKey | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">How do you feel?</h2>
      <div className="mood-grid">
        {MOODS.map((m, i) => {
          const pressed = selected === m.key;
          return (
            <button
              key={m.key}
              type="button"
              className="mood-btn"
              aria-pressed={pressed}
              onClick={() => { setSelected(m.key); onChange?.(m.key); }}
            >
              <Moon phaseFrac={m.phase} tint={m.tint} seed={i}/>
              <span className="text-slate-200">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
