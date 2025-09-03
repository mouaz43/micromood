import React from 'react';
import { phaseForMood, energyTint, moonSVG } from '../lib/moon';

type Mood = 'HAPPY' | 'SAD' | 'STRESSED' | 'CALM' | 'ENERGIZED' | 'TIRED';

export default function MoodDial(props: {
  mood: Mood; setMood: (m: Mood) => void;
  energy: number; setEnergy: (n: number) => void;
}) {
  const moods: Mood[] = ['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'];
  return (
    <div className="panel">
      <h2>How do you feel?</h2>
      <div className="grid">
        {moods.map(m => {
          const frac = phaseForMood(m, props.energy);
          const svg = moonSVG(frac, energyTint(props.energy));
          const active = props.mood === m;
          return (
            <button key={m} className={`pill ${active ? 'active' : ''}`} onClick={() => props.setMood(m)}>
              <span className="moon" dangerouslySetInnerHTML={{ __html: svg }} />
              <span>{label(m)}</span>
            </button>
          );
        })}
      </div>

      <div className="energy">
        <div>Energy: {props.energy}</div>
        <input
          type="range" min={1} max={5} value={props.energy}
          onChange={(e) => props.setEnergy(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function label(m: Mood) {
  return m[0] + m.slice(1).toLowerCase();
}
