import { useEffect, useState } from 'react';
import MoodForm from '../components/MoodForm';
import MapView from '../components/MapView';
import { listPulses } from '../lib/api';

export default function Home() {
  const [center, setCenter] = useState<[number,number]>([50.1109, 8.6821]);
  const [pulses, setPulses] = useState<any[]>([]);
  const [connect, setConnect] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      p => setCenter([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }, []);

  async function refresh() {
    const data = await listPulses(720);
    setPulses(data);
  }

  useEffect(() => { refresh(); }, []);

  return (
    <>
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
          <MoodForm center={center} onSent={refresh} />
          <div className="panel">
            <label className="switch">
              <input type="checkbox" checked={connect} onChange={e=>setConnect(e.target.checked)} />
              <span>Connect dots with same energy</span>
            </label>
          </div>
        </div>
        <div className="right">
          <MapView center={center} pulses={pulses} connect={connect} />
        </div>
      </main>
    </>
  );
}
