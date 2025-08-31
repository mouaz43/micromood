import { useMemo, useState } from "react";
import { makeMoonSVG, energyToPhase, energyTint } from "../lib/moon";

type Props = {
  onSubmit: (mood: string, energy: number, text?: string) => void;
  loading?: boolean;
};

const MOODS = ["Happy", "Sad", "Stressed", "Calm", "Energized", "Tired"];

export function MoodDial({ onSubmit, loading }: Props) {
  const [mood, setMood] = useState<string>("Happy");
  const [energy, setEnergy] = useState<number>(3);
  const [text, setText] = useState<string>("");

  // live moon preview for current energy
  const moonHtml = useMemo(() => {
    const phase = energyToPhase(energy);
    const tint = energyTint(energy);
    // seed doesn't matter for preview; use a fixed string
    return makeMoonSVG({ phase, tint, seed: `preview-${energy}`, size: 28 });
  }, [energy]);

  const canSubmit = !!mood && !loading;

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">How do you feel?</h2>

      {/* mood buttons (no emojis) */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {MOODS.map((m) => {
          const active = m === mood;
          return (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={[
                "flex items-center gap-2 rounded-xl px-4 py-3 text-left transition",
                active
                  ? "bg-white/10 border border-white/20 shadow-inner"
                  : "bg-white/0 border border-white/10 hover:bg-white/5",
              ].join(" ")}
            >
              {/* tiny live moon preview */}
              <span
                className="shrink-0"
                dangerouslySetInnerHTML={{ __html: moonHtml }}
              />
              <span className="font-medium">{m}</span>
            </button>
          );
        })}
      </div>

      {/* energy slider */}
      <div className="mb-2 text-sm opacity-80">Energy: {energy}</div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={energy}
        onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
        className="w-full accent-white"
      />

      {/* optional thought */}
      <label className="block mt-5 text-sm opacity-80">
        What’s on your mind? <span className="opacity-60">(optional)</span>
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={150}
        placeholder="A short thought, feeling, or moment (max 150 chars)"
        className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
        rows={3}
      />

      {/* submit */}
      <div className="mt-5">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit(mood, energy, text.trim() || undefined)}
          className={[
            "rounded-xl px-5 py-2.5 font-medium transition",
            canSubmit
              ? "bg-white text-black hover:opacity-90"
              : "bg-white/30 text-black/70 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? "Sending…" : "Send pulse"}
        </button>
      </div>
    </div>
  );
}
