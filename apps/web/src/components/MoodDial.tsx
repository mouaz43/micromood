import React, { useState } from "react";
import { MoonIcon, phaseForMood, energyTint } from "../lib/moon";

type Props = {
  onSend: (mood: string, energy: number, text?: string) => void | Promise<void>;
  loading?: boolean;
};

const MOODS = ["Happy","Sad","Stressed","Calm","Energized","Tired"];

export default function MoodDial({ onSend, loading }: Props) {
  const [mood, setMood] = useState<string>("Happy");
  const [energy, setEnergy] = useState<number>(3);
  const [text, setText] = useState("");

  return (
    <div className="card">
      <h2 className="h1" style={{fontSize:22, marginBottom:10}}>How do you feel?</h2>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        {MOODS.map((m) => {
          const selected = m === mood;
          const tint = energyTint(energy);
          return (
            <button
              key={m}
              type="button"
              className={`mood-btn ${selected ? "active" : ""}`}
              onClick={() => setMood(m)}
            >
              <MoonIcon phaseFrac={phaseForMood(m)} tint={tint} ring={selected}/>
              <span>{m}</span>
            </button>
          );
        })}
      </div>

      <div style={{marginTop:16}}>
        <div className="small">Energy: {energy}</div>
        <input
          type="range" min={1} max={5} value={energy}
          onChange={(e)=> setEnergy(parseInt(e.target.value))}
          style={{width:"100%"}}
        />
      </div>

      <div style={{marginTop:14}}>
        <div className="small">What’s on your mind? (optional)</div>
        <textarea
          rows={3}
          placeholder="A short thought, feeling, or moment (max 150 chars)"
          maxLength={150}
          value={text}
          onChange={(e)=> setText(e.target.value)}
          className="card"
          style={{width:"100%", resize:"vertical"}}
        />
      </div>

      <div style={{display:"flex", justifyContent:"flex-end", marginTop:12}}>
        <button className="btn" disabled={loading} onClick={()=> onSend(mood.toLowerCase(), energy, text || undefined)}>
          {loading ? "Sending…" : "Send pulse"}
        </button>
      </div>
    </div>
  );
}
