import { useEffect, useMemo, useState } from "react";
import Sky from "./components/Sky";
import MapView from "./components/MapView";
import { sendMood } from "./lib/api";

type MoodKind = "Happy" | "Sad" | "Stressed" | "Calm" | "Energized" | "Tired";

const MOODS: MoodKind[] = ["Happy","Sad","Stressed","Calm","Energized","Tired"];

export default function App() {
  const [mood, setMood] = useState<MoodKind>("Happy");
  const [energy, setEnergy] = useState(3);
  const [text, setText] = useState("");
  const [center, setCenter] = useState<[number,number]>([50.1109, 8.6821]); // Frankfurt default
  const [owner, setOwner] = useState("");
  const ownerCode = useMemo(() => {
    const fromEnv = import.meta.env.VITE_OWNER_CODE as string | undefined;
    return owner || fromEnv || undefined;
  }, [owner]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setCenter([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }, []);

  async function onSend() {
    try {
      const pos = center;
      const { id, deleteToken } = await sendMood({
        mood, energy, text: text.trim() || undefined, lat: pos[0], lng: pos[1]
      });
      const tokens = JSON.parse(localStorage.getItem("mm_tokens") || "{}");
      tokens[id] = deleteToken; localStorage.setItem("mm_tokens", JSON.stringify(tokens));
      setText("");
      alert("Pulse sent ✨");
    } catch (e:any) {
      alert("Failed to send: " + (e?.message || "error"));
    }
  }

  return (
    <>
      <Sky />
      <div className="wrapper">
        <div className="panel" style={{padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div className="logo">MICROMOOD</div>
          <div className="small">Built by <a href="#" target="_blank" rel="noreferrer">Mouaz Almjarkesh</a></div>
        </div>

        <h1>One sky. One moon. Many hearts.</h1>
        <p className="sub">
          Somewhere you can’t see them, strangers are looking up at the same moon.
          Each pulse you share becomes part of a constellation of feelings—proof that we’re never truly alone in the night.
        </p>

        <div className="panel" style={{marginTop: 20}}>
          <div className="row">
            <div>
              <h3 style={{margin:"6px 0 10px"}}>How do you feel?</h3>
              <div style={{display:"grid", gap:12}}>
                {MOODS.map(m => (
                  <button key={m} className="btn" aria-pressed={mood===m} onClick={()=>setMood(m)}>
                    <span>{m}</span>
                    <span className="small">{mood===m ? "selected" : "tap"}</span>
                  </button>
                ))}
              </div>

              <div style={{marginTop:16}}>
                <div className="small">Energy: {energy}</div>
                <input type="range" min={1} max={5} value={energy}
                  onChange={e=>setEnergy(Number(e.target.value))} style={{width:"100%"}} />
              </div>

              <div style={{marginTop:16}}>
                <div className="small">What’s on your mind? (optional)</div>
                <textarea rows={3} value={text} onChange={e=>setText(e.target.value)}
                  placeholder="A short thought, feeling, or moment (max 150 chars)"
                  style={{width:"100%", background:"#0b1220", color:"#e5e7eb", border:"1px solid #111827", borderRadius:12, padding:12}} />
                <div style={{display:"flex", gap:10, alignItems:"center", marginTop:12}}>
                  <button className="btn" onClick={onSend} style={{justifyContent:"center"}}>Send pulse</button>
                  <span className="small">Owner code:</span>
                  <input value={owner} onChange={(e)=>setOwner(e.target.value)} placeholder="(optional)"
                    style={{background:"#0b1220", color:"#e5e7eb", border:"1px solid #111827", borderRadius:8, padding:"6px 8px"}} />
                </div>
              </div>
            </div>

            <div>
              <MapView center={center} ownerCode={ownerCode} />
              <div className="footer">Pins vanish automatically after ~24 hours.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
