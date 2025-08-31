import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopNav } from "./components/TopNav";
import { MoodDial } from "./components/MoodDial";
import { MapView } from "./components/MapView";
import { SiteFooter } from "./components/SiteFooter";
import {
  submitMood, fetchMoods,
  loadDeleteTokens, saveDeleteToken, removeDeleteToken,
  deleteMoodByToken, deleteMoodAsOwner,
  type MoodPoint
} from "./lib/api";

const OWNER_SECRET_KEY = "micromood_owner_secret";

export function App() {
  const [points, setPoints] = useState<MoodPoint[]>([]);
  const [coords, setCoords] = useState<{ lat:number; lng:number }>();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [ownerSecret, setOwnerSecret] = useState<string>(() => sessionStorage.getItem(OWNER_SECRET_KEY) || "");
  const ownerMode = !!ownerSecret;

  useEffect(() => { setTokens(loadDeleteTokens()); }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords(undefined)
    );
  }, []);

  async function refresh() {
    const r = await fetchMoods({ sinceMinutes: 720 });
    setPoints(r.data);
  }
  useEffect(() => { refresh().catch(console.error); }, []);

  const deletableIds = useMemo(() => new Set(Object.keys(tokens)), [tokens]);

  const onSubmit = async (mood:string, energy:number, text?:string) => {
    if (!coords) { setMsg("Please allow location to send a mood."); return; }
    setLoading(true);
    try {
      const r = await submitMood({ mood, energy, ...coords, message: text });
      saveDeleteToken(r.id, r.deleteToken);
      setTokens(loadDeleteTokens());
      try { await navigator.clipboard.writeText(r.deleteToken); } catch {}
      setMsg("Mood sent! Delete code copied to clipboard.");
      await refresh();
    } catch (e:any) {
      console.error(e); setMsg(e?.message || "Failed to send mood.");
    } finally {
      setLoading(false); setTimeout(()=>setMsg(null), 3000);
    }
  };

  const onDelete = async (id:string) => {
    try {
      if (ownerMode) {
        await deleteMoodAsOwner(id, ownerSecret);
      } else {
        const token = tokens[id];
        if (!token) { setMsg("No delete code found for this pulse."); return; }
        await deleteMoodByToken(id, token);
        removeDeleteToken(id);
        setTokens(loadDeleteTokens());
      }
      await refresh();
      setMsg("Pulse deleted.");
    } catch (e:any) {
      console.error(e); setMsg(e?.message || "Delete failed.");
    } finally {
      setTimeout(()=>setMsg(null), 2500);
    }
  };

  const toggleOwner = () => {
    if (ownerMode) {
      sessionStorage.removeItem(OWNER_SECRET_KEY);
      setOwnerSecret("");
      setMsg("Owner mode off");
      setTimeout(()=>setMsg(null), 1500);
    } else {
      const s = window.prompt("Enter ADMIN_SECRET to enable owner mode:");
      if (s && s.trim()) {
        sessionStorage.setItem(OWNER_SECRET_KEY, s.trim());
        setOwnerSecret(s.trim());
        setMsg("Owner mode on");
        setTimeout(()=>setMsg(null), 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <TopNav />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-6">
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Feel the world in real time.</h1>
              <button
                onClick={toggleOwner}
                className={`text-xs px-3 py-1 rounded border ${ownerMode ? "border-emerald-400/60 text-emerald-300" : "border-white/20 text-white/70"} hover:bg-white/5`}
                title="Owner mode lets you delete any pulse"
              >
                {ownerMode ? "Owner mode: ON" : "Owner mode: OFF"}
              </button>
            </div>

            <p className="opacity-80 max-w-prose">Share a mood with a short thought—anonymous, human, and alive.</p>
            <MoodDial onSubmit={onSubmit} loading={loading} />
            {msg && <div className="text-sm opacity-90">{msg}</div>}
            <div className="text-xs opacity-60">By sending a pulse you agree it’s anonymous and may be displayed on the map.</div>
            <SiteFooter />
          </motion.section>

          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.05 }}>
            <MapView
              points={points}
              deletableIds={deletableIds}
              ownerMode={ownerMode}
              onDelete={onDelete}
            />
          </motion.section>
        </div>
      </main>
    </div>
  );
}
