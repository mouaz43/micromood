import TopNav from "./components/TopNav";
import MoodDial, { MoodKey } from "./components/MoodDial";
import MapView from "./components/MapView";
import React from "react";
import { sendMood } from "./lib/api";

export default function App() {
  const [mood, setMood] = React.useState<MoodKey | null>(null);
  const [energy, setEnergy] = React.useState(3);
  const [text, setText] = React.useState("");
  const [pos, setPos] = React.useState<{lat:number;lng:number} | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      p => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setMsg("Please allow location to send a mood.")
    );
  }, []);

  async function onSend() {
    if (!pos) { setMsg("Location required."); return; }
    if (!mood) { setMsg("Pick a mood first."); return; }
    try{
      setMsg("Sending…");
      await sendMood({ mood, energy, text: text.trim() || undefined, lat: pos.lat, lng: pos.lng });
      setText(""); setMsg("Pulse sent ✓");
      setTimeout(()=>setMsg(null), 1500);
    }catch(e:any){ setMsg("Failed: " + (e?.message || "Unexpected error")); }
  }

  return (
    <div className="content min-h-screen text-slate-200">
      <TopNav />

      {/* Hero */}
      <header className="mx-auto max-w-5xl px-6 pt-16 pb-10 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
          One sky. One moon. Many hearts.
        </h1>
        <p className="mt-6 text-slate-300 text-lg leading-7">
          Somewhere you can’t see them, strangers are looking up at the same moon.
          Each pulse you share becomes part of a constellation of feelings—proof
          that we’re never truly alone in the night.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-2 gap-8 px-6 pb-20">
        <section className="card p-6">
          <MoodDial onChange={setMood}/>
          <div className="mt-6">
            <div className="text-sm mb-2">Energy: {energy}</div>
            <input
              type="range" min={1} max={5} step={1}
              value={energy} onChange={e=>setEnergy(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="mt-6">
              <label className="text-sm block mb-2">What’s on your mind? <span className="opacity-60">(optional)</span></label>
              <textarea
                value={text} onChange={e=>setText(e.target.value)}
                maxLength={150}
                className="w-full rounded-xl bg-slate-900/50 ring-1 ring-white/10 p-3 outline-none"
                placeholder="A short thought, feeling, or moment (max 150 chars)"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button className="btn" onClick={onSend}>Send pulse</button>
              {msg && <span className="text-sm opacity-80">{msg}</span>}
            </div>
          </div>
        </section>

        <section className="card p-2">
          <MapView />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm opacity-70">
        Built by Mouaz Almjarkesh
      </footer>
    </div>
  );
}
