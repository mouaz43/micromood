import { useState } from 'react';
import { createPulse, type Mood } from '../lib/api';
import { moonSVG, phaseFor, tintFor } from '../lib/moon';
import { addToken } from '../lib/utils';

const MOODS: Mood[] = ['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'];

export default function MoodForm(props: {
  center: [number,number];
  onSent: () => Promise<void> | void;
}) {
  const [mood, setMood] = useState<Mood>('HAPPY');
  const [energy, setEnergy] = useState(3);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { id, deleteToken } = await createPulse({
        lat: props.center[0],
        lng: props.center[1],
        mood, energy, text: text.trim() || undefined
      });
      addToken({ id, token: deleteToken, at: Date.now() });
      setText('');
      await props.onSent();
    } catch (e: any) {
      alert(`Failed: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <h2>How do you feel?</h2>
      <div className="grid">
        {MOODS.map(m => {
          const svg = moonSVG(phaseFor(m, energy), tintFor(energy), 38);
          const active = mood === m;
          return (
            <button key={m} className={`pill ${active?'active':''}`} onClick={()=>setMood(m)}>
              <span className="moon" dangerouslySetInnerHTML={{ __html: svg }} />
              <span>{m[0] + m.slice(1).toLowerCase()}</span>
            </button>
          );
        })}
      </div>
      <div className="energy">
        <div>Energy: {energy}</div>
        <input type="range" min={1} max={5} value={energy} onChange={e=>setEnergy(Number(e.target.value))} />
      </div>
      <div style={{marginTop:10}}>
        <label>What’s on your mind? (optional)</label>
        <textarea value={text} maxLength={150} onChange={e=>setText(e.target.value)}
          placeholder="A short thought, feeling, or moment (max 150 chars)" />
        <button onClick={send} disabled={busy}>{busy?'Sending…':'Send pulse'}</button>
      </div>
    </div>
  );
}
