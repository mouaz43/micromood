import React, { useEffect, useState } from 'react';
import TopNav from './components/TopNav';
import LiveSky from './components/LiveSky';
import MoodDial from './components/MoodDial';
import MapView from './components/MapView';
import { getRecentMoods, sendMood, deleteMood, type Mood, type Pulse } from './lib/api';

export default function App() {
  const [center, setCenter] = useState<[number, number]>([50.1109, 8.6821]); // Frankfurt fallback
  const [points, setPoints] = useState<Pulse[]>([]);
  const [mood, setMood] = useState<Mood>('HAPPY');
  const [energy, setEnergy] = useState(3);
  const [text, setText] = useState('');
  const [myDeletes, setMyDeletes] = useState<Record<string|number,string>>({});
  const [connect, setConnect] = useState(false);
  const [ownerPass, setOwnerPass] = useState('');

  // get location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  // load recent
  useEffect(() => {
    (async () => {
      const data = await getRecentMoods(720);
      setPoints(data);
    })().catch(console.error);
  }, []);

  async function onSend() {
    try {
      const { latitude, longitude } = await getLocation(center);
      const r = await sendMood({ lat: latitude, lng: longitude, mood, energy, text: text.trim() || undefined });
      setMyDeletes(prev => ({ ...prev, [r.id]: r.deleteToken }));
      const fresh = await getRecentMoods(720);
      setPoints(fresh);
      setText('');
    } catch (e: any) {
      alert(`Failed to submit: ${e?.message ?? e}`);
    }
  }

  async function onDelete(id: number|string) {
    const token = myDeletes[id];
    try {
      await deleteMood(id, token, ownerPass || undefined);
      setPoints(await getRecentMoods(720));
    } catch (e: any) {
      alert(`Delete failed: ${e?.message ?? e}`);
    }
  }

  return (
    <div className="app">
      <LiveSky />
      <TopNav />

      <section className="hero">
        <h1>One sky. One moon. Many hearts.</h1>
        <p>
          Somewhere you can’t see them, strangers are looking up at the same moon.
          Each pulse you share becomes part of a constellation of feelings—proof
          that we’re never truly alone in the night.
        </p>
      </section>

      <main className="layout">
        <div className="left">
          <MoodDial mood={mood} setMood={setMood} energy={energy} setEnergy={setEnergy} />
          <div className="panel">
            <label>What’s on your mind? (optional)</label>
            <textarea
              maxLength={150}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="A short thought, feeling, or moment (max 150 chars)"
            />
            <button onClick={onSend}>Send pulse</button>
          </div>

          <div className="panel">
            <div className="row">
              <label className="switch">
                <input type="checkbox" checked={connect} onChange={e => setConnect(e.target.checked)} />
                <span>Connect dots with same energy</span>
              </label>
            </div>
            <div className="row">
              <input
                type="password"
                placeholder="Owner mode password (optional for deletes)"
                value={ownerPass}
                onChange={(e) => setOwnerPass(e.target.value)}
              />
            </div>
          </div>

          <div className="panel">
            <h3>Your recent pulses</h3>
            <div className="mine">
              {points.filter(p => myDeletes[p.id]).slice(0,10).map(p => (
                <div key={p.id} className="chip">
                  <span>{new Date(p.createdAt).toLocaleString()}</span>
                  <button onClick={() => onDelete(p.id)}>Delete</button>
                </div>
              ))}
              {Object.keys(myDeletes).length === 0 && <div className="hint">Send a pulse to see it here with a delete option.</div>}
            </div>
          </div>
        </div>

        <div className="right">
          <MapView center={center} points={points} connect={connect} />
        </div>
      </main>
    </div>
  );
}

function getLocation(fallback: [number,number]) {
  return new Promise<{ latitude: number; longitude: number }>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve({ latitude: fallback[0], longitude: fallback[1] })
    );
  });
}
