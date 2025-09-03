import { useEffect, useState } from 'react';
import { listPulses, removePulse } from '../lib/api';
import { findToken } from '../lib/utils';

export default function Admin() {
  const [pulses, setPulses] = useState<any[]>([]);
  const [pass, setPass] = useState('');

  async function refresh() {
    setPulses(await listPulses(1440));
  }
  useEffect(() => { refresh(); }, []);

  async function del(p: any) {
    const tok = findToken(p.id) || '';
    try { await removePulse(p.id, tok); await refresh(); } catch (e:any) { alert(e?.message || e); }
  }

  return (
    <div className="page">
      <div className="panel" style={{ marginBottom: 10 }}>
        <h2>Admin</h2>
        <p>Owner password is not required for token deletes. (Server-side owner delete can be added if you want it.)</p>
      </div>
      <div className="panel">
        <h3>Recent pulses</h3>
        <div style={{display:'grid',gap:8}}>
          {pulses.map(p => (
            <div key={p.id} className="chip">
              <div>{p.mood.toLowerCase()} • energy {p.energy} • {new Date(p.createdAt).toLocaleString()}</div>
              <button onClick={()=>del(p)}>Delete</button>
            </div>
          ))}
          {pulses.length===0 && <div className="hint">No pulses yet.</div>}
        </div>
      </div>
    </div>
  );
}
