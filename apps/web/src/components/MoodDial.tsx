import React, { useState } from "react";

export type MoodKind = "happy" | "sad" | "stressed" | "calm" | "energized" | "tired";

type Props = {
  /** Called when the user submits a mood. If not provided, it will no-op. */
  onSend?: (mood: MoodKind, energy: number, text?: string) => Promise<void> | void;
};

const MOODS: { key: MoodKind; label: string }[] = [
  { key: "happy",     label: "Happy" },
  { key: "sad",       label: "Sad" },
  { key: "stressed",  label: "Stressed" },
  { key: "calm",      label: "Calm" },
  { key: "energized", label: "Energized" },
  { key: "tired",     label: "Tired" },
];

export default function MoodDial({ onSend }: Props) {
  const [mood, setMood] = useState<MoodKind>("happy");
  const [energy, setEnergy] = useState<number>(3);
  const [text, setText] = useState<string>("");

  const handleSubmit = async () => {
    try {
      if (onSend) {
        await onSend(mood, energy, text.trim() || undefined);
      }
    } catch (err) {
      console.error("Failed to send mood:", err);
      alert("Failed to send mood.");
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-6">
      <h2 className="text-2xl font-semibold mb-4">How do you feel?</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {MOODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMood(m.key)}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              mood === m.key
                ? "border-cyan-400/60 bg-white/5"
                : "border-white/10 bg-white/0 hover:bg-white/5"
            }`}
          >
            <span className="text-base">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="opacity-80">Energy: {energy}</span>
          <span className="opacity-60 text-sm">1–5</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>

      <div className="mb-6">
        <label className="block opacity-80 mb-2 text-sm">What’s on your mind? (optional)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={150}
          placeholder="A short thought, feeling, or moment (max 150 chars)"
          className="w-full rounded-xl border border-white/10 bg-black/20 p-3 outline-none focus:border-cyan-400/60"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="rounded-xl bg-cyan-500/90 hover:bg-cyan-400 text-black font-medium px-5 py-3"
      >
        Send pulse
      </button>
    </section>
  );
}
