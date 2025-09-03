import { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { listPulses } from '../lib/api';

export default function Explore() {
  const [center, setCenter] = useState<[number,number]>([48.8566, 2.3522]);
  const [connect, setConnect] = useState(true);
  const [pulses, setPulses] = useState<any[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      p => setCenter([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }, []);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try { const d = await listPulses(720); if (!stop) setPulses(d); } catch {}
      if (!stop) setTimeout(tick, 10_000);
    };
    tick();
    return () => { stop = true; };
  }, []);

  return (
    <div className="page">
      <div className="panel" style={{ marginBottom: 12 }}>
        <label className="switch">
          <input type="checkbox" checked={connect} onChange={e=>setConnect(e.target.checked)} />
          <span>Connect dots (same energy)</span>
        </label>
      </div>
      <MapView center={center} pulses={pulses} connect={connect} />
    </div>
  );
}
